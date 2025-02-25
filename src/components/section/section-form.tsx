'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Button } from '@/components/ui/button';
import { CourseSectionStatus, courseSectionStatuses } from '@/drizzle/schema';
import { sectionSchema } from '@/schemas/sections';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  createSection,
  updateSection,
} from '@/features/courseSections/actions/sections';
import { actionToast } from '@/lib/utils';

export function SectionForm({
  section,
  courseId,
  onSuccess,
}: {
  section?: {
    id: string;
    name: string;
    status: CourseSectionStatus;
  };
  courseId: string;
  onSuccess?: () => void;
}) {
  const form = useForm<z.infer<typeof sectionSchema>>({
    resolver: zodResolver(sectionSchema),
    defaultValues: section ?? {
      name: '',
      status: 'public',
    },
  });

  const onSubmit = async (values: z.infer<typeof sectionSchema>) => {
    const action = !section
      ? createSection.bind(null, courseId)
      : updateSection.bind(null, section.id);
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
                    {courseSectionStatuses.map((status) => (
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
        </div>

        <div className='self-end'>
          <Button type='submit' disabled={form.formState.isSubmitting}>
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}
