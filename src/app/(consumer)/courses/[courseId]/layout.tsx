import { ReactNode, Suspense } from 'react';
import { getUserCourse } from '@/features/courses/actions/courses';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/services/clerk';
import { getCompletedLessonsIds } from '@/features/lessons/actions/lessons';
import { ClientCourseDetailsPage } from './_client';
import { mapCourse } from '@/lib/utils';

export default async function CoursesPageLayout({
  params,
  children,
}: {
  params: Promise<{ courseId: string }>;
  children: ReactNode;
}) {
  const { courseId } = await params;
  const course = await getUserCourse(courseId);

  if (!course) return notFound();

  return (
    <div className='grid grid-cols-[300px, 1fr] gap-8 custom-container'>
      <div className='py-4'>
        <div className='text-lg font-semibold'>{course.name}</div>

        <Suspense
          fallback={<ClientCourseDetailsPage course={mapCourse(course, [])} />}
        >
          <SuspenceBoundary course={course} />
        </Suspense>
      </div>

      <div className='py-4'>{children}</div>
    </div>
  );
}

async function SuspenceBoundary({
  course,
}: {
  course: {
    id: string;
    name: string;
    courseSections: Array<{
      id: string;
      name: string;
      lessons: Array<{
        id: string;
        name: string;
      }>;
    }>;
  };
}) {
  const { userId } = await getCurrentUser();
  const completedLessonsIds = !userId
    ? []
    : await getCompletedLessonsIds(userId);

  return (
    <ClientCourseDetailsPage course={mapCourse(course, completedLessonsIds)} />
  );
}
