'use server';

import { getCurrentUser } from '@/services/clerk';
import { canUpdateUserLessonCompletionStatus } from '@/features/lessons/permissions/lessons';
import { toggleLessonCompleteStatus } from '@/features/lessons/db/userLessonComplete';

export async function updateLessonCompleteStatus(
  lessonId: string,
  complete: boolean
) {
  const { userId } = await getCurrentUser();

  const hasPermission = await canUpdateUserLessonCompletionStatus(
    { userId },
    lessonId
  );

  if (userId == null || !hasPermission) {
    return {
      error: true,
      message: 'Error updating lesson completion status',
    };
  }

  await toggleLessonCompleteStatus({ userId, lessonId, complete });

  return {
    error: false,
    message: 'Successfully updated lesson completion status',
  };
}
