import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { ProductForm } from '@/components/products/product-form';
import { getCoursesForProducts } from '@/features/courses/actions/courses';
import { getProduct } from '@/features/products/actions/products';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const product = await getProduct(productId);

  if (!product) return notFound();

  return (
    <div className='custom-container my-6'>
      <PageHeader title='New Product' />

      <ProductForm
        courses={await getCoursesForProducts()}
        product={{
          ...product,
          courseIds: product?.courseProduct.map((c) => c.courseId),
        }}
      />
    </div>
  );
}
