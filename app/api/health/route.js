import { NextResponse } from "next/server";

import { hasDatabaseConfig } from "../../../lib/env";
import { pingDatabase } from "../../../lib/db";

export async function GET() {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({
      status: "ok",
      app: "simple-to-do-list",
      database: "not_configured",
      now: new Date().toISOString()
    });
  }

  try {
    await pingDatabase();
  } catch (error) {
    return NextResponse.json(
      {
        status: "degraded",
        app: "simple-to-do-list",
        database: "connection_error",
        error: error.message,
        now: new Date().toISOString()
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    status: "ok",
    app: "simple-to-do-list",
    database: "connected",
    now: new Date().toISOString()
  });
}
