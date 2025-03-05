import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getPublicSuccessPurchaseProduct } from '@/features/products/actions/products';

export default async function PurchaseSuccessPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  const product = await getPublicSuccessPurchaseProduct(productId);

  if (!product) return notFound();

  return (
    <div className='custom-container my-6'>
      <div className='flex gap-16 items-center justify-between'>
        <div className='flex flex-col gap-4 items-start'>
          <div className='text-3xl font-semibold'>Purchase Successful</div>

          <div className='text-xl'>
            Thank you for purchasing {product.name}.
          </div>

          <Button asChild className='text-xl h-auto py-4 px-8 rounded-lg'>
            <Link href='/courses'>View My Courses</Link>
          </Button>
        </div>

        <div className='relative aspect-video max-w-lg flex-grow'>
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className='object-contain rounded-xl'
          />
        </div>
      </div>
    </div>
  );
}
