import Link from 'next/link';
import Image from 'next/image';
import { EyeIcon, LockIcon, Trash2 } from 'lucide-react';
import { ProductStatus } from '@/drizzle/schema';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatPlural, formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ActionButton } from '@/components/action-button';
import { Badge } from '@/components/ui/badge';
import { deleteProduct } from '@/features/products/actions/products';

function getStatusIcon(status: ProductStatus) {
  const Icon = {
    public: EyeIcon,
    private: LockIcon,
  }[status];

  return <Icon className='size-4' />;
}

export function ProductTable({
  products,
}: {
  products: Array<{
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    priceInDollars: number;
    status: ProductStatus;
    coursesCount: number;
    customersCount: number;
  }>;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            {formatPlural(products.length, {
              singular: 'product',
              plural: 'products',
            })}
          </TableHead>

          <TableHead>Customers</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              <div className='flex items-center gap-4'>
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={192}
                  height={192}
                  className='object-cover rounded size-12'
                />

                <div className='flex flex-col gap-1'>
                  <div className='font-semibold'>{product.name}</div>

                  <div className='text-muted-foreground'>
                    {formatPlural(product.coursesCount, {
                      singular: 'course',
                      plural: 'courses',
                    })}{' '}
                    • {formatPrice(product.priceInDollars)}
                  </div>
                </div>
              </div>
            </TableCell>

            <TableCell>{product.customersCount}</TableCell>

            <TableCell>
              <Badge className='inline-flex items-center gap-2'>
                {getStatusIcon(product.status)}
                {product.status}
              </Badge>
            </TableCell>

            <TableCell>
              <div className='flex gap-2'>
                <Button asChild>
                  <Link href={`/admin/products/${product.id}/edit`}>Edit</Link>
                </Button>

                <ActionButton
                  variant='destructiveOutline'
                  action={deleteProduct.bind(null, product.id)}
                  requireAreYouSure
                >
                  <Trash2 />
                  <span className='sr-only'>Delete</span>
                </ActionButton>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
