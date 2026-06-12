import { createDatabaseConnection } from "./db-utils.mjs";

const seedTodos = [
  ["Provision VM instance", false],
  ["Build container image", false],
  ["Point app at PostgreSQL", true]
];

async function run() {
  const client = await createDatabaseConnection();

  try {
    const { rows } = await client.query(
      "select count(*)::int as total from todos"
    );

    if (rows[0].total > 0) {
      console.log(
        `Seed skipped. Table "todos" already has ${rows[0].total} rows.`
      );
      return;
    }

    const values = [];
    const placeholders = seedTodos
      .map((todo, index) => {
        const base = index * 2;
        values.push(todo[0], todo[1]);
        return `($${base + 1}, $${base + 2})`;
      })
      .join(", ");

    await client.query(
      `insert into todos (title, completed) values ${placeholders}`,
      values
    );

    const { rows: afterRows } = await client.query(
      "select count(*)::int as total from todos"
    );

    console.log(`Seed complete. Inserted ${afterRows[0].total} todos.`);
  } finally {
    await client.end();
  }
}

run().catch((error) => {
  console.error(`Seeding failed: ${error.message}`);
  process.exitCode = 1;
});
