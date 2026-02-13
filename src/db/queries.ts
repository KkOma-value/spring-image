import { eq, desc, and, gte, lte, SQL } from "drizzle-orm";
import { db } from "./index";
import { user } from "./schema/auth/user";
import { creditBalance, creditTransaction, paymentHistory } from "./schema/billing";
import { cacheQuery, cachePerRequest, CACHE_TAGS } from "./cache";
import type { CreditTransactionType, PaymentHistoryType, UserType } from "./schema";

export const getUserById = cacheQuery(
  async (userId: string): Promise<UserType | null> => {
    const result = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });
    return result ?? null;
  },
  "user-by-id",
  [CACHE_TAGS.USER],
  300
);

export const getUserByEmail = cacheQuery(
  async (email: string): Promise<UserType | null> => {
    const result = await db.query.user.findFirst({
      where: eq(user.email, email),
    });
    return result ?? null;
  },
  "user-by-email",
  [CACHE_TAGS.USER],
  300
);

export const getUserByUsername = cacheQuery(
  async (username: string): Promise<UserType | null> => {
    const result = await db.query.user.findFirst({
      where: eq(user.username, username),
    });
    return result ?? null;
  },
  "user-by-username",
  [CACHE_TAGS.USER],
  300
);

export const getCreditBalance = cacheQuery(
  async (userId: string): Promise<number> => {
    const result = await db.query.creditBalance.findFirst({
      where: eq(creditBalance.userId, userId),
      columns: { balance: true },
    });
    return result?.balance ?? 0;
  },
  "credit-balance",
  [CACHE_TAGS.CREDIT_BALANCE],
  60
);

export const getCreditBalancePerRequest = cachePerRequest(
  async (userId: string): Promise<number> => {
    const result = await db.query.creditBalance.findFirst({
      where: eq(creditBalance.userId, userId),
      columns: { balance: true },
    });
    return result?.balance ?? 0;
  }
);

export async function hasSufficientCredits(userId: string, required: number): Promise<boolean> {
  const balance = await getCreditBalancePerRequest(userId);
  return balance >= required;
}

interface TransactionFilter {
  userId?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}

export async function getCreditTransactions(
  filter: TransactionFilter = {}
): Promise<CreditTransactionType[]> {
  const { userId, fromDate, toDate, limit = 50, offset = 0 } = filter;

  const conditions: SQL[] = [];
  if (userId) conditions.push(eq(creditTransaction.userId, userId));
  if (fromDate) conditions.push(gte(creditTransaction.createdAt, fromDate));
  if (toDate) conditions.push(lte(creditTransaction.createdAt, toDate));

  return db.query.creditTransaction.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(creditTransaction.createdAt)],
    limit,
    offset,
  });
}

interface PaymentFilter {
  userId?: string;
  status?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}

export async function getPaymentHistory(
  filter: PaymentFilter = {}
): Promise<PaymentHistoryType[]> {
  const { userId, status, fromDate, toDate, limit = 50, offset = 0 } = filter;

  const conditions: SQL[] = [];
  if (userId) conditions.push(eq(paymentHistory.userId, userId));
  if (status) conditions.push(eq(paymentHistory.status, status));
  if (fromDate) conditions.push(gte(paymentHistory.createdAt, fromDate));
  if (toDate) conditions.push(lte(paymentHistory.createdAt, toDate));

  return db.query.paymentHistory.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(paymentHistory.createdAt)],
    limit,
    offset,
  });
}

export async function isStripeSessionProcessed(stripeSessionId: string): Promise<boolean> {
  const result = await db.query.paymentHistory.findFirst({
    where: eq(paymentHistory.stripeSessionId, stripeSessionId),
    columns: { id: true },
  });
  return !!result;
}

export async function getCreditBalancesForUsers(userIds: string[]): Promise<Map<string, number>> {
  if (userIds.length === 0) return new Map();

  const results = await db.query.creditBalance.findMany({
    where: (table, { inArray }) => inArray(table.userId, userIds),
    columns: { userId: true, balance: true },
  });

  return new Map(results.map(r => [r.userId, r.balance]));
}

export async function getUsersWithCreditBalances(
  limit: number = 50,
  offset: number = 0
): Promise<Array<{ user: UserType; balance: number }>> {
  const results = await db
    .select({
      user,
      balance: creditBalance.balance,
    })
    .from(user)
    .leftJoin(creditBalance, eq(user.id, creditBalance.userId))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(user.createdAt));

  return results.map((r) => ({
    user: r.user,
    balance: r.balance ?? 0,
  }));
}
