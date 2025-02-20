import Link from 'next/link';
import { SignInButton, UserButton } from '@clerk/nextjs';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { canAccessAdminPages } from '@/permissions/general';
import { getCurrentUser } from '@/services/clerk';

export default function ConsumerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Suspense>
        <Navbar />
      </Suspense>
      {children}
    </>
  );
}

async function Navbar() {
  const { userId, role } = await getCurrentUser();
  const hasAdminAccess = canAccessAdminPages({ role });

  return (
    <header className='flex h-12 shadow z-10'>
      <nav className='flex gap-4 custom-container'>
        <Link
          href='/'
          className='mr-auto text-lg hover:underline flex items-center px-2'
        >
          Course Platform
        </Link>

        {userId ? (
          <>
            {hasAdminAccess && (
              <Link
                href='/admin'
                className='hover:bg-accent/10 flex items-center px-2'
              >
                Admin
              </Link>
            )}

            <Link
              href='/courses'
              className='hover:bg-accent/10 flex items-center px-2'
            >
              My Courses
            </Link>

            <Link
              href='/purchases'
              className='hover:bg-accent/10 flex items-center px-2'
            >
              Purchase History
            </Link>

            <div className='size-8 self-center'>
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: {
                      width: '100%',
                      height: '100%',
                    },
                  },
                }}
              />
            </div>
          </>
        ) : (
          <Button className='self-center hover:cursor-pointer' asChild>
            <SignInButton>Sign In</SignInButton>
          </Button>
        )}
      </nav>
    </header>
  );
}
