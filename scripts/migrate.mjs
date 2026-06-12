import {
  createDatabaseConnection,
  ensureDatabaseExists,
  readSchemaSql
} from "./db-utils.mjs";

async function run() {
  const database = await ensureDatabaseExists();
  const client = await createDatabaseConnection();

  try {
    const schemaSql = await readSchemaSql();
    await client.query(schemaSql);

    const { rows } = await client.query(
      "select count(*)::int as total from todos"
    );

    console.log(
      `Migration complete. Database "${database}" is ready with ${rows[0].total} existing todos.`
    );
  } finally {
    await client.end();
  }
}

run().catch((error) => {
  console.error(`Migration failed: ${error.message}`);
  process.exitCode = 1;
});
