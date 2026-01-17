import { ErrorRequestHandler } from "express";
import { Prisma } from "../generated/client";

export class customError extends Error {
  statusCode: number;
  constructor(StatusCode: number, message: string) {
    super(message);
    this.statusCode = StatusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const globalErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  let statusCode = 500;
  let message = "Something went wrong";
  const errorMessages: { path?: string; message?: string }[] = [];

  if (err instanceof customError) {
    statusCode = err.statusCode;
    message = err.message;
    errorMessages.push({
      path: "",
      message: err.message,
    });
  }

  // Prisma known request error (constraint issues)
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = 400;
      message = "Duplicate field value";
      errorMessages.push({
        path: err.meta?.target?.toString() || "unknown",
        message: `${err.meta?.target} already exists`,
      });
    } else {
      message = "Database error";
      errorMessages.push({
        path: "database",
        message: err.message,
      });
    }
  }

  // Prisma validation errors
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid data sent to database";
    errorMessages.push({
      path: "validation",
      message: err.message,
    });
  }

  // Standard JS Error
  else if (err instanceof Error) {
    message = err.message;
    errorMessages.push({
      path: "",
      message: err.message,
    });
  }

  // Fallback: unknown error shape
  else {
    errorMessages.push({
      path: "",
      message: "Unknown error occurred",
    });
  }

  // Final response
  res.status(statusCode).json({
    success: false,
    message,
    errorMessages,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  console.error("🔥 Global Error Handler:", err);
};
