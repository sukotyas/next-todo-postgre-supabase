import pg from "pg";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.resolve(__dirname, "../database/schema.sql");

function required(name, value) {
  if (!value) {
    throw new Error(`Missing required database setting: ${name}`);
  }

  return value;
}

// Managed Postgres (Supabase, Neon, RDS, etc.) requires TLS. Enabled when the
// URL asks for it (?sslmode=require), when PGSSLMODE is set, or DATABASE_SSL is set.
function resolveSsl(searchParams) {
  const mode =
    searchParams?.get?.("sslmode") ||
    process.env.PGSSLMODE ||
    (process.env.DATABASE_SSL ? "require" : "");

  if (!mode || mode === "disable") {
    return false;
  }

  return { rejectUnauthorized: false };
}

export function getDatabaseConfigFromEnv() {
  if (process.env.DATABASE_URL) {
    const databaseUrl = new URL(process.env.DATABASE_URL);
    const database = databaseUrl.pathname.replace(/^\//, "");

    return {
      host: required("DATABASE_URL hostname", databaseUrl.hostname),
      port: Number.parseInt(databaseUrl.port || "5432", 10),
      database: required("DATABASE_URL database name", database),
      user: decodeURIComponent(databaseUrl.username),
      password: decodeURIComponent(databaseUrl.password),
      ssl: resolveSsl(databaseUrl.searchParams)
    };
  }

  return {
    host: required("PGHOST", process.env.PGHOST),
    port: Number.parseInt(process.env.PGPORT || "5432", 10),
    database: required("PGDATABASE", process.env.PGDATABASE),
    user: required("PGUSER", process.env.PGUSER),
    password: typeof process.env.PGPASSWORD === "undefined" ? "" : process.env.PGPASSWORD,
    ssl: resolveSsl()
  };
}

export function quoteIdentifier(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

// Postgres has no "CREATE DATABASE IF NOT EXISTS", and you cannot create a
// database from a connection to that same database. So connect to the default
// "postgres" maintenance database, check for the target, and create it if missing.
export async function ensureDatabaseExists() {
  const { database, ...connectionConfig } = getDatabaseConfigFromEnv();

  const client = new pg.Client({ ...connectionConfig, database: "postgres" });

  try {
    await client.connect();
    const { rowCount } = await client.query(
      "select 1 from pg_database where datname = $1",
      [database]
    );

    if (rowCount === 0) {
      await client.query(`create database ${quoteIdentifier(database)}`);
    }
  } catch (error) {
    // On managed hosts (Supabase, Neon, etc.) the database already exists and
    // you usually can't connect to "postgres" or run CREATE DATABASE. That's
    // fine: warn and continue, then apply the schema to the target database.
    // 42P04 = duplicate_database from a harmless race.
    if (error.code !== "42P04") {
      console.warn(
        `Skipping database creation (${error.message}). Assuming "${database}" already exists.`
      );
    }
  } finally {
    await client.end().catch(() => {});
  }

  return database;
}

export async function createDatabaseConnection() {
  const client = new pg.Client(getDatabaseConfigFromEnv());
  await client.connect();
  return client;
}

export async function readSchemaSql() {
  return readFile(schemaPath, "utf8");
}
