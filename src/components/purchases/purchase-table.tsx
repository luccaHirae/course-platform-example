import Image from 'next/image';
import { formatDate, formatPlural, formatPrice } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ActionButton } from '@/components/action-button';
import { refundPurchase } from '@/features/purchases/actions/purchases';

export function PurchaseTable({
  purchases,
}: {
  purchases: Array<{
    id: string;
    pricePaidInCents: number;
    createdAt: Date;
    refundedAt: Date | null;
    productDetails: {
      name: string;
      imageUrl: string;
    };
    user: {
      name: string;
    };
  }>;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            {formatPlural(purchases.length, {
              singular: 'Sale',
              plural: 'Sales',
            })}
          </TableHead>
          <TableHead>Customer Name</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {purchases.map((purchase) => (
          <TableRow key={purchase.id}>
            <TableCell>
              <div className='flex items-center gap-4'>
                <Image
                  className='object-cover rounded size-12'
                  src={purchase.productDetails.imageUrl}
                  alt={purchase.productDetails.name}
                  width={192}
                  height={192}
                />

                <div className='flex flex-col gap-1'>
                  <div className='font-semibold'>
                    {purchase.productDetails.name}
                  </div>

                  <div className='text-muted-foreground'>
                    {formatDate(purchase.createdAt)}
                  </div>
                </div>
              </div>
            </TableCell>

            <TableCell>{purchase.user.name}</TableCell>

            <TableCell>
              {purchase.refundedAt ? (
                <Badge variant='outline'>Refunded</Badge>
              ) : (
                formatPrice(purchase.pricePaidInCents / 100)
              )}
            </TableCell>

            <TableCell>
              {!purchase.refundedAt && purchase.pricePaidInCents > 0 && (
                <ActionButton
                  action={refundPurchase.bind(null, purchase.id)}
                  variant='destructiveOutline'
                  requireAreYouSure
                >
                  Refund
                </ActionButton>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
