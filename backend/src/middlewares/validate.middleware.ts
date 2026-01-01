import { Request, Response, NextFunction, RequestHandler } from "express";
import { z, ZodError, ZodSchema } from "zod";
import { ValidationError } from "../utils/errors.js";

export const validate = (schema: ZodSchema): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      // Parse the entire request object (body, query, params)
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace with parsed data (this includes transformations and defaults)
      if (parsed.body) req.body = parsed.body;
      if (parsed.query) req.query = parsed.query;
      if (parsed.params) req.params = parsed.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};

        error.errors.forEach((err) => {
          // Remove 'body.', 'query.', 'params.' prefix for cleaner error messages
          const path = err.path
            .filter((p) => p !== "body" && p !== "query" && p !== "params")
            .join(".");
          const key = path || "general";
          if (!errors[key]) {
            errors[key] = [];
          }
          errors[key].push(err.message);
        });

        next(new ValidationError(errors));
      } else {
        next(error);
      }
    }
  };
};

// Commonly used validation schemas
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => parseInt(val || "1", 10)),
  limit: z
    .string()
    .optional()
    .transform((val) => parseInt(val || "10", 10)),
});

export const idParamSchema = z.object({
  id: z.string().min(1, "ID tidak valid"),
});

export const searchSchema = z.object({
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});
