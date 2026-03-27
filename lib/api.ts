import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return apiError(error.issues[0]?.message ?? "Invalid request payload.", 400);
  }

  if (error instanceof Error) {
    return apiError(error.message, 400);
  }

  return apiError("Something went wrong.", 500);
}
