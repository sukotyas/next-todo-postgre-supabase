import pg from "pg";

import { getDatabaseConfig } from "./env";

export function getPool() {
  if (!globalThis.__pgPool) {
    const config = getDatabaseConfig();

    globalThis.__pgPool = new pg.Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: config.ssl,
      max: 10
    });
  }

  return globalThis.__pgPool;
}

export async function pingDatabase() {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("select 1");
  } finally {
    client.release();
  }
}
