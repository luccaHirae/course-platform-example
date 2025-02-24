import { UserRole } from '@/drizzle/schema';

export function canCreateCourseSections({
  role,
}: {
  role: UserRole | undefined;
}) {
  return role === 'admin';
}

export function canDeletCourseSections({
  role,
}: {
  role: UserRole | undefined;
}) {
  return role === 'admin';
}

export function canUpdateCourseSections({
  role,
}: {
  role: UserRole | undefined;
}) {
  return role === 'admin';
}
