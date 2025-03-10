'use server';

import { db } from '@/drizzle/db';
import { getCurrentUser } from '@/services/clerk';
import { canRefundPurchases } from '@/features/purchases/permissions/purchases';
import { stripeServerClient } from '@/services/stripe/stripe-server';
import { updatePurchase } from '@/features/purchases/db/purchases';
import { revokeUserCourseAccess } from '@/features/courses/db/userCourseAccess';
import { count, countDistinct, isNotNull, sql, sum } from 'drizzle-orm';
import { PurchaseTable } from '@/drizzle/schema';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { getPurchaseGlobalTag } from '@/features/purchases/db/cache';

export async function refundPurchase(id: string) {
  if (!canRefundPurchases(await getCurrentUser())) {
    return {
      error: true,
      message: "You don't have permission to refund purchases",
    };
  }

  const data = await db.transaction(async (trx) => {
    const refundedPurchase = await updatePurchase(
      id,
      { refundedAt: new Date() },
      trx
    );
    const session = await stripeServerClient.checkout.sessions.retrieve(
      refundedPurchase.stripeSessionId
    );

    if (!session.payment_intent) {
      trx.rollback();

      return {
        error: true,
        message: 'No payment intent found for this purchase',
      };
    }

    try {
      await stripeServerClient.refunds.create({
        payment_intent:
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent.id,
      });

      await revokeUserCourseAccess(refundedPurchase, trx);
    } catch (error) {
      console.error(error);

      trx.rollback();

      return {
        error: true,
        message: 'Failed to refund purchase',
      };
    }
  });

  return (
    data ?? {
      error: false,
      message: 'Successfully refunded purchase',
    }
  );
}

export async function getPurchaseDetails() {
  'use cache';

  cacheTag(getPurchaseGlobalTag());

  const data = await db
    .select({
      totalSales: sql<number>`COALESCE(${sum(
        PurchaseTable.pricePaidInCents
      )}, 0)`.mapWith(Number),
      totalPurchases: count(PurchaseTable.id),
      totalUsers: countDistinct(PurchaseTable.userId),
      isRefund: isNotNull(PurchaseTable.refundedAt),
    })
    .from(PurchaseTable)
    .groupBy((table) => table.isRefund);

  const [refundData] = data.filter((row) => row.isRefund);
  const [salesData] = data.filter((row) => !row.isRefund);

  const netSales = (salesData?.totalSales ?? 0) / 100;
  const totalRefunds = (refundData?.totalSales ?? 0) / 100;
  const netPurchases = salesData?.totalPurchases ?? 0;
  const refundedPurchases = refundData?.totalPurchases ?? 0;
  const averageNetPurchasesPerCustomer =
    salesData?.totalUsers != null && salesData.totalUsers > 0
      ? netPurchases / salesData.totalUsers
      : 0;

  return {
    netSales,
    totalRefunds,
    netPurchases,
    refundedPurchases,
    averageNetPurchasesPerCustomer,
  };
}
