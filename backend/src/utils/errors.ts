export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = "Bad Request", code?: string) {
    super(message, 400, true, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized", code?: string) {
    super(message, 401, true, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden", code?: string) {
    super(message, 403, true, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Not Found", code?: string) {
    super(message, 404, true, code);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Conflict", code?: string) {
    super(message, 409, true, code);
  }
}

export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(
    errors: Record<string, string[]>,
    message: string = "Validation Error"
  ) {
    super(message, 422, true, "VALIDATION_ERROR");
    this.errors = errors;
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = "Internal Server Error") {
    super(message, 500, false);
  }
}
