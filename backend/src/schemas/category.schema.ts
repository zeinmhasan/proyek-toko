import { z } from "zod";

// Create Category
export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Nama kategori wajib diisi" })
      .min(2, "Nama minimal 2 karakter")
      .max(50, "Nama maksimal 50 karakter"),
    description: z
      .string()
      .max(255, "Deskripsi maksimal 255 karakter")
      .optional(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, "Format warna tidak valid (contoh: #3B82F6)")
      .optional()
      .default("#3B82F6"),
    icon: z.string().max(50, "Icon maksimal 50 karakter").optional(),
  }),
});

// Update Category
export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string({ required_error: "ID kategori wajib diisi" }),
  }),
  body: z.object({
    name: z
      .string()
      .min(2, "Nama minimal 2 karakter")
      .max(50, "Nama maksimal 50 karakter")
      .optional(),
    description: z
      .string()
      .max(255, "Deskripsi maksimal 255 karakter")
      .optional()
      .nullable(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, "Format warna tidak valid (contoh: #3B82F6)")
      .optional(),
    icon: z.string().max(50, "Icon maksimal 50 karakter").optional().nullable(),
  }),
});

// Get Category by ID
export const getCategorySchema = z.object({
  params: z.object({
    id: z.string({ required_error: "ID kategori wajib diisi" }),
  }),
});

// Delete Category
export const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string({ required_error: "ID kategori wajib diisi" }),
  }),
});

// List Categories with pagination
export const listCategoriesSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(10),
    search: z.string().optional(),
    sortBy: z
      .enum(["name", "createdAt", "updatedAt"])
      .optional()
      .default("name"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
  }),
});

// Type exports
export type CreateCategoryInput = z.infer<typeof createCategorySchema>["body"];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>["body"];
export type ListCategoriesQuery = z.infer<typeof listCategoriesSchema>["query"];
