import Link from 'next/link';
import { SignInButton, UserButton } from '@clerk/nextjs';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { canAccessAdminPages } from '@/permissions/general';
import { getCurrentUser } from '@/services/clerk';
import { Badge } from '@/components/ui/badge';

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
        <div className='mr-auto flex items-center gap-2'>
          <Link href='/' className='text-lg hover:underline'>
            Course Platform
          </Link>

          <Badge>Admin</Badge>
        </div>

        {userId ? (
          <>
            {hasAdminAccess && (
              <Link
                href='/admin/courses'
                className='hover:bg-accent/10 flex items-center px-2'
              >
                Courses
              </Link>
            )}

            <Link
              href='/admin/products'
              className='hover:bg-accent/10 flex items-center px-2'
            >
              Products
            </Link>

            <Link
              href='/admin/sales'
              className='hover:bg-accent/10 flex items-center px-2'
            >
              Sales
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
