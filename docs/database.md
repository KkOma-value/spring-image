# Database Documentation

## Overview

Spring Image uses PostgreSQL with Drizzle ORM for type-safe database operations.

## Schema Structure

### Auth Tables

#### User
- Primary user account information
- Indexed fields: email, username, role, createdAt
- Row Level Security (RLS) enabled

#### Session
- Authentication sessions with Better Auth
- Indexed: token, userId, expiresAt
- Auto-cleanup support via expiresAt index

#### Account
- OAuth provider account linking

### Billing Tables

#### Credit Balance
- Real-time credit tracking per user
- Atomic increment/decrement operations
- Cascade delete with user

#### Credit Transaction
- Audit trail of all credit changes
- Indexed: userId, createdAt (composite)
- Transaction types: image_generation, checkout, refund

#### Payment History
- Stripe payment records
- Unique constraint: stripeSessionId (idempotency)
- Indexed: userId, createdAt

## Performance

### Connection Pooling
- Max connections: 10 (production)
- Idle timeout: 20s
- Connection lifetime: 30min
- Prepared statements enabled

### Indexes
All foreign keys and query fields have indexes for optimal performance.

## Migrations

```bash
npm run db:generate   # Generate migration
npm run db:migrate    # Apply migrations
npm run db:studio     # Open Drizzle Studio
```

## Backup

```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```
