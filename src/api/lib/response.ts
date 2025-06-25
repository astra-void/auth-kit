import { NextResponse } from "next/server";

export function errorResponse(
  message = "Internal server error",
  status = 500
) {
  return NextResponse.json({ error: message, success: false }, { status });
}