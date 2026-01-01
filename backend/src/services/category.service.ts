import { prisma } from "../lib/prisma.js";
import { NotFoundError, ConflictError } from "../utils/errors.js";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  ListCategoriesQuery,
} from "../schemas/category.schema.js";

class CategoryService {
  async create(data: CreateCategoryInput) {
    // Check if category with same name exists
    const existing = await prisma.category.findFirst({
      where: { name: { equals: data.name, mode: "insensitive" } },
    });

    if (existing) {
      throw new ConflictError("Kategori dengan nama ini sudah ada");
    }

    const category = await prisma.category.create({
      data,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return category;
  }

  async findById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundError("Kategori tidak ditemukan");
    }

    return category;
  }

  async findAll(query: ListCategoriesQuery) {
    const { page, limit, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { products: true },
          },
        },
      }),
      prisma.category.count({ where }),
    ]);

    return {
      data: categories,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, data: UpdateCategoryInput) {
    // Check if category exists
    await this.findById(id);

    // Check for duplicate name if name is being updated
    if (data.name) {
      const existing = await prisma.category.findFirst({
        where: {
          name: { equals: data.name, mode: "insensitive" },
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictError("Kategori dengan nama ini sudah ada");
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return category;
  }

  async delete(id: string) {
    // Check if category exists
    const category = await this.findById(id);

    // Check if category has products
    if (category._count.products > 0) {
      throw new ConflictError(
        `Tidak dapat menghapus kategori yang memiliki ${category._count.products} produk. Pindahkan atau hapus produk terlebih dahulu.`
      );
    }

    await prisma.category.delete({
      where: { id },
    });
  }

  // Get all categories without pagination (for dropdowns)
  async findAllSimple() {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        color: true,
        icon: true,
      },
    });

    return categories;
  }
}

export const categoryService = new CategoryService();
