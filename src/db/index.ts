import * as schema from "./schema";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const isProduction = process.env.NODE_ENV === "production";
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const client = postgres(databaseUrl, {
  max: isProduction ? 10 : 20,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: true,
  max_lifetime: 60 * 30,
  ssl: isProduction ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(client, {
  schema,
  logger: !isProduction,
});

export type DB = typeof db;

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await client`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  await client.end();
}
