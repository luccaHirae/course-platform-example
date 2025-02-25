'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { lessonSchema } from '@/schemas/lessons';
import { LessonStatus, lessonStatuses } from '@/drizzle/schema';
import { createLesson, updateLesson } from '@/features/lessons/actions/lessons';
import { RequiredSymbol } from '@/components/required-symbol';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { YoutubeVideoPlayer } from '@/components/youtube-video-player';
import { actionToast } from '@/lib/utils';

export function LessonForm({
  sections,
  defaultSectionId,
  lesson,
  onSuccess,
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
  onSuccess?: () => void;
}) {
  const form = useForm<z.infer<typeof lessonSchema>>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      name: lesson?.name ?? '',
      status: lesson?.status ?? 'public',
      youtubeVideoId: lesson?.youtubeVideoId ?? '',
      description: lesson?.description ?? '',
      sectionId:
        lesson?.sectionId ?? defaultSectionId ?? sections?.[0]?.id ?? '',
    },
  });

  const videoId = form.watch('youtubeVideoId');

  const onSubmit = async (values: z.infer<typeof lessonSchema>) => {
    const action = !lesson ? createLesson : updateLesson.bind(null, lesson.id);
    const data = await action(values);
    actionToast(data);

    if (!data.error) onSuccess?.();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex gap-6 flex-col @container'
      >
        <div className='grid grid-cols-1 @lg:grid-cols-2 gap-6'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={field.name}>
                  <RequiredSymbol />
                  Name
                </FormLabel>

                <FormControl>
                  <Input {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='youtubeVideoId'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={field.name}>
                  <RequiredSymbol />
                  YouTube Video ID
                </FormLabel>

                <FormControl>
                  <Input {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='sectionId'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={field.name}>
                  <RequiredSymbol />
                  Section
                </FormLabel>

                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='status'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={field.name}>
                  <RequiredSymbol />
                  Status
                </FormLabel>

                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    {lessonStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={field.name}>Description</FormLabel>

                <FormControl>
                  <Textarea
                    className='min-h-20 resize-none'
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='self-end'>
          <Button type='submit' disabled={form.formState.isSubmitting}>
            Save
          </Button>
        </div>

        {videoId && (
          <div className='aspect-video'>
            <YoutubeVideoPlayer videoId={videoId} />
          </div>
        )}
      </form>
    </Form>
  );
}
