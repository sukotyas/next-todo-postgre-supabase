import { NextResponse } from "next/server";

import {
  getMissingDatabaseConfigMessage,
  hasDatabaseConfig
} from "../../../lib/env";
import { createTodo, listTodos } from "../../../lib/todos";

function configErrorResponse() {
  return NextResponse.json(
    { error: getMissingDatabaseConfigMessage() },
    { status: 500 }
  );
}

export async function GET() {
  if (!hasDatabaseConfig()) {
    return configErrorResponse();
  }

  try {
    const todos = await listTodos();
    return NextResponse.json({ todos });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!hasDatabaseConfig()) {
    return configErrorResponse();
  }

  try {
    const body = await request.json();
    const todo = await createTodo(body.title);
    return NextResponse.json({ todo }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
