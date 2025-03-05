import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PurchaseFailurePage() {
  return (
    <div className='custom-container my-6'>
      <div className='flex flex-col gap-4 items-start'>
        <div className='text-3xl font-semibold'>Purchase Failed</div>

        <div className='text-xl'>
          There was a problem purchasing your product.
        </div>

        <Button asChild className='text-xl h-auto py-4 px-8 rounded-lg'>
          <Link href='/'>Try Again</Link>
        </Button>
      </div>
    </div>
  );
}
