import { eq, sql } from "drizzle-orm";
import { db } from "./index";
import { creditBalance, creditTransaction } from "./schema/billing";
import { randomUUID } from "crypto";

interface CreditOperationResult {
  success: boolean;
  newBalance: number;
  error?: string;
}

export async function deductCreditsTransaction(
  userId: string,
  amount: number,
  reason: string = "image_generation"
): Promise<CreditOperationResult> {
  return db.transaction(async (tx) => {
    await tx
      .insert(creditBalance)
      .values({ userId, balance: 0 })
      .onConflictDoNothing();

    const updated = await tx
      .update(creditBalance)
      .set({
        balance: sql`${creditBalance.balance} - ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(creditBalance.userId, userId))
      .returning({ balance: creditBalance.balance });

    const newBalance = updated[0]?.balance;

    if (newBalance === undefined || newBalance < 0) {
      throw new Error("INSUFFICIENT_CREDITS");
    }

    await tx.insert(creditTransaction).values({
      id: randomUUID(),
      userId,
      amount: -amount,
      reason,
    });

    return { success: true, newBalance };
  }).catch((error) => {
    if (error.message === "INSUFFICIENT_CREDITS") {
      return { success: false, newBalance: 0, error: "INSUFFICIENT_CREDITS" };
    }
    throw error;
  });
}

export async function addCreditsTransaction(
  userId: string,
  amount: number,
  reason: string,
  stripeSessionId?: string
): Promise<CreditOperationResult> {
  return db.transaction(async (tx) => {
    await tx
      .insert(creditBalance)
      .values({ userId, balance: 0 })
      .onConflictDoNothing();

    const updated = await tx
      .update(creditBalance)
      .set({
        balance: sql`${creditBalance.balance} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(creditBalance.userId, userId))
      .returning({ balance: creditBalance.balance });

    const newBalance = updated[0]?.balance ?? amount;

    await tx.insert(creditTransaction).values({
      id: randomUUID(),
      userId,
      amount,
      reason,
      stripeSessionId,
    });

    return { success: true, newBalance };
  });
}

export async function transferCreditsTransaction(
  fromUserId: string,
  toUserId: string,
  amount: number,
  reason: string = "transfer"
): Promise<{ success: boolean; fromBalance: number; toBalance: number; error?: string }> {
  return db.transaction(async (tx) => {
    await tx
      .insert(creditBalance)
      .values([
        { userId: fromUserId, balance: 0 },
        { userId: toUserId, balance: 0 },
      ])
      .onConflictDoNothing();

    const fromUpdated = await tx
      .update(creditBalance)
      .set({
        balance: sql`${creditBalance.balance} - ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(creditBalance.userId, fromUserId))
      .returning({ balance: creditBalance.balance });

    const fromBalance = fromUpdated[0]?.balance;

    if (fromBalance === undefined || fromBalance < 0) {
      throw new Error("INSUFFICIENT_CREDITS");
    }

    const toUpdated = await tx
      .update(creditBalance)
      .set({
        balance: sql`${creditBalance.balance} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(creditBalance.userId, toUserId))
      .returning({ balance: creditBalance.balance });

    const toBalance = toUpdated[0]?.balance ?? amount;

    await tx.insert(creditTransaction).values([
      {
        id: randomUUID(),
        userId: fromUserId,
        amount: -amount,
        reason: `${reason}_sent`,
      },
      {
        id: randomUUID(),
        userId: toUserId,
        amount,
        reason: `${reason}_received`,
      },
    ]);

    return { success: true, fromBalance, toBalance };
  }).catch((error) => {
    if (error.message === "INSUFFICIENT_CREDITS") {
      return { success: false, fromBalance: 0, toBalance: 0, error: "INSUFFICIENT_CREDITS" };
    }
    throw error;
  });
}

type TransactionClient = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function withTransactionRetry<T>(
  fn: (tx: TransactionClient) => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await db.transaction(fn);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      const isRetryable =
        lastError.message.includes("deadlock") ||
        lastError.message.includes("connection") ||
        lastError.message.includes("timeout");

      if (!isRetryable || attempt === maxRetries) {
        throw lastError;
      }

      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError ?? new Error("Transaction failed");
}

export async function batchCreditOperations(
  operations: Array<{
    userId: string;
    amount: number;
    reason: string;
    stripeSessionId?: string;
  }>
): Promise<Map<string, CreditOperationResult>> {
  return db.transaction(async (tx) => {
    const results = new Map<string, CreditOperationResult>();

    const userIds = [...new Set(operations.map((op) => op.userId))];
    await tx
      .insert(creditBalance)
      .values(userIds.map((userId) => ({ userId, balance: 0 })))
      .onConflictDoNothing();

    for (const op of operations) {
      try {
        const updated = await tx
          .update(creditBalance)
          .set({
            balance: sql`${creditBalance.balance} + ${op.amount}`,
            updatedAt: new Date(),
          })
          .where(eq(creditBalance.userId, op.userId))
          .returning({ balance: creditBalance.balance });

        const newBalance = updated[0]?.balance ?? op.amount;

        if (newBalance < 0) {
          results.set(op.userId, { success: false, newBalance: 0, error: "INSUFFICIENT_CREDITS" });
          continue;
        }

        await tx.insert(creditTransaction).values({
          id: randomUUID(),
          userId: op.userId,
          amount: op.amount,
          reason: op.reason,
          stripeSessionId: op.stripeSessionId,
        });

        results.set(op.userId, { success: true, newBalance });
      } catch (error) {
        results.set(op.userId, {
          success: false,
          newBalance: 0,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  });
}
