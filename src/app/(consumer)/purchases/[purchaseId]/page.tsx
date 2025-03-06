import Link from 'next/link';
import { Fragment, Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/services/clerk';
import {
  getPurchase,
  getStripeDetails,
} from '@/features/purchases/db/purchases';
import { LoadingSpinner } from '@/components/loading-spinner';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, formatDate, formatPrice } from '@/lib/utils';

export default async function PurchasePage({
  params,
}: {
  params: Promise<{ purchaseId: string }>;
}) {
  const { purchaseId } = await params;

  return (
    <div className='custom-container my-6'>
      <Suspense fallback={<LoadingSpinner className='size-36 mx-auto' />}>
        <SuspenceBoundary purchaseId={purchaseId} />
      </Suspense>
    </div>
  );
}

async function SuspenceBoundary({ purchaseId }: { purchaseId: string }) {
  const { userId, redirectToSignIn, user } = await getCurrentUser({
    allData: true,
  });

  if (!user || !userId) return redirectToSignIn();

  const purchase = await getPurchase({ userId, id: purchaseId });

  if (!purchase) return notFound();

  const { receiptUrl, pricingRows } = await getStripeDetails(
    purchase.stripeSessionId,
    purchase.pricePaidInCents,
    purchase.refundedAt != null
  );

  return (
    <>
      <PageHeader title={purchase.productDetails.name}>
        {receiptUrl && (
          <Button asChild variant='outline'>
            <Link href={receiptUrl} target='_blank'>
              View Receipt
            </Link>
          </Button>
        )}
      </PageHeader>

      <Card>
        <CardHeader className='pb-4'>
          <div className='flex justify-between items-start gap-4'>
            <div className='flex flex-col gap-1'>
              <CardTitle>Receipt</CardTitle>

              <CardDescription>ID: {purchaseId}</CardDescription>
            </div>

            <Badge className='text-base'>
              {purchase.refundedAt ? 'Refunded' : 'Paid'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className='pb-4 grid grid-cols-2 gap-8 border-t pt-4'>
          <div>
            <label className='text-sm text-muted-foreground'>Date</label>
            <div>{formatDate(purchase.createdAt)}</div>
          </div>

          <div>
            <label className='text-sm text-muted-foreground'>Product</label>
            <div>{purchase.productDetails.name}</div>
          </div>

          <div>
            <label className='text-sm text-muted-foreground'>Customer</label>
            <div>{user.name}</div>
          </div>

          <div>
            <label className='text-sm text-muted-foreground'>Seller</label>
            <div>Admin</div>
          </div>
        </CardContent>

        <CardFooter className='grid grid-cols-2 gap-y-4 gap-x-8 border-t pt-4'>
          {pricingRows.map(({ label, amountInDollars, isBold }) => (
            <Fragment key={label}>
              <div className={cn(isBold && 'font-bold')}>{label}</div>
              <div className={cn('justify-self-end', isBold && 'font-bold')}>
                {formatPrice(amountInDollars, { showZeroAsNumber: true })}
              </div>
            </Fragment>
          ))}
        </CardFooter>
      </Card>
    </>
  );
}
