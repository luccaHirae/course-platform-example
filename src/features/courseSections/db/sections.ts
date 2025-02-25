import { db } from '@/drizzle/db';
import { CourseSectionTable } from '@/drizzle/schema';
import { revalidateCourseSectionCache } from '@/features/courseSections/db/cache';
import { eq } from 'drizzle-orm';

export async function insertSection(
  data: typeof CourseSectionTable.$inferInsert
) {
  const [newSection] = await db
    .insert(CourseSectionTable)
    .values(data)
    .returning();

  if (!newSection) throw new Error('Failed to insert section');

  revalidateCourseSectionCache({
    courseId: newSection.courseId,
    id: newSection.id,
  });

  return newSection;
}

export async function editSection(
  id: string,
  data: Partial<typeof CourseSectionTable.$inferInsert>
) {
  const [updatedSection] = await db
    .update(CourseSectionTable)
    .set(data)
    .where(eq(CourseSectionTable.id, id))
    .returning();

  if (!updatedSection) throw new Error('Failed to update section');

  revalidateCourseSectionCache({
    courseId: updatedSection.courseId,
    id: updatedSection.id,
  });

  return updatedSection;
}

export async function removeSection(id: string) {
  const [deletedSection] = await db
    .delete(CourseSectionTable)
    .where(eq(CourseSectionTable.id, id))
    .returning();

  if (!deletedSection) throw new Error('Failed to delete section');

  revalidateCourseSectionCache({
    courseId: deletedSection.courseId,
    id: deletedSection.id,
  });

  return deletedSection;
}

export async function reorderSections(sectionIds: string[]) {
  const sections = await Promise.all(
    sectionIds.map((id, index) =>
      db
        .update(CourseSectionTable)
        .set({ order: index })
        .where(eq(CourseSectionTable.id, id))
        .returning({
          courseId: CourseSectionTable.courseId,
          id: CourseSectionTable.id,
        })
    )
  );

  sections.flat().forEach(({ id, courseId }) => {
    revalidateCourseSectionCache({ courseId, id });
  });
}
