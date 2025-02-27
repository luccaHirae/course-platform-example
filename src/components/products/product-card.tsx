import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { getUserCoupon } from '@/lib/user-country-headers';

export function ProductCard({
  id,
  imageUrl,
  name,
  priceInDollars,
  description,
}: {
  id: string;
  imageUrl: string;
  name: string;
  priceInDollars: number;
  description: string;
}) {
  return (
    <Card className='overflow-hidden flex flex-col w-full max-w-[500px] mx-auto'>
      <div className='relative aspect-video w-full'>
        <Image src={imageUrl} alt={name} fill className='object-cover' />
      </div>

      <CardHeader className='space-y-0'>
        <CardDescription>
          <Suspense fallback={formatPrice(priceInDollars)}>
            <Price price={priceInDollars} />
          </Suspense>
        </CardDescription>

        <CardTitle className='text-xl'>{name}</CardTitle>
      </CardHeader>

      <CardContent>
        <p className='line-clamp-3'>{description}</p>
      </CardContent>

      <CardFooter className='mt-auto'>
        <Button className='w-full text-muted py-6' asChild>
          <Link href={`/products/${id}`}>View Course</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

async function Price({ price }: { price: number }) {
  const coupon = await getUserCoupon();

  if (price === 0 || !coupon) return formatPrice(price);

  return (
    <div className='flex items-baseline gap-2'>
      <div className='line-through text-xs opacity-50'>
        {formatPrice(price)}
      </div>

      <div>{formatPrice(price * (1 - coupon.discountPercentage))}</div>
    </div>
  );
}
