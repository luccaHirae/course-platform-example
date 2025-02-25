'use client';

import { EyeClosed, Trash2, Video } from 'lucide-react';
import { LessonStatus } from '@/drizzle/schema';
import { cn } from '@/lib/utils';
import { DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SortableItem, SortableList } from '@/components/sortable-list';
import { ActionButton } from '@/components/action-button';
import { LessonFormDialog } from '@/components/lessons/lesson-form-dialog';
import {
  deleteLesson,
  updateLessonOrder,
} from '@/features/lessons/actions/lessons';

export function SortableLessonList({
  sections,
  lessons,
}: {
  lessons: Array<{
    id: string;
    name: string;
    status: LessonStatus;
    youtubeVideoId: string;
    description: string | null;
    sectionId: string;
  }>;
  sections: Array<{
    id: string;
    name: string;
  }>;
}) {
  return (
    <SortableList items={lessons} onOrderChange={updateLessonOrder}>
      {(items) =>
        items.map((lesson) => (
          <SortableItem
            key={lesson.id}
            id={lesson.id}
            className='flex items-center gap-1'
          >
            <div
              className={cn(
                'contents',
                lesson.status === 'private' && 'text-muted-foreground'
              )}
            >
              {lesson.status === 'private' && <EyeClosed className='size-4' />}
              {lesson.status === 'preview' && <Video className='size-4' />}
              {lesson.name}
            </div>

            <LessonFormDialog lesson={lesson} sections={sections}>
              <DialogTrigger asChild>
                <Button variant='outline' size='sm' className='ml-auto'>
                  Edit
                </Button>
              </DialogTrigger>
            </LessonFormDialog>

            <ActionButton
              action={deleteLesson.bind(null, lesson.id)}
              requireAreYouSure
              variant='destructiveOutline'
              size='sm'
            >
              <Trash2 />
              <span className='sr-only'>Delete</span>
            </ActionButton>
          </SortableItem>
        ))
      }
    </SortableList>
  );
}
