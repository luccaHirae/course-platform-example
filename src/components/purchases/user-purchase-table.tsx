import Image from 'next/image';
import Link from 'next/link';
import { formatDate, formatPrice } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function UserPurchaseTable({
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
  }>;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
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

            <TableCell>
              {purchase.refundedAt ? (
                <Badge variant='outline'>Refunded</Badge>
              ) : (
                formatPrice(purchase.pricePaidInCents / 100)
              )}
            </TableCell>

            <TableCell>
              <Badge variant='outline' asChild>
                <Link href={`/purchases/${purchase.id}`}>Details</Link>
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
