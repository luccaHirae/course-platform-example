'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProductStatus, productStatuses } from '@/drizzle/schema';
import { productSchema } from '@/schemas/products';
import { actionToast } from '@/lib/utils';
import {
  createProduct,
  updateProduct,
} from '@/features/products/actions/products';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MultiSelect } from '@/components/multi-select';

export function ProductForm({
  product,
  courses,
}: {
  product?: {
    id: string;
    name: string;
    description: string;
    priceInDollars: number;
    imageUrl: string;
    status: ProductStatus;
    courseIds: string[];
  };
  courses: Array<{
    id: string;
    name: string;
  }>;
}) {
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: product ?? {
      name: '',
      description: '',
      courseIds: [],
      imageUrl: '',
      priceInDollars: 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    const action = !product
      ? createProduct
      : updateProduct.bind(null, product.id);
    const data = await action(values);
    actionToast(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex gap-6 flex-col'
      >
        <div className='grid gap-6 grid-cols-1 md:grid-cols-2 items-start'>
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
            name='priceInDollars'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={field.name}>
                  <RequiredSymbol />
                  Price
                </FormLabel>

                <FormControl>
                  <Input
                    type='number'
                    step={1}
                    min={0}
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        isNaN(e.target.valueAsNumber)
                          ? 0
                          : e.target.valueAsNumber
                      )
                    }
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='imageUrl'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={field.name}>
                  <RequiredSymbol />
                  Image Url
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
                    {productStatuses.map((status) => (
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

        <FormField
          control={form.control}
          name='courseIds'
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor={field.name}>
                <RequiredSymbol />
                Included Courses
              </FormLabel>

              <FormControl>
                <MultiSelect
                  selectPlaceholder='Select courses'
                  searchPlaceholder='Search courses'
                  options={courses}
                  getLabel={(c) => c.name}
                  getValue={(c) => c.id}
                  selectedValues={field.value}
                  onSelectedValuesChange={field.onChange}
                />
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

        <div className='self-end'>
          <Button type='submit' disabled={form.formState.isSubmitting}>
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}
