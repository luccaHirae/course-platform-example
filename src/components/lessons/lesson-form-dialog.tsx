'use client';

import { ReactNode, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LessonStatus } from '@/drizzle/schema';
import { LessonForm } from '@/components/lessons/lesson-form';

export function LessonFormDialog({
  sections,
  defaultSectionId,
  lesson,
  children,
}: {
  sections: Array<{
    id: string;
    name: string;
  }>;
  defaultSectionId?: string;
  lesson?: {
    id: string;
    name: string;
    status: LessonStatus;
    youtubeVideoId: string;
    description: string | null;
    sectionId: string;
  };
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {!lesson ? 'New lesson' : `Edit ${lesson.name}`}
          </DialogTitle>
        </DialogHeader>

        <div className='mt-4'>
          <LessonForm
            sections={sections}
            lesson={lesson}
            defaultSectionId={defaultSectionId}
            onSuccess={() => setIsOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
