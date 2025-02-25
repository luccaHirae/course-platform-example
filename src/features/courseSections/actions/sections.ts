'use server';

import { z } from 'zod';
import { getCurrentUser } from '@/services/clerk';
import { sectionSchema } from '@/schemas/sections';
import {
  canCreateCourseSections,
  canDeletCourseSections,
  canUpdateCourseSections,
} from '@/features/courseSections/permissions/sections';
import {
  editSection,
  insertSection,
  removeSection,
  reorderSections,
} from '@/features/courseSections/db/sections';
import { db } from '@/drizzle/db';

export async function getNextCourseSectionOrder(courseId: string) {
  const section = await db.query.CourseSectionTable.findFirst({
    columns: { order: true },
    where: ({ courseId: courseIdCol }, { eq }) => eq(courseIdCol, courseId),
    orderBy: ({ order }, { desc }) => desc(order),
  });

  return section ? section.order + 1 : 0;
}

export async function createSection(
  courseId: string,
  unsafeData: z.infer<typeof sectionSchema>
) {
  const { success, data } = sectionSchema.safeParse(unsafeData);
  const currentUser = await getCurrentUser();

  if (!success || !canCreateCourseSections(currentUser)) {
    return {
      error: true,
      message: 'Error creating course section',
    };
  }

  const order = await getNextCourseSectionOrder(courseId);

  await insertSection({ ...data, courseId, order });

  return {
    error: false,
    message: 'Successfully created course section',
  };
}

export async function updateSection(
  id: string,
  unsafeData: z.infer<typeof sectionSchema>
) {
  const { success, data } = sectionSchema.safeParse(unsafeData);
  const currentUser = await getCurrentUser();

  if (!success || !canUpdateCourseSections(currentUser)) {
    return {
      error: true,
      message: 'Error updating course section',
    };
  }

  await editSection(id, data);

  return {
    error: false,
    message: 'Successfully updated course section',
  };
}

export async function deleteSection(id: string) {
  const currentUser = await getCurrentUser();

  if (!canDeletCourseSections(currentUser)) {
    return {
      error: true,
      message: 'Error deleting course section',
    };
  }

  await removeSection(id);

  return {
    error: false,
    message: 'Successfully deleted course section',
  };
}

export async function updateSectionOrder(sectionIds: string[]) {
  if (
    sectionIds.length === 0 ||
    !canUpdateCourseSections(await getCurrentUser())
  ) {
    return {
      error: true,
      message: 'Error updating course section order',
    };
  }

  await reorderSections(sectionIds);

  return {
    error: false,
    message: 'Successfully updated course section order',
  };
}
