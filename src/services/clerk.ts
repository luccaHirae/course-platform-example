import { redirect } from 'next/navigation';
import { db } from '@/drizzle/db';
import { UserRole, UserTable } from '@/drizzle/schema';
import { getUserIdTag } from '@/features/users/db/cache';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';

const client = await clerkClient();

export async function getUser(id: string) {
  'use cache';

  cacheTag(getUserIdTag(id));

  return db.query.UserTable.findFirst({
    where: eq(UserTable.id, id),
  });
}

export async function getCurrentUser({ allData = false } = {}) {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  if (userId != null && sessionClaims?.dbId == null) {
    // If the user is created in Clerk but not in our database, we need to create it
    redirect('/api/clerk/sync-users');
  }

  return {
    clerkUserId: userId,
    userId: sessionClaims?.dbId,
    role: sessionClaims?.role,
    user:
      allData && sessionClaims?.dbId
        ? await getUser(sessionClaims?.dbId)
        : undefined,
    redirectToSignIn,
  };
}

export function syncClerkUserMetadata(user: {
  id: string;
  clerkUserId: string;
  role: UserRole;
}) {
  return client.users.updateUserMetadata(user.clerkUserId, {
    publicMetadata: {
      dbId: user.id,
      role: user.role,
    },
  });
}
