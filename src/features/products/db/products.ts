import { db } from '@/drizzle/db';
import { eq } from 'drizzle-orm';
import { ProductTable } from '@/drizzle/schema';
import { revalidateProductCache } from '@/features/products/db/cache';

export async function insertProduct(
  data: Partial<typeof ProductTable.$inferInsert> & { courseIds: string[] }
) {
  // TODO: Implement this function
  console.log('inserting product', data);
}

export async function editProduct(
  id: string,
  data: Partial<typeof ProductTable.$inferInsert> & { courseIds: string[] }
) {
  // TODO: Implement this function
  console.log('editing product', id, data);
}

export async function removeProduct(id: string) {
  const [deletedProduct] = await db
    .delete(ProductTable)
    .where(eq(ProductTable.id, id))
    .returning();

  if (!deletedProduct) throw new Error('Error deleting product');

  revalidateProductCache(deletedProduct.id);

  return deletedProduct;
}
