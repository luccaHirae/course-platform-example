'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { courseSchema } from '@/schemas/courses';
import { RequiredSymbol } from '@/components/required-symbol';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createCourse, updateCourse } from '@/features/courses/actions/courses';
import { actionToast } from '@/lib/utils';

export function CourseForm({
  course,
}: {
  course?: {
    id: string;
    name: string;
    description: string;
  };
}) {
  const form = useForm<z.infer<typeof courseSchema>>({
    resolver: zodResolver(courseSchema),
    defaultValues: course ?? {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof courseSchema>) => {
    const action = !course ? createCourse : updateCourse.bind(null, course.id);
    const data = await action(values);
    actionToast(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex gap-6 flex-col'
      >
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
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor={field.name}>
                <RequiredSymbol />
                Description
              </FormLabel>

              <FormControl>
                <Textarea className='min-h-20 resize-none' {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className='self-end'>
          <Button type='submit' disabled={form.formState.isSubmitting}>
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}
