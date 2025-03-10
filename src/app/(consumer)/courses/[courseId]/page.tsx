import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { getCourseDetails } from '@/features/courses/actions/courses';

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await getCourseDetails(courseId);

  if (!course) return notFound();

  return (
    <div className='custom-container my-6'>
      <PageHeader className='mb-2' title={course.name} />

      <p className='text-muted-foreground'>{course.description}</p>
    </div>
  );
}
