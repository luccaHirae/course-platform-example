import Link from 'next/link';
import { Suspense } from 'react';
import { PageHeader } from '@/components/page-header';
import { SkeletonArray, SkeletonCourseCard } from '@/components/skeleton';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getUserCourses } from '@/features/courses/actions/courses';
import { formatPlural } from '@/lib/utils';
import { getCurrentUser } from '@/services/clerk';

export default function CoursesPage() {
  return (
    <div className='custom-container my-6'>
      <PageHeader title='My Courses' />

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        <Suspense
          fallback={
            <SkeletonArray length={6}>
              <SkeletonCourseCard />
            </SkeletonArray>
          }
        >
          <CourseGrid />
        </Suspense>
      </div>
    </div>
  );
}

async function CourseGrid() {
  const { userId, redirectToSignIn } = await getCurrentUser();

  if (!userId) return redirectToSignIn();

  const courses = await getUserCourses(userId);

  if (courses.length === 0) {
    return (
      <div className='flex flex-col gap-2 items-start'>
        You have no courses yet
        <Button asChild size='lg'>
          <Link href='/'>Browse Courses</Link>
        </Button>
      </div>
    );
  }

  return courses.map((course) => (
    <Card key={course.id} className='overflow-hidden flex flex-col pb-0'>
      <CardHeader>
        <CardTitle>{course.name}</CardTitle>

        <CardDescription>
          {formatPlural(course.sectionsCount, {
            plural: 'sections',
            singular: 'section',
          })}{' '}
          -{' '}
          {formatPlural(course.lessonsCount, {
            plural: 'lessons',
            singular: 'lesson',
          })}
        </CardDescription>
      </CardHeader>

      <CardContent className='line-clamp-3' title={course.description}>
        {course.description}
      </CardContent>

      <div className='flex-grow'></div>

      <CardFooter>
        <Button asChild>
          <Link href={`/courses/${course.id}`}>View Course</Link>
        </Button>
      </CardFooter>

      <div
        className='bg-accent h-2 -mt-2'
        style={{
          width: `${(course.lessonsComplete / course.lessonsCount) * 100}%`,
        }}
      ></div>
    </Card>
  ));
}
