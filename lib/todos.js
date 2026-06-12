import { getPool } from "./db";

function mapTodo(row) {
  return {
    id: Number(row.id),
    title: row.title,
    completed: Boolean(row.completed),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString()
  };
}

function normalizeTitle(title) {
  const nextTitle = typeof title === "string" ? title.trim() : "";

  if (!nextTitle) {
    throw new Error("A todo title is required.");
  }

  return nextTitle;
}

function normalizeTodoId(id) {
  const nextId = Number.parseInt(id, 10);

  if (!Number.isInteger(nextId) || nextId < 1) {
    throw new Error("Invalid todo id.");
  }

  return nextId;
}

async function getTodoById(id) {
  const pool = getPool();
  const { rows } = await pool.query(
    `
      select id, title, completed, created_at, updated_at
      from todos
      where id = $1
      limit 1
    `,
    [id]
  );

  if (!rows.length) {
    throw new Error("Todo not found.");
  }

  return mapTodo(rows[0]);
}

export async function listTodos() {
  const pool = getPool();
  const { rows } = await pool.query(`
    select id, title, completed, created_at, updated_at
    from todos
    order by created_at desc, id desc
  `);

  return rows.map(mapTodo);
}

export async function createTodo(title) {
  const pool = getPool();
  const { rows } = await pool.query(
    "insert into todos (title) values ($1) returning id",
    [normalizeTitle(title)]
  );

  return getTodoById(rows[0].id);
}

export async function updateTodo(id, input) {
  const todoId = normalizeTodoId(id);
  const fields = [];
  const values = [];

  if (typeof input.title !== "undefined") {
    values.push(normalizeTitle(input.title));
    fields.push(`title = $${values.length}`);
  }

  if (typeof input.completed !== "undefined") {
    values.push(Boolean(input.completed));
    fields.push(`completed = $${values.length}`);
  }

  if (!fields.length) {
    throw new Error("At least one todo field must be provided.");
  }

  values.push(todoId);

  const pool = getPool();
  const { rowCount } = await pool.query(
    `update todos set ${fields.join(", ")} where id = $${values.length}`,
    values
  );

  if (!rowCount) {
    throw new Error("Todo not found.");
  }

  return getTodoById(todoId);
}

export async function deleteTodo(id) {
  const todoId = normalizeTodoId(id);
  const pool = getPool();
  const { rowCount } = await pool.query(
    "delete from todos where id = $1",
    [todoId]
  );

  if (!rowCount) {
    throw new Error("Todo not found.");
  }
}
