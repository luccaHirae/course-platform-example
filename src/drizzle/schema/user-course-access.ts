import { relations } from 'drizzle-orm';
import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';
import { UserTable } from '@/drizzle/schema/user';
import { CourseTable } from '@/drizzle/schema/course';
import { createdAt, updatedAt } from '@/drizzle/schema-helpers';

export const UserCourseAccessTable = pgTable(
  'user_course_access',
  {
    userId: uuid()
      .notNull()
      .references(() => UserTable.id, { onDelete: 'cascade' }),
    courseId: uuid()
      .notNull()
      .references(() => CourseTable.id, { onDelete: 'cascade' }),
    createdAt,
    updatedAt,
  },
  (t) => [primaryKey({ columns: [t.userId, t.courseId] })]
);

export const UserCourseAccessRelationships = relations(
  UserCourseAccessTable,
  ({ one }) => ({
    user: one(UserTable, {
      fields: [UserCourseAccessTable.userId],
      references: [UserTable.id],
    }),
    course: one(CourseTable, {
      fields: [UserCourseAccessTable.courseId],
      references: [CourseTable.id],
    }),
  })
);
