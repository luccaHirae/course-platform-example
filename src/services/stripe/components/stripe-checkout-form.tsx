'use client';

import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js';
import { stripeClientPromise } from '@/services/stripe/stripe-client';
import { getClientSessionSecret } from '@/services/stripe/actions/stripe';

export function StripeCheckoutForm({
  product,
  user,
}: {
  product: {
    priceInDollars: number;
    name: string;
    id: string;
    imageUrl: string;
    description: string;
  };
  user: {
    id: string;
    email: string;
  };
}) {
  return (
    <EmbeddedCheckoutProvider
      stripe={stripeClientPromise}
      options={{
        fetchClientSecret: getClientSessionSecret.bind(null, product, user),
      }}
    >
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
}
