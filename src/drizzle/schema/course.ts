import { relations } from 'drizzle-orm';
import { pgTable, text } from 'drizzle-orm/pg-core';
import { createdAt, id, updatedAt } from '@/drizzle/schema-helpers';
import { CourseProductTable } from '@/drizzle/schema/course-product';
import { UserCourseAccessTable } from '@/drizzle/schema/user-course-access';

export const CourseTable = pgTable('courses', {
  id,
  name: text().notNull(),
  description: text().notNull(),
  createdAt,
  updatedAt,
});

export const CourseRelationships = relations(CourseTable, ({ many }) => ({
  courseProduct: many(CourseProductTable),
  userCourseAccesses: many(UserCourseAccessTable),
}));
