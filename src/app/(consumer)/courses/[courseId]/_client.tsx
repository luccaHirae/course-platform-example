'use client';

import { useParams } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle2, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ClientCourseDetailsPage({
  course,
}: {
  course: {
    id: string;
    name: string;
    courseSections: Array<{
      id: string;
      name: string;
      lessons: Array<{
        id: string;
        name: string;
        isComplete: boolean;
      }>;
    }>;
  };
}) {
  const { lessonId } = useParams();
  const defaultValue =
    typeof lessonId === 'string'
      ? course.courseSections.find((section) =>
          section.lessons.find((lesson) => lesson.id === lessonId)
        )
      : course.courseSections[0];

  return (
    <Accordion
      type='multiple'
      defaultValue={defaultValue ? [defaultValue.id] : undefined}
    >
      {course.courseSections.map((section) => (
        <AccordionItem key={section.id} value={section.id}>
          <AccordionTrigger className='text-lg'>
            {section.name}
          </AccordionTrigger>

          <AccordionContent className='flex flex-col gap-1'>
            {section.lessons.map((lesson) => (
              <Button
                variant='ghost'
                asChild
                key={lesson.id}
                className={cn(
                  'justify-start',
                  lesson.id === lessonId &&
                    'bg-accent/75 text-accent-foreground'
                )}
              >
                <Link href={`/courses/${course.id}/lessons/${lesson.id}`}>
                  <Video />
                  {lesson.name}
                  {lesson.isComplete && <CheckCircle2 className='ml-auto' />}
                </Link>
              </Button>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
