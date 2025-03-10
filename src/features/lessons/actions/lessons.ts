'use server';

import { z } from 'zod';
import { getCurrentUser } from '@/services/clerk';
import { lessonSchema } from '@/schemas/lessons';
import {
  canCreateLessons,
  canDeleteLessons,
  canUpdateLessons,
  wherePublicLessons,
} from '@/features/lessons/permissions/lessons';
import {
  editLesson,
  getNextCourseLessonOrder,
  insertLesson,
  removeLesson,
  reorderLessons,
} from '@/features/lessons/db/lessons';
import { db } from '@/drizzle/db';
import {
  CourseSectionTable,
  LessonTable,
  UserLessonCompleteTable,
} from '@/drizzle/schema';
import { and, asc, desc, eq, gt, lt } from 'drizzle-orm';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import {
  getUserLessonCompleteIdTag,
  getUserLessonCompleteUserTag,
} from '@/features/lessons/db/cache/userLessonComplete';
import { getLessonIdTag } from '@/features/lessons/db/cache/lessons';
import { wherePublicCourseSections } from '@/features/courseSections/permissions/sections';

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

export async function getCompletedLessonsIds(userId: string) {
  'use cache';

  cacheTag(getUserLessonCompleteUserTag(userId));

  const data = await db.query.UserLessonCompleteTable.findMany({
    where: eq(UserLessonCompleteTable.userId, userId),
    columns: {
      lessonId: true,
    },
  });

  return data.map(({ lessonId }) => lessonId);
}

export async function getLessonDetails(id: string) {
  'use cache';

  cacheTag(getLessonIdTag(id));

  return db.query.LessonTable.findFirst({
    where: and(eq(LessonTable.id, id), wherePublicLessons),
    columns: {
      id: true,
      youtubeVideoId: true,
      name: true,
      description: true,
      status: true,
      sectionId: true,
      order: true,
    },
  });
}

export async function getIsLessonComplete({
  lessonId,
  userId,
}: {
  lessonId: string;
  userId: string;
}) {
  'use cache';

  cacheTag(getUserLessonCompleteIdTag({ userId, lessonId }));

  const data = await db.query.UserLessonCompleteTable.findFirst({
    where: and(
      eq(UserLessonCompleteTable.userId, userId),
      eq(UserLessonCompleteTable.lessonId, lessonId)
    ),
  });

  return data != null;
}

export async function getPreviousLesson(lesson: {
  id: string;
  sectionId: string;
  order: number;
}) {
  let previousLesson = await db.query.LessonTable.findFirst({
    where: and(
      lt(LessonTable.order, lesson.order),
      eq(LessonTable.sectionId, lesson.sectionId),
      wherePublicLessons
    ),
    orderBy: desc(LessonTable.order),
    columns: {
      id: true,
    },
  });

  if (previousLesson == null) {
    const section = await db.query.CourseSectionTable.findFirst({
      where: eq(CourseSectionTable.id, lesson.sectionId),
      columns: {
        order: true,
        courseId: true,
      },
    });

    if (section == null) return;

    const previousSection = await db.query.CourseSectionTable.findFirst({
      where: and(
        lt(CourseSectionTable.order, section.order),
        eq(CourseSectionTable.courseId, section.courseId),
        wherePublicCourseSections
      ),
      orderBy: desc(LessonTable.order),
      columns: {
        id: true,
      },
    });

    if (previousSection == null) return;

    previousLesson = await db.query.LessonTable.findFirst({
      where: and(
        eq(LessonTable.sectionId, previousSection.id),
        wherePublicLessons
      ),
      orderBy: desc(LessonTable.order),
      columns: {
        id: true,
      },
    });
  }

  return previousLesson;
}

export async function getNextLesson(lesson: {
  id: string;
  sectionId: string;
  order: number;
}) {
  let nextLesson = await db.query.LessonTable.findFirst({
    where: and(
      gt(LessonTable.order, lesson.order),
      eq(LessonTable.sectionId, lesson.sectionId),
      wherePublicLessons
    ),
    orderBy: asc(LessonTable.order),
    columns: {
      id: true,
    },
  });

  if (nextLesson == null) {
    const section = await db.query.CourseSectionTable.findFirst({
      where: eq(CourseSectionTable.id, lesson.sectionId),
      columns: {
        order: true,
        courseId: true,
      },
    });

    if (section == null) return;

    const nextSection = await db.query.CourseSectionTable.findFirst({
      where: and(
        gt(CourseSectionTable.order, section.order),
        eq(CourseSectionTable.courseId, section.courseId),
        wherePublicCourseSections
      ),
      orderBy: asc(LessonTable.order),
      columns: {
        id: true,
      },
    });

    if (nextSection == null) return;

    nextLesson = await db.query.LessonTable.findFirst({
      where: and(eq(LessonTable.sectionId, nextSection.id), wherePublicLessons),
      orderBy: asc(LessonTable.order),
      columns: {
        id: true,
      },
    });
  }

  return nextLesson;
}
