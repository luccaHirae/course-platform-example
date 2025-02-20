'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { courseSchema } from '@/schemas/courses';
import { getCurrentUser } from '@/services/clerk';
import { canCreateCourses } from '@/features/courses/permissions/courses';
import { insertCourse } from '@/features/courses/db/courses';

export async function createCourse(unsafeData: z.infer<typeof courseSchema>) {
  const { success, data } = courseSchema.safeParse(unsafeData);
  const currentUser = await getCurrentUser();

  if (!success || !canCreateCourses(currentUser)) {
    return {
      error: true,
      message: 'Error creating course',
    };
  }

  const course = await insertCourse(data);

  redirect(`/admin/courses/${course.id}/edit`);
}
