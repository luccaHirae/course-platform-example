import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { ProductTable } from '@/components/products/product-table';
import { getProducts } from '@/features/products/actions/products';

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className='custom-container my-6'>
      <PageHeader title='Products'>
        <Button asChild>
          <Link href='/admin/products/new'>New Product</Link>
        </Button>
      </PageHeader>

      <ProductTable products={products} />
    </div>
  );
}
