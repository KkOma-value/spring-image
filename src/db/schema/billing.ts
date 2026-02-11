import { integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import { user } from "./auth/user";

export const creditBalance = pgTable("credit_balance", {
  userId: text("user_id")
    .primaryKey()
    .notNull()
    .references(() => user.id),
  balance: integer("balance").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const creditTransaction = pgTable("credit_transaction", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  amount: integer("amount").notNull(),
  reason: text("reason").notNull(),
  stripeSessionId: text("stripe_session_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const paymentHistory = pgTable(
  "payment_history",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    stripeSessionId: text("stripe_session_id").notNull(),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    priceId: text("price_id").notNull(),
    amount: integer("amount").notNull(),
    currency: text("currency").notNull(),
    status: text("status").notNull(),
    creditsGranted: integer("credits_granted").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    stripeSessionIdIndex: uniqueIndex(
      "payment_history_stripe_session_id_idx",
    ).on(table.stripeSessionId),
  }),
);
