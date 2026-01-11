import { NextResponse } from "next/server";
import { z } from "zod";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function unauthorized(message = "Unauthorized") {
  return new ApiError(message, 401);
}

export function forbidden(message = "Forbidden") {
  return new ApiError(message, 403);
}

export function notFound(message = "Not found") {
  return new ApiError(message, 404);
}

export function badRequest(message = "Bad request") {
  return new ApiError(message, 400);
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: error.errors[0].message },
      { status: 400 }
    );
  }

  if (error instanceof Error && error.message.includes("token")) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  console.error("Unexpected error:", error);
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Internal server error" },
    { status: 500 }
  );
}
