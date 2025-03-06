'use server';

import { db } from '@/drizzle/db';
import { getCurrentUser } from '@/services/clerk';
import { canRefundPurchases } from '@/features/purchases/permissions/purchases';
import { stripeServerClient } from '@/services/stripe/stripe-server';
import { updatePurchase } from '@/features/purchases/db/purchases';
import { revokeUserCourseAccess } from '@/features/courses/db/userCourseAccess';

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
