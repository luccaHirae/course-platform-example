import { productStatuses } from '@/drizzle/schema';
import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Required'),
  proceInDollars: z.number().int().nonnegative(),
  description: z.string().min(1, 'Required'),
  imageUrl: z.union([
    z.string().url('Invalid URL'),
    z.string().startsWith('/', 'Invalid URL'),
  ]),
  status: z.enum(productStatuses),
  courseIds: z.array(z.string()).min(1, 'At least one course is required'),
});
