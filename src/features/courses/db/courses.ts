import { db } from '@/drizzle/db';
import { CourseTable } from '@/drizzle/schema';
import { revalidateCourseChache } from '@/features/courses/db/cache/courses';
import { eq } from 'drizzle-orm';

export async function insertCourse(data: typeof CourseTable.$inferInsert) {
  const [newCourse] = await db.insert(CourseTable).values(data).returning();

  if (!newCourse) throw new Error('Failed to create course');

  revalidateCourseChache(newCourse.id);

  return newCourse;
}

export async function removeCourse(id: string) {
  const [deletedCourse] = await db
    .delete(CourseTable)
    .where(eq(CourseTable.id, id))
    .returning();

  if (!deletedCourse) throw new Error('Failed to delete course');

  revalidateCourseChache(deletedCourse.id);

  return deletedCourse;
}
