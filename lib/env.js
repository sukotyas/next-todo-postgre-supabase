const missingDatabaseConfigMessage =
  "PostgreSQL is not configured. Set DATABASE_URL or PGHOST, PGPORT, PGDATABASE, PGUSER, and PGPASSWORD.";

// Managed Postgres (Supabase, Neon, RDS, etc.) requires TLS. Enable it when the
// connection string asks for it (?sslmode=require), when PGSSLMODE is set, or
// when DATABASE_SSL is truthy. Local/Docker Postgres needs none, so it stays off.
export function resolveSsl(searchParams) {
  const mode =
    searchParams?.get?.("sslmode") ||
    process.env.PGSSLMODE ||
    (process.env.DATABASE_SSL ? "require" : "");

  if (!mode || mode === "disable") {
    return false;
  }

  return { rejectUnauthorized: false };
}

export function hasDatabaseConfig() {
  if (process.env.DATABASE_URL) {
    return true;
  }

  return Boolean(
    process.env.PGHOST &&
      process.env.PGDATABASE &&
      process.env.PGUSER &&
      typeof process.env.PGPASSWORD !== "undefined"
  );
}

export function getDatabaseConfig() {
  if (!hasDatabaseConfig()) {
    throw new Error(missingDatabaseConfigMessage);
  }

  if (process.env.DATABASE_URL) {
    const databaseUrl = new URL(process.env.DATABASE_URL);

    return {
      host: databaseUrl.hostname,
      port: Number.parseInt(databaseUrl.port || "5432", 10),
      database: databaseUrl.pathname.replace(/^\//, ""),
      user: decodeURIComponent(databaseUrl.username),
      password: decodeURIComponent(databaseUrl.password),
      ssl: resolveSsl(databaseUrl.searchParams)
    };
  }

  return {
    host: process.env.PGHOST,
    port: Number.parseInt(process.env.PGPORT || "5432", 10),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: resolveSsl()
  };
}

export function getMissingDatabaseConfigMessage() {
  return missingDatabaseConfigMessage;
}
