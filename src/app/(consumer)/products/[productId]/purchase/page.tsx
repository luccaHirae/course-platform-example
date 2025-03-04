import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import { SignUp, SignIn } from '@clerk/nextjs';
import { getCurrentUser } from '@/services/clerk';
import { StripeCheckoutForm } from '@/services/stripe/components/stripe-checkout-form';
import { LoadingSpinner } from '@/components/loading-spinner';
import { PageHeader } from '@/components/page-header';
import { getPublicPurchaseProduct } from '@/features/products/actions/products';
import { userOwnsProduct } from '@/features/products/db/products';

export default function ProductPurchasePage({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ authMode: string }>;
}) {
  return (
    <Suspense fallback={<LoadingSpinner className='my-6 size-36 mx-auto' />}>
      <SuspendedComponent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function SuspendedComponent({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ authMode: string }>;
}) {
  const { productId } = await params;
  const { authMode } = await searchParams;

  const { user } = await getCurrentUser({ allData: true });
  const product = await getPublicPurchaseProduct(productId);

  if (!product) return notFound();

  if (user) {
    if (await userOwnsProduct({ userId: user.id, productId })) {
      redirect('/courses');
    }

    return (
      <div className='custom-container my-6'>
        <StripeCheckoutForm product={product} user={user} />
      </div>
    );
  }

  const isSignUp = authMode === 'signup';

  return (
    <div className='custom-container my-6 flex flex-col items-center'>
      <PageHeader title='You need an account to make a purchase' />

      {isSignUp ? (
        <SignUp
          routing='hash'
          signInUrl={`/products/${productId}/purchase?authMode=signIn`}
          forceRedirectUrl={`/products/${productId}/purchase`}
        />
      ) : (
        <SignIn
          routing='hash'
          signUpUrl={`/products/${productId}/purchase?authMode=signup`}
          forceRedirectUrl={`/products/${productId}/purchase`}
        />
      )}
    </div>
  );
}
