import { db } from '@/drizzle/db';
import { CourseTable } from '@/drizzle/schema';
import { revalidateCourseChache } from '@/features/courses/db/cache/courses';

export async function insertCourse(data: typeof CourseTable.$inferInsert) {
  const [newCourse] = await db.insert(CourseTable).values(data).returning();

  if (!newCourse) throw new Error('Failed to create course');

  revalidateCourseChache(newCourse.id);

  return newCourse;
}
