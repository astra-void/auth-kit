/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

export function successResponse(
  params: { 
    message?: string;
    data?: any;
    status: number; 
  } = { message: "Success", data: {}, status: 200 }
) {
  const { message, data, status } = params;
  return NextResponse.json({ message, data, success: true }, { status });
}

export function errorResponse(
  message = "Internal server error",
  status = 500
) {
  return NextResponse.json({ error: message, success: false }, { status });
} 