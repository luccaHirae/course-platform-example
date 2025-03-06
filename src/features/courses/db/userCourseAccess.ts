import { and, eq, inArray, isNull } from 'drizzle-orm';
import { db } from '@/drizzle/db';
import {
  ProductTable,
  PurchaseTable,
  UserCourseAccessTable,
} from '@/drizzle/schema';
import { revalidateUserCourseAccessCache } from '@/features/courses/db/cache/userCourseAccess';

export async function addUserCourseAccess(
  {
    userId,
    courseIds,
  }: {
    userId: string;
    courseIds: string[];
  },
  trx: Omit<typeof db, '$client'> = db
) {
  const accesses = await trx
    .insert(UserCourseAccessTable)
    .values(courseIds.map((courseId) => ({ courseId, userId })))
    .onConflictDoNothing()
    .returning();

  accesses.forEach(revalidateUserCourseAccessCache);

  return accesses;
}

export async function revokeUserCourseAccess(
  {
    userId,
    productId,
  }: {
    userId: string;
    productId: string;
  },
  trx: Omit<typeof db, '$client'> = db
) {
  const validPurchases = await trx.query.PurchaseTable.findMany({
    where: and(
      eq(PurchaseTable.userId, userId),
      isNull(PurchaseTable.refundedAt)
    ),
    with: {
      product: {
        with: {
          courseProduct: {
            columns: {
              courseId: true,
            },
          },
        },
      },
    },
  });

  const refundPurchase = await trx.query.ProductTable.findFirst({
    where: eq(ProductTable.id, productId),
    with: {
      courseProduct: {
        columns: {
          courseId: true,
        },
      },
    },
  });

  if (!refundPurchase) return;

  const validCourseIds = validPurchases.flatMap((purchase) =>
    purchase.product.courseProduct.map((cp) => cp.courseId)
  );

  const removeCourseIds = refundPurchase.courseProduct
    .flatMap((cp) => cp.courseId)
    .filter((courseId) => !validCourseIds.includes(courseId));

  const revokedAccesses = await trx
    .delete(UserCourseAccessTable)
    .where(
      and(
        eq(UserCourseAccessTable.userId, userId),
        inArray(UserCourseAccessTable.courseId, removeCourseIds)
      )
    )
    .returning();

  revokedAccesses.forEach(revalidateUserCourseAccessCache);

  return revokedAccesses;
}
