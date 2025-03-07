import { revalidateTag } from 'next/cache';
import { getGlobalTag, getIdTag, getUserTag } from '@/lib/data.cache';

export function getUserLessonCompleteGlobalTag() {
  return getGlobalTag('userLessonComplete');
}

export function getUserLessonCompleteIdTag({
  lessonId,
  userId,
}: {
  lessonId: string;
  userId: string;
}) {
  return getIdTag('userLessonComplete', `lessons:${lessonId}-user:${userId}`);
}

export function getUserLessonCompleteUserTag(userId: string) {
  return getUserTag('userLessonComplete', userId);
}

export function revalidateUserLessonCompleteCache({
  lessonId,
  userId,
}: {
  lessonId: string;
  userId: string;
}) {
  revalidateTag(getUserLessonCompleteGlobalTag());
  revalidateTag(getUserLessonCompleteIdTag({ lessonId, userId }));
  revalidateTag(getUserLessonCompleteUserTag(userId));
}
