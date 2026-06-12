import TodoApp from "../components/todo-app";
import { hasDatabaseConfig } from "../lib/env";
import { listTodos } from "../lib/todos";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const configured = hasDatabaseConfig();
  let initialTodos = [];
  let loadError = "";

  if (configured) {
    try {
      initialTodos = await listTodos();
    } catch (error) {
      loadError = error.message;
    }
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Next.js + PostgreSQL</p>
        <h1>ToDo List</h1>
        <p className="hero-copy">
          This app keeps the stack intentionally small: one Next.js app, no
          authentication, and a PostgreSQL table behind server-side API routes.
        </p>
      </section>
      <TodoApp
        configured={configured}
        initialTodos={initialTodos}
        loadError={loadError}
      />
    </main>
  );
}
