import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatPlural } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ActionButton } from '@/components/action-button';
import { deleteCourse } from '@/features/courses/actions/courses';

export function CourseTable({
  courses,
}: {
  courses: Array<{
    id: string;
    name: string;
    sectionsCount: number;
    lessonsCount: number;
    studentsCount: number;
  }>;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            {formatPlural(courses.length, {
              singular: 'course',
              plural: 'courses',
            })}
          </TableHead>

          <TableHead>Students</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {courses.map((course) => (
          <TableRow key={course.id}>
            <TableCell>
              <div className='flex flex-col gap-1'>
                <div className='font-semibold'>{course.name}</div>

                <div className='text-muted-foreground'>
                  {formatPlural(course.sectionsCount, {
                    singular: 'section',
                    plural: 'sections',
                  })}{' '}
                  &middot;{' '}
                  {formatPlural(course.lessonsCount, {
                    singular: 'lesson',
                    plural: 'lessons',
                  })}
                </div>
              </div>
            </TableCell>

            <TableCell>{course.studentsCount}</TableCell>

            <TableCell>
              <div className='flex gap-2'>
                <Button asChild>
                  <Link href={`/admin/courses/${course.id}/edit`}>Edit</Link>
                </Button>

                <ActionButton
                  variant='destructiveOutline'
                  action={deleteCourse.bind(null, course.id)}
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
