import { unstable_cache } from "next/cache";
import { cache } from "react";

export const CACHE_TAGS = {
  USER: "user",
  CREDIT_BALANCE: "credit_balance",
  CREDIT_TRANSACTION: "credit_transaction",
  PAYMENT_HISTORY: "payment_history",
  SESSION: "session",
  ACCOUNT: "account",
} as const;

const CACHE_DURATION = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 3600,
  VERY_LONG: 86400,
};

export function cacheQuery<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
  keyPrefix: string,
  tags: string[],
  revalidateSeconds: number = CACHE_DURATION.MEDIUM
) {
  return unstable_cache(
    async (...args: Args) => fn(...args),
    [keyPrefix],
    { revalidate: revalidateSeconds, tags }
  );
}

export function cachePerRequest<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>
) {
  return cache(fn);
}

export async function invalidateCache(tags: string[]): Promise<void> {
  const { revalidateTag } = await import("next/cache");
  for (const tag of tags) {
    revalidateTag(tag, "default");
  }
}

export const cachePresets = {
  userProfile: { tags: [CACHE_TAGS.USER], duration: CACHE_DURATION.MEDIUM },
  creditBalance: { tags: [CACHE_TAGS.CREDIT_BALANCE], duration: CACHE_DURATION.SHORT },
  transactionHistory: { tags: [CACHE_TAGS.CREDIT_TRANSACTION], duration: CACHE_DURATION.MEDIUM },
  paymentHistory: { tags: [CACHE_TAGS.PAYMENT_HISTORY], duration: CACHE_DURATION.MEDIUM },
  staticData: { tags: [], duration: CACHE_DURATION.LONG },
};

export function generateCacheKey(prefix: string, ...params: (string | number | undefined)[]): string {
  const validParams = params.filter((p): p is string | number => p !== undefined);
  return `${prefix}:${validParams.join(":")}`;
}
