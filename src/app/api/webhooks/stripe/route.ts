import Stripe from 'stripe';
import { stripeServerClient } from '@/services/stripe/stripe-server';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle/db';
import { eq } from 'drizzle-orm';
import { ProductTable, UserTable } from '@/drizzle/schema';
import { insertPurchase } from '@/features/purchases/db/purchases';
import { addUserCourseAccess } from '@/features/courses/db/userCourseAccess';
import { env } from '@/data/env/server';

async function getProduct(id: string) {
  return db.query.ProductTable.findFirst({
    where: eq(ProductTable.id, id),
    columns: {
      id: true,
      priceInDollars: true,
      name: true,
      description: true,
      imageUrl: true,
    },
    with: {
      courseProduct: {
        columns: {
          courseId: true,
        },
      },
    },
  });
}

async function getUser(id: string) {
  return await db.query.UserTable.findFirst({
    where: eq(UserTable.id, id),
    columns: {
      id: true,
    },
  });
}

export async function processStripeCheckout(
  checkoutSession: Stripe.Checkout.Session
) {
  const userId = checkoutSession.metadata?.userId;
  const productId = checkoutSession.metadata?.productId;

  if (!userId || !productId) throw new Error('Missing metadata');

  const [product, user] = await Promise.all([
    getProduct(productId),
    await getUser(userId),
  ]);

  if (!product) throw new Error('Product not found');
  if (!user) throw new Error('User not found');

  const courseIds = product.courseProduct.map(
    (courseProduct) => courseProduct.courseId
  );

  db.transaction(async (trx) => {
    try {
      await addUserCourseAccess({ userId: user.id, courseIds }, trx);

      await insertPurchase(
        {
          stripeSessionId: checkoutSession.id,
          pricePaidInCents:
            checkoutSession.amount_total || product.priceInDollars * 100,
          productDetails: product,
          userId: user.id,
          productId: product.id,
        },
        trx
      );
    } catch (error) {
      trx.rollback();
      throw error;
    }
  });

  return productId;
}

export async function GET(request: NextRequest) {
  const stripeSessionId = request.nextUrl.searchParams.get('stripeSessionId');

  if (!stripeSessionId) redirect('/products/purchase-failure');

  let redirectUrl: string;

  try {
    const checkoutSession = await stripeServerClient.checkout.sessions.retrieve(
      stripeSessionId,
      {
        expand: ['line_items'],
      }
    );

    const productId = await processStripeCheckout(checkoutSession);

    redirectUrl = `/products/${productId}/purchase/success`;
  } catch (error) {
    console.error(error);
    redirectUrl = '/products/purchase-failure';
  }

  return NextResponse.redirect(new URL(redirectUrl, request.url));
}

export async function POST(request: NextRequest) {
  const event = stripeServerClient.webhooks.constructEvent(
    await request.text(),
    request.headers.get('stripe-signature')!,
    env.STRIPE_WEBHOOK_SECRET
  );

  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      try {
        await processStripeCheckout(event.data.object);
      } catch (error) {
        console.error(error);
        return new Response(null, { status: 500 });
      }
    }
  }

  return new Response(null, { status: 200 });
}
