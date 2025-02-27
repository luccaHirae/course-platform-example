import { ProductCard } from '@/components/products/product-card';
import { getPublicProducts } from '@/features/products/actions/products';

export default async function Home() {
  const products = await getPublicProducts();

  return (
    <main className='custom-container my-6'>
      <div className='grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4'>
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </main>
  );
}
