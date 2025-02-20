import { UserRole } from '@/drizzle/schema';

export function canCreateCourses({ role }: { role: UserRole | undefined }) {
  return role === 'admin';
}
