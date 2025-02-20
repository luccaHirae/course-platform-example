import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminCoursesPage() {
  return (
    <div className='custom-container my-6'>
      <PageHeader title='Courses'>
        <Button asChild>
          <Link href='/admin/courses/new'>New Course</Link>
        </Button>
      </PageHeader>

      <p>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Cumque, neque!
      </p>
    </div>
  );
}
