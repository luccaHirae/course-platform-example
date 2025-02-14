import { relations } from 'drizzle-orm';
import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';
import { UserTable } from '@/drizzle/schema/user';
import { LessonTable } from '@/drizzle/schema/lesson';
import { createdAt, updatedAt } from '@/drizzle/schema-helpers';

export const UserLessonCompleteTable = pgTable(
  'user_lesson_complete',
  {
    userId: uuid()
      .notNull()
      .references(() => UserTable.id, { onDelete: 'cascade' }),
    lessonId: uuid()
      .notNull()
      .references(() => LessonTable.id, { onDelete: 'cascade' }),
    createdAt,
    updatedAt,
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] })]
);

export const UserLessonCompleteRelationships = relations(
  UserLessonCompleteTable,
  ({ one }) => ({
    user: one(UserTable, {
      fields: [UserLessonCompleteTable.userId],
      references: [UserTable.id],
    }),
    lesson: one(LessonTable, {
      fields: [UserLessonCompleteTable.lessonId],
      references: [LessonTable.id],
    }),
  })
);
