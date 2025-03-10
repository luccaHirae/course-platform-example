'use server';

import { db } from '@/drizzle/db';
import { getCurrentUser } from '@/services/clerk';
import { canRefundPurchases } from '@/features/purchases/permissions/purchases';
import { stripeServerClient } from '@/services/stripe/stripe-server';
import { updatePurchase } from '@/features/purchases/db/purchases';
import { revokeUserCourseAccess } from '@/features/courses/db/userCourseAccess';
import { count, countDistinct, isNotNull, sql, sum } from 'drizzle-orm';
import {
  CourseSectionTable,
  CourseTable,
  LessonTable,
  ProductTable,
  PurchaseTable,
  UserCourseAccessTable,
} from '@/drizzle/schema';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { getPurchaseGlobalTag } from '@/features/purchases/db/cache';
import { getUserCourseAccessGlobalTag } from '@/features/courses/db/cache/userCourseAccess';
import { getCourseGlobalTag } from '@/features/courses/db/cache/courses';
import { getProductGlobalTag } from '@/features/products/db/cache';
import { getLessonGlobalTag } from '@/features/lessons/db/cache/lessons';
import { getCourseSectionGlobalTag } from '@/features/courseSections/db/cache';

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

export async function getTotalStudents() {
  'use cache';

  cacheTag(getUserCourseAccessGlobalTag());

  const [data] = await db
    .select({ totalStudents: countDistinct(PurchaseTable.userId) })
    .from(PurchaseTable);

  if (data == null) return 0;

  return data.totalStudents;
}

export async function getTotalCourses() {
  'use cache';

  cacheTag(getCourseGlobalTag());

  const [data] = await db
    .select({ totalCourses: count(CourseTable.id) })
    .from(UserCourseAccessTable);

  if (data == null) return 0;

  return data.totalCourses;
}

export async function getTotalProducts() {
  'use cache';

  cacheTag(getProductGlobalTag());

  const [data] = await db
    .select({ totalProducts: count(ProductTable.id) })
    .from(ProductTable);

  if (data == null) return 0;

  return data.totalProducts;
}

export async function getTotalLessons() {
  'use cache';

  cacheTag(getLessonGlobalTag());

  const [data] = await db
    .select({ totalLessons: count(LessonTable.id) })
    .from(LessonTable);

  if (data == null) return 0;

  return data.totalLessons;
}

export async function getTotalCourseSections() {
  'use cache';

  cacheTag(getCourseSectionGlobalTag());

  const [data] = await db
    .select({ totalCourseSections: count(CourseSectionTable.id) })
    .from(CourseSectionTable);

  if (data == null) return 0;

  return data.totalCourseSections;
}
