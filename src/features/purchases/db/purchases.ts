import { db } from '@/drizzle/db';
import { PurchaseTable } from '@/drizzle/schema';
import {
  getPurchaseUserTag,
  revalidatePurchaseCache,
} from '@/features/purchases/db/cache';
import { desc, eq } from 'drizzle-orm';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';

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
