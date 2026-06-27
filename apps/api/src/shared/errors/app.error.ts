export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);

    this.statusCode = statusCode;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const ErrorCode = {
  EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  CLASSROOM_NOT_FOUND: "CLASSROOM_NOT_FOUND",
  FORBIDDEN: "FORBIDDEN_ACTION",
  VOCAB_NOT_FOUND: "VOCAB_NOT_FOUND",
  VOCAB_ITEM_NOT_FOUND: "VOCAB_ITEM_NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;
