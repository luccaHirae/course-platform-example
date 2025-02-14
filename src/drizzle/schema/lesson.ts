import { integer, pgEnum, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { createdAt, id, updatedAt } from '@/drizzle/schema-helpers';
import { CourseSectionTable } from '@/drizzle/schema/course-section';
import { relations } from 'drizzle-orm';
import { UserLessonCompleteTable } from './user-lesson-complete';

export const lessonStatuses = ['public', 'private', 'preview'] as const;
export type LessonStatus = (typeof lessonStatuses)[number];
export const lessonStatusEnum = pgEnum('lesson_status', lessonStatuses);

export const LessonTable = pgTable('lessons', {
  id,
  name: text().notNull(),
  description: text().notNull(),
  youtubeVideoId: text().notNull(),
  order: integer().notNull(),
  status: lessonStatusEnum().notNull().default('private'),
  sectionId: uuid()
    .notNull()
    .references(() => CourseSectionTable.id, { onDelete: 'cascade' }),
  createdAt,
  updatedAt,
});

export const LessonRelationships = relations(LessonTable, ({ one, many }) => ({
  section: one(CourseSectionTable, {
    fields: [LessonTable.sectionId],
    references: [CourseSectionTable.id],
  }),
  userLessonsComplete: many(UserLessonCompleteTable),
}));
