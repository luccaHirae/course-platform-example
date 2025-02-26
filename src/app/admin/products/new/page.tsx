import { PageHeader } from '@/components/page-header';
import { ProductForm } from '@/components/products/product-form';
import { getCoursesForProducts } from '@/features/courses/actions/courses';

export default async function NewProductPage() {
  return (
    <div className='custom-container my-6'>
      <PageHeader title='New Product' />

      <ProductForm courses={await getCoursesForProducts()} />
    </div>
  );
}
