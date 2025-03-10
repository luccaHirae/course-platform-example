import { ReactNode } from 'react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatNumber, formatPrice } from '@/lib/utils';
import {
  getPurchaseDetails,
  getTotalCourses,
  getTotalCourseSections,
  getTotalLessons,
  getTotalProducts,
  getTotalStudents,
} from '@/features/purchases/actions/purchases';

export default async function AdminPage() {
  const {
    averageNetPurchasesPerCustomer,
    netPurchases,
    netSales,
    refundedPurchases,
    totalRefunds,
  } = await getPurchaseDetails();

  return (
    <div className='custom-container my-6'>
      <div className='grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 md:grid-cols-4 gap-4'>
        <StatCard title='Net Sales'>
          {formatPrice(netSales, { showZeroAsNumber: true })}
        </StatCard>

        <StatCard title='Refunded Sales'>
          {formatPrice(totalRefunds, { showZeroAsNumber: true })}
        </StatCard>

        <StatCard title='Un-Refunded Purchases'>
          {formatNumber(netPurchases)}
        </StatCard>

        <StatCard title='Refunded Purchases'>
          {formatNumber(refundedPurchases)}
        </StatCard>

        <StatCard title='Purchase Per Customer'>
          {formatNumber(averageNetPurchasesPerCustomer, {
            maximumFractionDigits: 2,
          })}
        </StatCard>

        <StatCard title='Students'>
          {formatNumber(await getTotalStudents())}
        </StatCard>

        <StatCard title='Products'>
          {formatNumber(await getTotalProducts())}
        </StatCard>

        <StatCard title='Courses'>
          {formatNumber(await getTotalCourses())}
        </StatCard>

        <StatCard title='Course Sections'>
          {formatNumber(await getTotalCourseSections())}
        </StatCard>

        <StatCard title='Lessons'>
          {formatNumber(await getTotalLessons())}
        </StatCard>
      </div>
    </div>
  );
}

function StatCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader className='text-center'>
        <CardDescription>{title}</CardDescription>

        <CardTitle>{children}</CardTitle>
      </CardHeader>
    </Card>
  );
}
