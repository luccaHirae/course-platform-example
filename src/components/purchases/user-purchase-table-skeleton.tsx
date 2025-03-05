import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SkeletonArray, SkeletonButton, SkeletonText } from '../skeleton';

export function UserPurchaseTableSkeleton() {
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
        <SkeletonArray length={3}>
          <TableRow>
            <TableCell>
              <div className='felx items-center gap-4'>
                <div className='size-12 bg-secondary animate-pulse rounded'></div>

                <div className='flex flex-col gap-1'>
                  <SkeletonText className='w-36' />

                  <SkeletonText className='w-3/4' />
                </div>
              </div>
            </TableCell>

            <TableCell>
              <SkeletonText className='w-12' />
            </TableCell>

            <TableCell>
              <SkeletonButton />
            </TableCell>
          </TableRow>
        </SkeletonArray>
      </TableBody>
    </Table>
  );
}
