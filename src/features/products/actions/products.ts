'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { asc, countDistinct, eq } from 'drizzle-orm';
import { db } from '@/drizzle/db';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import {
  CourseProductTable,
  ProductTable,
  PurchaseTable,
} from '@/drizzle/schema';
import { getCurrentUser } from '@/services/clerk';
import {
  getProductGlobalTag,
  getProductIdTag,
} from '@/features/products/db/cache';
import {
  canCreateProducts,
  canDeleteProducts,
  canUpdateProducts,
  wherePublicProducts,
} from '@/features/products/permissions/products';
import {
  editProduct,
  insertProduct,
  removeProduct,
} from '@/features/products/db/products';
import { productSchema } from '@/schemas/products';

export async function getPublicProducts() {
  'use cache';

  cacheTag(getProductGlobalTag());

  return db.query.ProductTable.findMany({
    columns: {
      id: true,
      name: true,
      description: true,
      priceInDollars: true,
      imageUrl: true,
    },
    where: wherePublicProducts,
    orderBy: asc(ProductTable.name),
  });
}

export async function getProducts() {
  'use cache';

  cacheTag(getProductGlobalTag());

  return db
    .select({
      id: ProductTable.id,
      name: ProductTable.name,
      status: ProductTable.status,
      priceInDollars: ProductTable.priceInDollars,
      description: ProductTable.description,
      imageUrl: ProductTable.imageUrl,
      coursesCount: countDistinct(CourseProductTable.courseId),
      customersCount: countDistinct(PurchaseTable.userId),
    })
    .from(ProductTable)
    .leftJoin(PurchaseTable, eq(PurchaseTable.productId, ProductTable.id))
    .leftJoin(
      CourseProductTable,
      eq(CourseProductTable.productId, ProductTable.id)
    )
    .orderBy(asc(ProductTable.name))
    .groupBy(ProductTable.id);
}

export async function getProduct(id: string) {
  'use cache';

  cacheTag(getProductIdTag(id));

  return db.query.ProductTable.findFirst({
    columns: {
      id: true,
      name: true,
      description: true,
      priceInDollars: true,
      status: true,
      imageUrl: true,
    },
    where: eq(ProductTable.id, id),
    with: {
      courseProduct: {
        columns: {
          courseId: true,
        },
      },
    },
  });
}

export async function createProduct(unsafeData: z.infer<typeof productSchema>) {
  const { success, data } = productSchema.safeParse(unsafeData);

  if (!success || !canCreateProducts(await getCurrentUser())) {
    return {
      error: true,
      message: 'Error creating product',
    };
  }

  await insertProduct(data);

  redirect('/admin/products');
}

export async function updateProduct(
  id: string,
  unsafeData: z.infer<typeof productSchema>
) {
  const { success, data } = productSchema.safeParse(unsafeData);

  if (!success || !canUpdateProducts(await getCurrentUser())) {
    return {
      error: true,
      message: 'Error updating product',
    };
  }

  await editProduct(id, data);

  redirect('/admin/products');
}

export async function deleteProduct(id: string) {
  if (!canDeleteProducts(await getCurrentUser())) {
    return {
      error: true,
      message: 'Error deleting product',
    };
  }

  await removeProduct(id);

  return {
    error: false,
    message: 'Successfully deleted product',
  };
}
