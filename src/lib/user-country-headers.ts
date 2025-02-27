import { headers } from 'next/headers';
import { pppCoupons } from '@/data/pppCoupons';

const COUNTRY_HEADER_KEY = 'x-user-country';

export function setUserCountryHeader(
  headers: Headers,
  country: string | undefined
) {
  if (!country) {
    headers.delete(COUNTRY_HEADER_KEY);
  } else {
    headers.set(COUNTRY_HEADER_KEY, country);
  }
}

async function getUserCountry() {
  const head = await headers();
  return head.get(COUNTRY_HEADER_KEY);
}

export async function getUserCoupon() {
  const country = await getUserCountry();

  if (!country) return;

  const coupon = pppCoupons.find((coupon) =>
    coupon.countryCodes.includes(country)
  );

  if (!coupon) return;

  return {
    stripeCouponId: coupon.stripeCouponId,
    discountPercentage: coupon.discountPercentage,
  };
}
