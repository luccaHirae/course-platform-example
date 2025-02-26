import { PageHeader } from '@/components/page-header';
import { ProductForm } from '@/components/products/product-form';
import { db } from '@/drizzle/db';
import { CourseTable } from '@/drizzle/schema';
import { getCourseGlobalTag } from '@/features/courses/db/cache/courses';
import { asc } from 'drizzle-orm';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';

export default async function NewProductPage() {
  return (
    <div className='custom-container my-6'>
      <PageHeader title='New Product' />

      <ProductForm courses={await getCourses()} />
    </div>
  );
}

async function getCourses() {
  'use cache';

  cacheTag(getCourseGlobalTag());

  return db.query.CourseTable.findMany({
    orderBy: asc(CourseTable.name),
    columns: { id: true, name: true },
  });
}
