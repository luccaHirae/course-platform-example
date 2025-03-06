import { PageHeader } from '@/components/page-header';
import { PurchaseTable } from '@/components/purchases/purchase-table';
import { getSales } from '@/features/purchases/db/purchases';

export default async function SalesPage() {
  const purchases = await getSales();

  return (
    <div className='custom-container my-6'>
      <PageHeader title='Sales' />

      <PurchaseTable purchases={purchases} />
    </div>
  );
}
