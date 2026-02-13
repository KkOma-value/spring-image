import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    identifierValueIdx: index("verification_identifier_value_idx").on(
      table.identifier,
      table.value
    ),
    expiresAtIdx: index("verification_expires_at_idx").on(table.expiresAt),
    identifierIdx: index("verification_identifier_idx").on(table.identifier),
  })
).enableRLS();

export type VerificationType = typeof verification.$inferSelect;
export type NewVerificationType = typeof verification.$inferInsert;
