'use server';

import { redirect } from 'next/navigation';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { z } from 'zod';
import { asc, countDistinct, eq } from 'drizzle-orm';
import { db } from '@/drizzle/db';
import {
  CourseSectionTable,
  CourseTable,
  LessonTable,
  UserCourseAccessTable,
} from '@/drizzle/schema';
import { getCurrentUser } from '@/services/clerk';
import { courseSchema } from '@/schemas/courses';
import {
  canCreateCourses,
  canDeleteCourse,
  canUpdateCourses,
} from '@/features/courses/permissions/courses';
import {
  editCourse,
  insertCourse,
  removeCourse,
} from '@/features/courses/db/courses';
import {
  getCourseGlobalTag,
  getCourseIdTag,
} from '@/features/courses/db/cache/courses';
import { getUserCourseAccessGlobalTag } from '@/features/courses/db/cache/userCourseAccess';
import {
  getCourseSectionCourseTag,
  getCourseSectionGlobalTag,
} from '@/features/courseSections/db/cache';
import {
  getLessonCourseTag,
  getLessonGlobalTag,
} from '@/features/lessons/db/cache/lessons';

export async function createCourse(unsafeData: z.infer<typeof courseSchema>) {
  const { success, data } = courseSchema.safeParse(unsafeData);
  const currentUser = await getCurrentUser();

  if (!success || !canCreateCourses(currentUser)) {
    return {
      error: true,
      message: 'Error creating course',
    };
  }

  const course = await insertCourse(data);

  redirect(`/admin/courses/${course.id}/edit`);
}

export async function updateCourse(
  id: string,
  unsafeData: z.infer<typeof courseSchema>
) {
  const { success, data } = courseSchema.safeParse(unsafeData);
  const currentUser = await getCurrentUser();

  if (!success || !canUpdateCourses(currentUser)) {
    return {
      error: true,
      message: 'Error updating course',
    };
  }

  await editCourse(id, data);

  return {
    error: false,
    message: 'Successfully updated course',
  };
}

export async function deleteCourse(id: string) {
  const currentUser = await getCurrentUser();

  if (!canDeleteCourse(currentUser)) {
    return {
      error: true,
      message: 'Error deleting course',
    };
  }

  await removeCourse(id);

  return {
    error: false,
    message: 'Successfully deleted course',
  };
}

export async function getCourses() {
  'use cache';

  cacheTag(
    getCourseGlobalTag(),
    getUserCourseAccessGlobalTag(),
    getCourseSectionGlobalTag(),
    getLessonGlobalTag()
  );

  return db
    .select({
      id: CourseTable.id,
      name: CourseTable.name,
      sectionsCount: countDistinct(CourseSectionTable),
      lessonsCount: countDistinct(LessonTable),
      studentsCount: countDistinct(UserCourseAccessTable),
    })
    .from(CourseTable)
    .leftJoin(
      CourseSectionTable,
      eq(CourseSectionTable.courseId, CourseTable.id)
    )
    .leftJoin(LessonTable, eq(LessonTable.sectionId, CourseTable.id))
    .leftJoin(
      UserCourseAccessTable,
      eq(UserCourseAccessTable.courseId, CourseTable.id)
    )
    .orderBy(asc(CourseTable.name))
    .groupBy(CourseTable.id);
}

export async function getCourse(id: string) {
  'use cache';

  cacheTag(
    getCourseIdTag(id),
    getCourseSectionCourseTag(id),
    getLessonCourseTag(id)
  );

  return db.query.CourseTable.findFirst({
    columns: {
      id: true,
      name: true,
      description: true,
    },
    where: eq(CourseTable.id, id),
    with: {
      courseSections: {
        orderBy: asc(CourseSectionTable.order),
        columns: {
          id: true,
          status: true,
          name: true,
        },
        with: {
          lessons: {
            orderBy: asc(LessonTable.order),
            columns: {
              id: true,
              name: true,
              status: true,
              description: true,
              youtubeVideoId: true,
              sectionId: true,
            },
          },
        },
      },
    },
  });
}
