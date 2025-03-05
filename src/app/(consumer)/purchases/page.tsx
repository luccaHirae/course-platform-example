import Link from 'next/link';
import { Suspense } from 'react';
import { getCurrentUser } from '@/services/clerk';
import { getPurchases } from '@/features/purchases/db/purchases';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { UserPurchaseTableSkeleton } from '@/components/purchases/user-purchase-table-skeleton';
import { UserPurchaseTable } from '@/components/purchases/user-purchase-table';

export default function PurchasesPage() {
  return (
    <div className='custom-container my-6'>
      <PageHeader title='Purchase History' />

      <Suspense fallback={<UserPurchaseTableSkeleton />}>
        <SuspenceBoundary />
      </Suspense>
    </div>
  );
}

async function SuspenceBoundary() {
  const { userId, redirectToSignIn } = await getCurrentUser();

  if (!userId) return redirectToSignIn();

  const purchases = await getPurchases(userId);

  if (purchases.length === 0) {
    return (
      <div className='flex flex-col gap-2 items-start'>
        You haven&apos;t made any purchases yet.
        <Button asChild size='lg'>
          <Link href='/'>Browse Courses</Link>
        </Button>
      </div>
    );
  }

  return <UserPurchaseTable purchases={purchases} />;
}
