import { db } from '@/drizzle/db';
import { UserCourseAccessTable } from '@/drizzle/schema';
import { revalidateUserCourseAccessCache } from '@/features/courses/db/cache/userCourseAccess';

export async function addUserCourseAccess(
  {
    userId,
    courseIds,
  }: {
    userId: string;
    courseIds: string[];
  },
  trx: Omit<typeof db, '$client'> = db
) {
  const accesses = await trx
    .insert(UserCourseAccessTable)
    .values(courseIds.map((courseId) => ({ courseId, userId })))
    .onConflictDoNothing()
    .returning();

  accesses.forEach(revalidateUserCourseAccessCache);

  return accesses;
}
