import { prisma } from "../lib/prisma.js";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "../utils/errors.js";
import {
  CreateProductInput,
  UpdateProductInput,
  ListProductsQuery,
  UpdateStockInput,
} from "../schemas/product.schema.js";

class ProductService {
  async create(data: CreateProductInput) {
    // Check if SKU already exists
    const existingSku = await prisma.product.findUnique({
      where: { sku: data.sku },
    });

    if (existingSku) {
      throw new ConflictError("SKU sudah digunakan produk lain");
    }

    // Validate categoryId if provided
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) {
        throw new NotFoundError("Kategori tidak ditemukan");
      }
    }

    const product = await prisma.product.create({
      data: {
        ...data,
        price: data.price,
        costPrice: data.costPrice,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return product;
  }

  async findById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundError("Produk tidak ditemukan");
    }

    return product;
  }

  async findAll(query: ListProductsQuery) {
    const {
      page,
      limit,
      search,
      categoryId,
      isActive,
      lowStock,
      sortBy,
      sortOrder,
    } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (lowStock) {
      // Products where stock is less than or equal to minStock
      where.stock = {
        lte: prisma.product.fields.minStock,
      };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // For lowStock filter, manually filter since Prisma can't compare columns directly
    let filteredProducts = products;
    if (lowStock) {
      filteredProducts = products.filter((p) => p.stock <= p.minStock);
    }

    return {
      data: filteredProducts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, data: UpdateProductInput) {
    // Check if product exists
    await this.findById(id);

    // Check for duplicate SKU if SKU is being updated
    if (data.sku) {
      const existingSku = await prisma.product.findFirst({
        where: {
          sku: data.sku,
          NOT: { id },
        },
      });

      if (existingSku) {
        throw new ConflictError("SKU sudah digunakan produk lain");
      }
    }

    // Validate categoryId if provided
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) {
        throw new NotFoundError("Kategori tidak ditemukan");
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        price: data.price,
        costPrice: data.costPrice,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return product;
  }

  async delete(id: string) {
    // Check if product exists
    await this.findById(id);

    // Check if product has been used in transactions
    const transactionCount = await prisma.transactionItem.count({
      where: { productId: id },
    });

    if (transactionCount > 0) {
      throw new ConflictError(
        `Tidak dapat menghapus produk yang sudah digunakan dalam ${transactionCount} transaksi. Nonaktifkan produk sebagai gantinya.`
      );
    }

    await prisma.product.delete({
      where: { id },
    });
  }

  async updateStock(id: string, data: UpdateStockInput) {
    const product = await this.findById(id);

    let newStock: number;

    switch (data.type) {
      case "add":
        newStock = product.stock + data.quantity;
        break;
      case "subtract":
        newStock = product.stock - data.quantity;
        if (newStock < 0) {
          throw new BadRequestError("Stok tidak mencukupi");
        }
        break;
      case "set":
        if (data.quantity < 0) {
          throw new BadRequestError("Stok tidak boleh negatif");
        }
        newStock = data.quantity;
        break;
      default:
        throw new BadRequestError("Tipe perubahan stok tidak valid");
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { stock: newStock },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return updatedProduct;
  }

  // Get low stock products
  async getLowStock() {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: { stock: "asc" },
    });

    // Filter products where stock <= minStock
    return products.filter((p) => p.stock <= p.minStock);
  }

  // Get product stats
  async getStats() {
    const [totalProducts, activeProducts, lowStockProducts, outOfStock] =
      await Promise.all([
        prisma.product.count(),
        prisma.product.count({ where: { isActive: true } }),
        prisma.product.findMany({
          where: { isActive: true },
          select: { stock: true, minStock: true },
        }),
        prisma.product.count({ where: { stock: 0, isActive: true } }),
      ]);

    const lowStock = lowStockProducts.filter(
      (p) => p.stock <= p.minStock && p.stock > 0
    ).length;

    return {
      totalProducts,
      activeProducts,
      inactiveProducts: totalProducts - activeProducts,
      lowStock,
      outOfStock,
    };
  }
}

export const productService = new ProductService();
