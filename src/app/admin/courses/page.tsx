import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { CourseTable } from '@/components/course/course-table';
import { getCourses } from '@/features/courses/actions/courses';

export default async function AdminCoursesPage() {
  const courses = await getCourses();

  return (
    <div className='custom-container my-6'>
      <PageHeader title='Courses'>
        <Button asChild>
          <Link href='/admin/courses/new'>New Course</Link>
        </Button>
      </PageHeader>

      <CourseTable courses={courses} />
    </div>
  );
}
