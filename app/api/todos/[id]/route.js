import { NextResponse } from "next/server";

import {
  getMissingDatabaseConfigMessage,
  hasDatabaseConfig
} from "../../../../lib/env";
import { deleteTodo, updateTodo } from "../../../../lib/todos";

function configErrorResponse() {
  return NextResponse.json(
    { error: getMissingDatabaseConfigMessage() },
    { status: 500 }
  );
}

export async function PATCH(request, { params }) {
  if (!hasDatabaseConfig()) {
    return configErrorResponse();
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const todo = await updateTodo(id, body);
    return NextResponse.json({ todo });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(_request, { params }) {
  if (!hasDatabaseConfig()) {
    return configErrorResponse();
  }

  try {
    const { id } = await params;
    await deleteTodo(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
