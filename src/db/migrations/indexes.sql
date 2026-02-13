-- Database Index Optimization for spring-image
-- Run this after applying schema changes

-- ============================================================================
-- User Table Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS "user_email_idx" ON "user" ("email");
CREATE INDEX IF NOT EXISTS "user_username_idx" ON "user" ("username");
CREATE INDEX IF NOT EXISTS "user_role_idx" ON "user" ("role");
CREATE INDEX IF NOT EXISTS "user_created_at_idx" ON "user" ("createdAt");

-- ============================================================================
-- Account Table Indexes
-- ============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS "account_provider_account_idx" ON "account" ("providerId", "accountId");
CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "account" ("userId");
CREATE INDEX IF NOT EXISTS "account_access_token_expires_idx" ON "account" ("accessTokenExpiresAt");

-- ============================================================================
-- Session Table Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS "session_token_idx" ON "session" ("token");
CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "session" ("userId");
CREATE INDEX IF NOT EXISTS "session_expires_at_idx" ON "session" ("expiresAt");
CREATE INDEX IF NOT EXISTS "session_user_expires_idx" ON "session" ("userId", "expiresAt");

-- ============================================================================
-- Verification Table Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS "verification_identifier_value_idx" ON "verification" ("identifier", "value");
CREATE INDEX IF NOT EXISTS "verification_expires_at_idx" ON "verification" ("expiresAt");
CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification" ("identifier");

-- ============================================================================
-- Credit Balance Table Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS "credit_balance_user_id_idx" ON "credit_balance" ("user_id");
CREATE INDEX IF NOT EXISTS "credit_balance_balance_idx" ON "credit_balance" ("balance");

-- ============================================================================
-- Credit Transaction Table Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS "credit_transaction_user_id_idx" ON "credit_transaction" ("user_id");
CREATE INDEX IF NOT EXISTS "credit_transaction_created_at_idx" ON "credit_transaction" ("created_at");
CREATE INDEX IF NOT EXISTS "credit_transaction_user_created_at_idx" ON "credit_transaction" ("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "credit_transaction_stripe_session_id_idx" ON "credit_transaction" ("stripe_session_id");
CREATE INDEX IF NOT EXISTS "credit_transaction_reason_idx" ON "credit_transaction" ("reason");

-- ============================================================================
-- Payment History Table Indexes
-- ============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS "payment_history_stripe_session_id_idx" ON "payment_history" ("stripe_session_id");
CREATE INDEX IF NOT EXISTS "payment_history_user_id_idx" ON "payment_history" ("user_id");
CREATE INDEX IF NOT EXISTS "payment_history_created_at_idx" ON "payment_history" ("created_at");
CREATE INDEX IF NOT EXISTS "payment_history_user_created_at_idx" ON "payment_history" ("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "payment_history_stripe_payment_intent_id_idx" ON "payment_history" ("stripe_payment_intent_id");
CREATE INDEX IF NOT EXISTS "payment_history_status_idx" ON "payment_history" ("status");
CREATE INDEX IF NOT EXISTS "payment_history_price_id_idx" ON "payment_history" ("price_id");

-- ============================================================================
-- Maintenance Queries
-- ============================================================================

-- Analyze tables after creating indexes
ANALYZE "user";
ANALYZE "account";
ANALYZE "session";
ANALYZE "verification";
ANALYZE "credit_balance";
ANALYZE "credit_transaction";
ANALYZE "payment_history";

-- Update table statistics
REINDEX TABLE "user";
REINDEX TABLE "account";
REINDEX TABLE "session";
REINDEX TABLE "verification";
REINDEX TABLE "credit_balance";
REINDEX TABLE "credit_transaction";
REINDEX TABLE "payment_history";
