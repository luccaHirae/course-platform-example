import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { and, eq, or } from 'drizzle-orm';
import { db } from '@/drizzle/db';
import {
  CourseSectionTable,
  CourseTable,
  LessonStatus,
  LessonTable,
  UserCourseAccessTable,
  UserRole,
} from '@/drizzle/schema';
import { getUserCourseAccessUserTag } from '@/features/courses/db/cache/userCourseAccess';
import { wherePublicCourseSections } from '@/features/courseSections/permissions/sections';
import { getLessonIdTag } from '@/features/lessons/db/cache/lessons';

export function canCreateLessons({ role }: { role: UserRole | undefined }) {
  return role === 'admin';
}

export function canUpdateLessons({ role }: { role: UserRole | undefined }) {
  return role === 'admin';
}

export function canDeleteLessons({ role }: { role: UserRole | undefined }) {
  return role === 'admin';
}

export const wherePublicLessons = or(
  eq(LessonTable.status, 'public'),
  eq(LessonTable.status, 'preview')
);

export async function canViewLesson(
  { role, userId }: { role: UserRole | undefined; userId: string | undefined },
  lesson: { id: string; status: LessonStatus }
) {
  'use cache';

  if (role === 'admin' || lesson.status === 'preview') return true;
  if (userId == null || lesson.status === 'private') return false;

  cacheTag(getUserCourseAccessUserTag(userId), getLessonIdTag(lesson.id));

  const [data] = await db
    .select({ courseId: CourseTable.id })
    .from(UserCourseAccessTable)
    .leftJoin(CourseTable, eq(CourseTable.id, UserCourseAccessTable.courseId))
    .leftJoin(
      CourseSectionTable,
      and(
        eq(CourseSectionTable.courseId, CourseTable.id),
        wherePublicCourseSections
      )
    )
    .leftJoin(
      LessonTable,
      and(eq(LessonTable.sectionId, CourseSectionTable.id), wherePublicLessons)
    )
    .where(
      and(
        eq(LessonTable.id, lesson.id),
        eq(UserCourseAccessTable.userId, userId)
      )
    )
    .limit(1);

  return data != null && data.courseId != null;
}

export async function canUpdateUserLessonCompletionStatus(
  user: { userId: string | undefined },
  lessonId: string
) {
  'use cache';

  cacheTag(getLessonIdTag(lessonId));

  if (user.userId == null) return false;

  cacheTag(getUserCourseAccessUserTag(user.userId));

  const [courseAccess] = await db
    .select({ courseId: CourseTable.id })
    .from(UserCourseAccessTable)
    .innerJoin(CourseTable, eq(CourseTable.id, UserCourseAccessTable.courseId))
    .innerJoin(
      CourseSectionTable,
      and(
        eq(CourseSectionTable.courseId, CourseTable.id),
        wherePublicCourseSections
      )
    )
    .innerJoin(
      LessonTable,
      and(eq(LessonTable.sectionId, CourseSectionTable.id), wherePublicLessons)
    )
    .where(
      and(
        eq(LessonTable.id, lessonId),
        eq(UserCourseAccessTable.userId, user.userId)
      )
    )
    .limit(1);

  return courseAccess != null;
}
