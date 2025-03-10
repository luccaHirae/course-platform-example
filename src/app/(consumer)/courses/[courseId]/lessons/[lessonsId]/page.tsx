import Link from 'next/link';
import { ReactNode, Suspense } from 'react';
import { notFound } from 'next/navigation';
import {
  getIsLessonComplete,
  getLessonDetails,
  getNextLesson,
  getPreviousLesson,
} from '@/features/lessons/actions/lessons';
import { LessonStatus } from '@/drizzle/schema';
import { getCurrentUser } from '@/services/clerk';
import {
  canUpdateUserLessonCompletionStatus,
  canViewLesson,
} from '@/features/lessons/permissions/lessons';
import { YoutubeVideoPlayer } from '@/components/youtube-video-player';
import { CheckSquare2, Lock, XSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActionButton } from '@/components/action-button';
import { updateLessonCompleteStatus } from '@/features/lessons/actions/userLessonComplete';
import { SkeletonArray, SkeletonButton } from '@/components/skeleton';

export default async function LessonDetailsPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const lesson = await getLessonDetails(lessonId);

  if (!lesson) return notFound();

  return (
    <Suspense
      fallback={
        <SkeletonArray length={5}>
          <div className='aspect-video'>
            <div className='bg-primary text-primary-foreground h-full w-full' />
          </div>
        </SkeletonArray>
      }
    >
      <SuspenceBoundary lesson={lesson} courseId={courseId} />
    </Suspense>
  );
}

async function SuspenceBoundary({
  lesson,
  courseId,
}: {
  lesson: {
    name: string;
    id: string;
    description: string | null;
    status: LessonStatus;
    youtubeVideoId: string;
    sectionId: string;
    order: number;
  };
  courseId: string;
}) {
  const { userId, role } = await getCurrentUser();
  const isLessonComplete =
    userId == null
      ? false
      : await getIsLessonComplete({ lessonId: lesson.id, userId });
  const canView = await canViewLesson({ role, userId }, lesson);
  const canUpdateCompletionStatus = await canUpdateUserLessonCompletionStatus(
    {
      userId,
    },
    lesson.id
  );

  return (
    <div className='my-4 flex flex-col gap-4'>
      <div className='aspect-video'>
        {canView ? (
          <YoutubeVideoPlayer
            videoId={lesson.youtubeVideoId}
            onFinishedVideo={
              isLessonComplete && canUpdateCompletionStatus
                ? updateLessonCompleteStatus.bind(null, lesson.id, true)
                : undefined
            }
          />
        ) : (
          <div className='flex items-center justify-center bg-primary text-primary-foreground h-full w-full'>
            <Lock className='size-16' />
          </div>
        )}
      </div>

      <div className='flex flex-col gap-2'>
        <div className='flex justify-between items-start gap-4'>
          <h1 className='text-2xl font-semibold'>{lesson.name}</h1>

          <div className='flex gap-2 justify-end'>
            <Suspense fallback={<SkeletonButton />}>
              <ToLessonButton
                courseId={courseId}
                lessonFn={getPreviousLesson}
                lesson={lesson}
              >
                Previous
              </ToLessonButton>
            </Suspense>

            {canUpdateCompletionStatus && (
              <ActionButton
                action={updateLessonCompleteStatus.bind(
                  null,
                  lesson.id,
                  !isLessonComplete
                )}
                variant='outline'
              >
                <div className='flex gap-2 items-center'>
                  {isLessonComplete ? (
                    <>
                      <CheckSquare2 />
                      Mark Incomplete
                    </>
                  ) : (
                    <>
                      <XSquare />
                      Mark Complete
                    </>
                  )}
                </div>
              </ActionButton>
            )}

            <Suspense fallback={<SkeletonButton />}>
              <ToLessonButton
                courseId={courseId}
                lessonFn={getNextLesson}
                lesson={lesson}
              >
                Next
              </ToLessonButton>
            </Suspense>
          </div>
        </div>

        {canView ? (
          lesson.description && <p>{lesson.description}</p>
        ) : (
          <p>This lesson is locked. Please purchase the course to view it.</p>
        )}
      </div>
    </div>
  );
}

async function ToLessonButton({
  children,
  courseId,
  lesson,
  lessonFn,
}: {
  children: ReactNode;
  courseId: string;
  lesson: { id: string; sectionId: string; order: number };
  lessonFn: (lesson: {
    id: string;
    sectionId: string;
    order: number;
  }) => Promise<{ id: string } | undefined>;
}) {
  const toLesson = await lessonFn(lesson);

  if (toLesson == null) return null;

  return (
    <Button variant='outline' asChild>
      <Link href={`/courses/${courseId}/lessons/${toLesson.id}`}>
        {children}
      </Link>
    </Button>
  );
}
