'use client';

import { ReactNode, useState } from 'react';
import { CourseSectionStatus } from '@/drizzle/schema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SectionForm } from '@/components/section/section-form';

export function SectionFormDialog({
  courseId,
  section,
  children,
}: {
  courseId: string;
  section?: {
    id: string;
    name: string;
    status: CourseSectionStatus;
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
            {!section ? 'New section' : `Edit ${section.name}`}
          </DialogTitle>
        </DialogHeader>

        <div className='mt-4'>
          <SectionForm
            section={section}
            courseId={courseId}
            onSuccess={() => setIsOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
