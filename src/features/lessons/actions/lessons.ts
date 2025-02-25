import { z } from 'zod';
import { getCurrentUser } from '@/services/clerk';
import { lessonSchema } from '@/schemas/lessons';
import {
  canCreateLessons,
  canDeleteLessons,
  canUpdateLessons,
} from '@/features/lessons/permissions/lessons';
import {
  editLesson,
  getNextCourseLessonOrder,
  insertLesson,
  removeLesson,
  reorderLessons,
} from '@/features/lessons/db/lessons';

export async function createLesson(unsafedata: z.infer<typeof lessonSchema>) {
  const { success, data } = lessonSchema.safeParse(unsafedata);

  if (!success || !canCreateLessons(await getCurrentUser())) {
    return {
      error: true,
      message: 'Error creating lesson',
    };
  }

  const order = await getNextCourseLessonOrder(data.sectionId);

  await insertLesson({ ...data, order });

  return {
    error: false,
    message: 'Successfully created lesson',
  };
}

export async function updateLesson(
  id: string,
  unsafeData: z.infer<typeof lessonSchema>
) {
  const { success, data } = lessonSchema.safeParse(unsafeData);

  if (!success || !canUpdateLessons(await getCurrentUser())) {
    return {
      error: true,
      message: 'Error updating lesson',
    };
  }

  await editLesson(id, data);

  return {
    error: false,
    message: 'Successfully updated lesson',
  };
}

export async function deleteLesson(id: string) {
  if (!canDeleteLessons(await getCurrentUser())) {
    return {
      error: true,
      message: 'Error deleting lesson',
    };
  }

  await removeLesson(id);

  return {
    error: false,
    message: 'Successfully deleted lesson',
  };
}

export async function updateLessonOrder(lessonIds: string[]) {
  if (lessonIds.length === 0 || !canUpdateLessons(await getCurrentUser())) {
    return {
      error: true,
      message: 'Error updating lesson order',
    };
  }

  await reorderLessons(lessonIds);

  return {
    error: false,
    message: 'Successfully updated lesson order',
  };
}
