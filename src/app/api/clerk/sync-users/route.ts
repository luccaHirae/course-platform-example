import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { insertUser } from '@/features/users/db/users';
import { syncClerkUserMetadata } from '@/services/clerk';
import { wait } from '@/lib/utils';

export async function GET(request: Request) {
  const user = await currentUser();

  if (!user) return new Response('User not found', { status: 404 });

  if (!user.fullName)
    return new Response('User does not have a full name', { status: 400 });

  if (!user.primaryEmailAddress?.emailAddress)
    return new Response('User does not have a primary email address', {
      status: 400,
    });

  const dbUser = await insertUser({
    clerkUserId: user.id,
    name: user.fullName,
    email: user.primaryEmailAddress.emailAddress,
    imageUrl: user.imageUrl,
    role: user.publicMetadata.role ?? 'user',
  });

  await syncClerkUserMetadata(dbUser);

  await wait(100);

  return NextResponse.redirect(request.headers.get('referer') ?? '/');
}
