import { and, eq } from 'drizzle-orm';
import { db } from '@/drizzle/db';
import { UserLessonCompleteTable } from '@/drizzle/schema';
import { revalidateUserLessonCompleteCache } from '@/features/lessons/db/cache/userLessonComplete';

export async function toggleLessonCompleteStatus({
  userId,
  lessonId,
  complete,
}: {
  userId: string;
  lessonId: string;
  complete: boolean;
}) {
  let completion:
    | {
        lessonId: string;
        userId: string;
      }
    | undefined;

  if (complete) {
    const [data] = await db
      .insert(UserLessonCompleteTable)
      .values({
        lessonId,
        userId,
      })
      .onConflictDoNothing()
      .returning();

    completion = data;
  } else {
    const [data] = await db
      .delete(UserLessonCompleteTable)
      .where(
        and(
          eq(UserLessonCompleteTable.lessonId, lessonId),
          eq(UserLessonCompleteTable.userId, userId)
        )
      )
      .returning();

    completion = data;
  }

  if (completion == null) return;

  revalidateUserLessonCompleteCache({
    lessonId: completion.lessonId,
    userId: completion.userId,
  });
}
