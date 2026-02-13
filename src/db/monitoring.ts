import { db } from "./index";
import { sql } from "drizzle-orm";

export async function getSlowQueries(limit: number = 10): Promise<
  Array<{ query: string; calls: number; totalTime: number; meanTime: number; rows: number }>
> {
  try {
    const result = await db.execute(sql`
      SELECT
        query,
        calls,
        total_exec_time as total_time,
        mean_exec_time as mean_time,
        rows
      FROM pg_stat_statements
      WHERE query NOT LIKE '%pg_stat_statements%'
      ORDER BY mean_exec_time DESC
      LIMIT ${limit}
    `);

    return result.map((row) => ({
      query: String(row.query),
      calls: Number(row.calls),
      totalTime: Number(row.total_time),
      meanTime: Number(row.mean_time),
      rows: Number(row.rows),
    }));
  } catch {
    return [];
  }
}

export async function getTableStats(): Promise<
  Array<{
    tableName: string;
    seqScans: number;
    idxScans: number;
    nTupIns: number;
    nTupUpd: number;
    nTupDel: number;
    nLiveTup: number;
    nDeadTup: number;
  }>
> {
  try {
    const result = await db.execute(sql`
      SELECT
        relname as table_name,
        seq_scan,
        idx_scan,
        n_tup_ins,
        n_tup_upd,
        n_tup_del,
        n_live_tup,
        n_dead_tup
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
      ORDER BY n_live_tup DESC
    `);

    return result.map((row) => ({
      tableName: String(row.table_name),
      seqScans: Number(row.seq_scan),
      idxScans: Number(row.idx_scan),
      nTupIns: Number(row.n_tup_ins),
      nTupUpd: Number(row.n_tup_upd),
      nTupDel: Number(row.n_tup_del),
      nLiveTup: Number(row.n_live_tup),
      nDeadTup: Number(row.n_dead_tup),
    }));
  } catch {
    return [];
  }
}

export async function getIndexUsage(): Promise<
  Array<{
    tableName: string;
    indexName: string;
    idxScan: number;
    idxTupRead: number;
    idxTupFetch: number;
  }>
> {
  try {
    const result = await db.execute(sql`
      SELECT
        relname as table_name,
        indexrelname as index_name,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
      ORDER BY idx_scan DESC
    `);

    return result.map((row) => ({
      tableName: String(row.table_name),
      indexName: String(row.index_name),
      idxScan: Number(row.idx_scan),
      idxTupRead: Number(row.idx_tup_read),
      idxTupFetch: Number(row.idx_tup_fetch),
    }));
  } catch {
    return [];
  }
}

export async function getUnusedIndexes(): Promise<
  Array<{ tableName: string; indexName: string }>
> {
  try {
    const result = await db.execute(sql`
      SELECT
        relname as table_name,
        indexrelname as index_name
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
        AND idx_scan = 0
        AND indexrelname NOT LIKE '%pkey%'
      ORDER BY relname, indexrelname
    `);

    return result.map((row) => ({
      tableName: String(row.table_name),
      indexName: String(row.index_name),
    }));
  } catch {
    return [];
  }
}

export async function getDatabaseSize(): Promise<{
  databaseName: string;
  size: string;
  sizeBytes: number;
}> {
  try {
    const result = await db.execute(sql`
      SELECT
        pg_database.datname as database_name,
        pg_size_pretty(pg_database_size(pg_database.datname)) as size,
        pg_database_size(pg_database.datname) as size_bytes
      FROM pg_database
      WHERE datname = current_database()
    `);

    const row = result[0];
    return {
      databaseName: String(row.database_name),
      size: String(row.size),
      sizeBytes: Number(row.size_bytes),
    };
  } catch {
    return { databaseName: "", size: "0", sizeBytes: 0 };
  }
}

export async function runPerformanceReport(): Promise<{
  slowQueries: Awaited<ReturnType<typeof getSlowQueries>>;
  tableStats: Awaited<ReturnType<typeof getTableStats>>;
  indexUsage: Awaited<ReturnType<typeof getIndexUsage>>;
  unusedIndexes: Awaited<ReturnType<typeof getUnusedIndexes>>;
  databaseSize: Awaited<ReturnType<typeof getDatabaseSize>>;
}> {
  const [slowQueries, tableStats, indexUsage, unusedIndexes, databaseSize] = await Promise.all([
    getSlowQueries(),
    getTableStats(),
    getIndexUsage(),
    getUnusedIndexes(),
    getDatabaseSize(),
  ]);

  return { slowQueries, tableStats, indexUsage, unusedIndexes, databaseSize };
}
