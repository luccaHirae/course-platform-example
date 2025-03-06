import Stripe from 'stripe';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { db } from '@/drizzle/db';
import { and, desc, eq } from 'drizzle-orm';
import { PurchaseTable } from '@/drizzle/schema';
import {
  getPurchaseIdTag,
  getPurchaseUserTag,
  revalidatePurchaseCache,
} from '@/features/purchases/db/cache';
import { stripeServerClient } from '@/services/stripe/stripe-server';

export async function insertPurchase(
  data: typeof PurchaseTable.$inferInsert,
  trx: Omit<typeof db, '$client'> = db
) {
  const details = data.productDetails;

  const [newPurchase] = await trx
    .insert(PurchaseTable)
    .values({
      ...data,
      productDetails: {
        name: details.name,
        description: details.description,
        imageUrl: details.imageUrl,
      },
    })
    .onConflictDoNothing()
    .returning();

  if (newPurchase) revalidatePurchaseCache(newPurchase);

  return newPurchase;
}

export async function getPurchases(userId: string) {
  'use cache';

  cacheTag(getPurchaseUserTag(userId));

  return db.query.PurchaseTable.findMany({
    columns: {
      id: true,
      pricePaidInCents: true,
      refundedAt: true,
      productDetails: true,
      createdAt: true,
    },
    where: eq(PurchaseTable.userId, userId),
    orderBy: desc(PurchaseTable.createdAt),
  });
}

export async function getPurchase({
  userId,
  id,
}: {
  userId: string;
  id: string;
}) {
  'use cache';

  cacheTag(getPurchaseIdTag(id));

  return await db.query.PurchaseTable.findFirst({
    columns: {
      pricePaidInCents: true,
      refundedAt: true,
      productDetails: true,
      createdAt: true,
      stripeSessionId: true,
    },
    where: and(eq(PurchaseTable.id, id), eq(PurchaseTable.userId, userId)),
  });
}

export async function getStripeDetails(
  stripeSessionId: string,
  pricePaidInCents: number,
  isRefunded: boolean
) {
  const { payment_intent, total_details, amount_total, amount_subtotal } =
    await stripeServerClient.checkout.sessions.retrieve(stripeSessionId, {
      expand: [
        'payment_intent.latest_charge',
        'total_details.breakdown.discounts',
      ],
    });

  const renfundedAmount =
    typeof payment_intent !== 'string' &&
    typeof payment_intent?.latest_charge !== 'string'
      ? payment_intent?.latest_charge?.amount_refunded
      : isRefunded
      ? pricePaidInCents
      : undefined;

  return {
    receiptUrl: getReceiptUrl(payment_intent),
    pricingRows: getPricingRows(total_details, {
      total: (amount_total ?? pricePaidInCents) - (renfundedAmount ?? 0),
      subtotal: amount_subtotal ?? pricePaidInCents,
      refund: renfundedAmount,
    }),
  };
}

function getReceiptUrl(payment_intent: Stripe.PaymentIntent | string | null) {
  if (
    typeof payment_intent === 'string' ||
    typeof payment_intent?.latest_charge === 'string'
  )
    return;

  return payment_intent?.latest_charge?.receipt_url;
}

function getPricingRows(
  totalDetails: Stripe.Checkout.Session.TotalDetails | null,
  {
    total,
    subtotal,
    refund,
  }: {
    total: number;
    subtotal: number;
    refund?: number;
  }
) {
  const pricingRows: Array<{
    label: string;
    amountInDollars: number;
    isBold?: boolean;
  }> = [];

  if (totalDetails?.breakdown != null) {
    totalDetails.breakdown.discounts.forEach((element) => {
      pricingRows.push({
        label: `${element.discount.coupon.name} (${element.discount.coupon.percent_off}$ off)`,
        amountInDollars: element.amount / -100,
      });
    });
  }

  if (refund) {
    pricingRows.push({
      label: 'Refund',
      amountInDollars: refund / -100,
    });
  }

  if (pricingRows.length === 0) {
    return [
      {
        label: 'Total',
        amountInDollars: total / 100,
        isBold: true,
      },
    ];
  }

  return [
    {
      label: 'Subtotal',
      amountInDollars: subtotal / 100,
    },
    ...pricingRows,
    {
      label: 'Total',
      amountInDollars: total / 100,
      isBold: true,
    },
  ];
}
