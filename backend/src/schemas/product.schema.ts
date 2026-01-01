import { z } from "zod";

// Create Product
export const createProductSchema = z.object({
  body: z.object({
    sku: z
      .string({ required_error: "SKU wajib diisi" })
      .min(3, "SKU minimal 3 karakter")
      .max(50, "SKU maksimal 50 karakter")
      .regex(/^[A-Za-z0-9\-_]+$/, "SKU hanya boleh huruf, angka, - dan _"),
    name: z
      .string({ required_error: "Nama produk wajib diisi" })
      .min(2, "Nama minimal 2 karakter")
      .max(100, "Nama maksimal 100 karakter"),
    description: z
      .string()
      .max(500, "Deskripsi maksimal 500 karakter")
      .optional(),
    price: z
      .number({ required_error: "Harga jual wajib diisi" })
      .positive("Harga harus lebih dari 0"),
    costPrice: z.number().positive("Harga modal harus lebih dari 0").optional(),
    stock: z
      .number()
      .int()
      .min(0, "Stok tidak boleh negatif")
      .optional()
      .default(0),
    minStock: z
      .number()
      .int()
      .min(0, "Stok minimum tidak boleh negatif")
      .optional()
      .default(5),
    unit: z
      .string()
      .max(20, "Unit maksimal 20 karakter")
      .optional()
      .default("pcs"),
    image: z.string().url("URL gambar tidak valid").optional(),
    categoryId: z.string().optional(),
    isActive: z.boolean().optional().default(true),
  }),
});

// Update Product
export const updateProductSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "ID produk wajib diisi" }),
  }),
  body: z.object({
    sku: z
      .string()
      .min(3, "SKU minimal 3 karakter")
      .max(50, "SKU maksimal 50 karakter")
      .regex(/^[A-Za-z0-9\-_]+$/, "SKU hanya boleh huruf, angka, - dan _")
      .optional(),
    name: z
      .string()
      .min(2, "Nama minimal 2 karakter")
      .max(100, "Nama maksimal 100 karakter")
      .optional(),
    description: z
      .string()
      .max(500, "Deskripsi maksimal 500 karakter")
      .optional()
      .nullable(),
    price: z.number().positive("Harga harus lebih dari 0").optional(),
    costPrice: z
      .number()
      .positive("Harga modal harus lebih dari 0")
      .optional()
      .nullable(),
    stock: z.number().int().min(0, "Stok tidak boleh negatif").optional(),
    minStock: z
      .number()
      .int()
      .min(0, "Stok minimum tidak boleh negatif")
      .optional(),
    unit: z.string().max(20, "Unit maksimal 20 karakter").optional(),
    image: z.string().url("URL gambar tidak valid").optional().nullable(),
    categoryId: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

// Get Product by ID
export const getProductSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "ID produk wajib diisi" }),
  }),
});

// Delete Product
export const deleteProductSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "ID produk wajib diisi" }),
  }),
});

// List Products with pagination and filters
export const listProductsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(10),
    search: z.string().optional(),
    categoryId: z.string().optional(),
    isActive: z
      .string()
      .transform((val) => val === "true")
      .optional(),
    lowStock: z
      .string()
      .transform((val) => val === "true")
      .optional(),
    sortBy: z
      .enum(["name", "price", "stock", "sku", "createdAt", "updatedAt"])
      .optional()
      .default("name"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
  }),
});

// Update Stock
export const updateStockSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "ID produk wajib diisi" }),
  }),
  body: z.object({
    quantity: z
      .number({ required_error: "Jumlah wajib diisi" })
      .int("Jumlah harus bilangan bulat"),
    type: z.enum(["add", "subtract", "set"], {
      required_error: "Tipe perubahan stok wajib diisi",
    }),
    reason: z.string().max(255, "Alasan maksimal 255 karakter").optional(),
  }),
});

// Type exports
export type CreateProductInput = z.infer<typeof createProductSchema>["body"];
export type UpdateProductInput = z.infer<typeof updateProductSchema>["body"];
export type ListProductsQuery = z.infer<typeof listProductsSchema>["query"];
export type UpdateStockInput = z.infer<typeof updateStockSchema>["body"];
