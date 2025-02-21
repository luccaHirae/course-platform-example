'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { courseSchema } from '@/schemas/courses';
import { getCurrentUser } from '@/services/clerk';
import {
  canCreateCourses,
  canDeleteCourse,
} from '@/features/courses/permissions/courses';
import { insertCourse } from '@/features/courses/db/courses';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { getCourseGlobalTag } from '@/features/courses/db/cache/courses';
import { db } from '@/drizzle/db';
import {
  CourseSectionTable,
  CourseTable,
  LessonTable,
  UserCourseAccessTable,
} from '@/drizzle/schema';
import { asc, countDistinct, eq } from 'drizzle-orm';

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

export async function deleteCourse(id: string) {
  const currentUser = await getCurrentUser();

  if (!canDeleteCourse(currentUser)) {
    return {
      error: true,
      message: 'Error deleting course',
    };
  }

  // TODO: Delete course from database
  console.log('Deleting course with id:', id);

  return {
    error: false,
    message: 'Successfully deleted course',
  };
}

export async function getCourses() {
  'use cache';

  cacheTag(getCourseGlobalTag());

  return db
    .select({
      id: CourseTable.id,
      name: CourseTable.name,
      sectionsCount: countDistinct(CourseSectionTable),
      lessonsCount: countDistinct(LessonTable),
      studentsCount: countDistinct(UserCourseAccessTable),
    })
    .from(CourseTable)
    .leftJoin(
      CourseSectionTable,
      eq(CourseSectionTable.courseId, CourseTable.id)
    )
    .leftJoin(LessonTable, eq(LessonTable.sectionId, CourseTable.id))
    .leftJoin(
      UserCourseAccessTable,
      eq(UserCourseAccessTable.courseId, CourseTable.id)
    )
    .orderBy(asc(CourseTable.name))
    .groupBy(CourseTable.id);
}
