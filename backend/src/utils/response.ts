import { Response } from "express";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  errors?: Record<string, string[]>;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200,
  meta?: ApiResponse["meta"]
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

export const sendCreated = <T>(
  res: Response,
  data: T,
  message: string = "Created successfully"
): Response => {
  return sendSuccess(res, data, message, 201);
};

export const sendNoContent = (res: Response): Response => {
  return res.status(204).send();
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  errors?: Record<string, string[]>
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): Response => {
  const totalPages = Math.ceil(total / limit);

  return sendSuccess(res, data, message, 200, {
    page,
    limit,
    total,
    totalPages,
  });
};
