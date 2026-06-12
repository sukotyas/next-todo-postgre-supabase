"use client";

import { useState } from "react";

function formatTimestamp(value) {
  if (!value) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

async function parseResponse(request) {
  const response = await request;
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || "The request failed.");
  }

  return payload;
}

export default function TodoApp({ configured, initialTodos, loadError }) {
  const [todos, setTodos] = useState(initialTodos);
  const [title, setTitle] = useState("");
  const [error, setError] = useState(loadError);
  const [isBusy, setIsBusy] = useState(false);
  const totalCount = todos.length;
  const completedCount = todos.filter((todo) => todo.completed).length;
  const openCount = totalCount - completedCount;

  async function refreshTodos() {
    if (!configured) {
      return;
    }

    setIsBusy(true);
    setError("");

    try {
      const payload = await parseResponse(fetch("/api/todos", { cache: "no-store" }));
      setTodos(payload.todos);
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleCreate(event) {
    event.preventDefault();

    const nextTitle = title.trim();
    if (!configured || !nextTitle) {
      return;
    }

    const optimisticTodo = {
      id: `temp-${crypto.randomUUID()}`,
      title: nextTitle,
      completed: false,
      createdAt: new Date().toISOString()
    };

    setTitle("");
    setError("");
    setIsBusy(true);
    setTodos((current) => [optimisticTodo, ...current]);

    try {
      const payload = await parseResponse(
        fetch("/api/todos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ title: nextTitle })
        })
      );

      setTodos((current) =>
        current.map((todo) => (todo.id === optimisticTodo.id ? payload.todo : todo))
      );
    } catch (nextError) {
      setTodos((current) => current.filter((todo) => todo.id !== optimisticTodo.id));
      setTitle(nextTitle);
      setError(nextError.message);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleToggle(todo) {
    if (!configured) {
      return;
    }

    const previousTodos = todos;
    setError("");
    setIsBusy(true);
    setTodos((current) =>
      current.map((item) =>
        item.id === todo.id ? { ...item, completed: !item.completed } : item
      )
    );

    try {
      const payload = await parseResponse(
        fetch(`/api/todos/${todo.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ completed: !todo.completed })
        })
      );

      setTodos((current) =>
        current.map((item) => (item.id === todo.id ? payload.todo : item))
      );
    } catch (nextError) {
      setTodos(previousTodos);
      setError(nextError.message);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDelete(id) {
    if (!configured) {
      return;
    }

    const previousTodos = todos;
    setError("");
    setIsBusy(true);
    setTodos((current) => current.filter((todo) => todo.id !== id));

    try {
      await parseResponse(
        fetch(`/api/todos/${id}`, {
          method: "DELETE"
        })
      );
    } catch (nextError) {
      setTodos(previousTodos);
      setError(nextError.message);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="todo-grid">
      {!configured ? (
        <section className="panel todo-panel setup-banner">
          <h2>PostgreSQL is not configured yet</h2>
          <p className="support-text">
            Add the environment variables below, then run the SQL script in
            <code> database/schema.sql</code>. The app is already ready for VM
            or container deployment after that.
          </p>
          <ul className="env-list">
            <li>
              <code>DATABASE_URL</code>
            </li>
            <li>
              <code>or PGHOST / PGPORT / PGDATABASE / PGUSER / PGPASSWORD</code>
            </li>
          </ul>
        </section>
      ) : null}

      <section className="panel todo-panel">
        <div className="stack-row">
          <div>
            <h2>Tasks</h2>
            <p className="support-text">
              Server-side API routes talk to PostgreSQL directly so the browser never
              sees the database credentials.
            </p>
          </div>
          <button
            className="btn-ghost"
            disabled={!configured || isBusy}
            onClick={refreshTodos}
            type="button"
          >
            Refresh
          </button>
        </div>

        <form className="form-row" onSubmit={handleCreate}>
          <input
            className="input"
            disabled={!configured || isBusy}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add a task to test persistence"
            value={title}
          />
          <button className="btn" disabled={!configured || isBusy || !title.trim()} type="submit">
            Add task
          </button>
        </form>

        <div className="pill-row">
          <span className="pill">{totalCount} total</span>
          <span className="pill">{openCount} open</span>
          <span className="pill">{completedCount} done</span>
        </div>

        {error ? <div className="error-banner">{error}</div> : null}

        {todos.length ? (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li className="todo-item" key={todo.id}>
                <input
                  aria-label={`Mark ${todo.title} as ${todo.completed ? "open" : "done"}`}
                  checked={todo.completed}
                  className="todo-checkbox"
                  disabled={isBusy}
                  onChange={() => handleToggle(todo)}
                  type="checkbox"
                />
                <div>
                  <p className={`todo-title ${todo.completed ? "completed" : ""}`}>
                    {todo.title}
                  </p>
                  <p className="todo-meta">Created {formatTimestamp(todo.createdAt)}</p>
                </div>
                <div className="todo-actions">
                  <button
                    aria-label={`Delete ${todo.title}`}
                    className="icon-btn"
                    disabled={isBusy}
                    onClick={() => handleDelete(todo.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <p>No tasks yet. Add one to verify that create, update, and delete all work.</p>
          </div>
        )}
      </section>
    </div>
  );
}
