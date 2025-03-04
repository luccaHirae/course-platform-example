'use server';

import { env } from '@/data/env/client';
import { getUserCoupon } from '@/lib/user-country-headers';
import { stripeServerClient } from '@/services/stripe/stripe-server';

export async function getClientSessionSecret(
  product: {
    priceInDollars: number;
    name: string;
    id: string;
    imageUrl: string;
    description: string;
  },
  user: {
    id: string;
    email: string;
  }
) {
  const coupon = await getUserCoupon();
  const discounts = coupon ? [{ coupon: coupon.stripeCouponId }] : undefined;

  const session = await stripeServerClient.checkout.sessions.create({
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            images: [new URL(product.imageUrl, env.NEXT_PUBLIC_APP_URL).href],
            description: product.description,
          },
          unit_amount: product.priceInDollars * 100,
        },
      },
    ],
    ui_mode: 'embedded',
    mode: 'payment',
    return_url: `${env.NEXT_PUBLIC_APP_URL}/api/webhooks/stripe?stripeSessionId={CHECKOUT_SESSION_ID}`,
    customer_email: user.email,
    payment_intent_data: {
      receipt_email: user.email,
    },
    discounts,
    metadata: {
      productId: product.id,
      userId: user.id,
    },
  });

  if (session.client_secret == null) throw new Error('Client secret not found');

  return session.client_secret;
}
