import prisma from "../lib/prisma.js";
import { Prisma, TransactionStatus, PaymentMethod } from "@prisma/client";
import {
  CreateTransactionInput,
  ListTransactionsInput,
  UpdateTransactionStatusInput,
} from "../schemas/transaction.schema.js";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "../utils/errors.js";

export class TransactionService {
  // Generate invoice number: INV-YYYYMMDD-XXXX
  private async generateInvoiceNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const prefix = `INV-${dateStr}-`;

    // Get the last invoice number for today
    const lastTransaction = await prisma.transaction.findFirst({
      where: {
        invoiceNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        invoiceNumber: "desc",
      },
    });

    let nextNumber = 1;
    if (lastTransaction) {
      const lastNumber = parseInt(
        lastTransaction.invoiceNumber.replace(prefix, ""),
        10
      );
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(4, "0")}`;
  }

  // Create transaction
  async create(userId: string, data: CreateTransactionInput["body"]) {
    // Validate products and check stock
    const productIds = data.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundError("Beberapa produk tidak ditemukan");
    }

    // Check stock availability
    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new NotFoundError(
          `Produk dengan ID ${item.productId} tidak ditemukan`
        );
      }
      if (product.stock < item.quantity) {
        throw new BadRequestError(
          `Stok ${product.name} tidak cukup. Tersedia: ${product.stock}`
        );
      }
    }

    // Calculate totals
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const discount = data.discount || 0;
    const tax = data.tax || 0;
    const total = subtotal - discount + tax;

    if (data.paidAmount < total) {
      throw new BadRequestError(
        `Jumlah bayar kurang. Total: Rp ${total.toLocaleString()}, Dibayar: Rp ${data.paidAmount.toLocaleString()}`
      );
    }

    const changeAmount = data.paidAmount - total;
    const invoiceNumber = await this.generateInvoiceNumber();

    // Create transaction with items and update stock in a transaction
    const transaction = await prisma.$transaction(async (tx) => {
      // Create transaction
      const newTransaction = await tx.transaction.create({
        data: {
          invoiceNumber,
          subtotal: new Prisma.Decimal(subtotal),
          discount: new Prisma.Decimal(discount),
          tax: new Prisma.Decimal(tax),
          total: new Prisma.Decimal(total),
          paidAmount: new Prisma.Decimal(data.paidAmount),
          changeAmount: new Prisma.Decimal(changeAmount),
          paymentMethod: data.paymentMethod,
          status: TransactionStatus.COMPLETED,
          notes: data.notes,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          userId,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: new Prisma.Decimal(item.price),
              subtotal: new Prisma.Decimal(item.price * item.quantity),
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Update product stock
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newTransaction;
    });

    return transaction;
  }

  // Get all transactions with filters
  async findAll(filters: ListTransactionsInput["query"]) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      paymentMethod,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;

    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {};

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get transaction by ID
  async findById(id: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundError("Transaksi tidak ditemukan");
    }

    return transaction;
  }

  // Update transaction status (cancel/refund)
  async updateStatus(id: string, data: UpdateTransactionStatusInput["body"]) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!transaction) {
      throw new NotFoundError("Transaksi tidak ditemukan");
    }

    // Check if status change is valid
    if (transaction.status === TransactionStatus.CANCELLED) {
      throw new ConflictError("Transaksi sudah dibatalkan");
    }

    if (transaction.status === TransactionStatus.REFUNDED) {
      throw new ConflictError("Transaksi sudah di-refund");
    }

    // If cancelling or refunding, restore stock
    if (
      data.status === TransactionStatus.CANCELLED ||
      data.status === TransactionStatus.REFUNDED
    ) {
      await prisma.$transaction(async (tx) => {
        // Update transaction status
        await tx.transaction.update({
          where: { id },
          data: {
            status: data.status,
            notes: data.notes
              ? `${transaction.notes || ""}\n[${data.status}] ${data.notes}`
              : transaction.notes,
          },
        });

        // Restore stock
        for (const item of transaction.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      });
    } else {
      await prisma.transaction.update({
        where: { id },
        data: {
          status: data.status,
          notes: data.notes,
        },
      });
    }

    return this.findById(id);
  }

  // Get transaction statistics
  async getStats(filters: { startDate?: string; endDate?: string }) {
    const where: Prisma.TransactionWhereInput = {
      status: TransactionStatus.COMPLETED,
    };

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [totalTransactions, totalRevenue, todayTransactions, todayRevenue] =
      await Promise.all([
        prisma.transaction.count({ where }),
        prisma.transaction.aggregate({
          where,
          _sum: { total: true },
        }),
        prisma.transaction.count({
          where: {
            ...where,
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
        prisma.transaction.aggregate({
          where: {
            ...where,
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
          _sum: { total: true },
        }),
      ]);

    // Payment method breakdown
    const paymentBreakdown = await prisma.transaction.groupBy({
      by: ["paymentMethod"],
      where,
      _count: true,
      _sum: { total: true },
    });

    return {
      totalTransactions,
      totalRevenue: totalRevenue._sum.total || 0,
      todayTransactions,
      todayRevenue: todayRevenue._sum.total || 0,
      paymentBreakdown: paymentBreakdown.map((item) => ({
        method: item.paymentMethod,
        count: item._count,
        total: item._sum.total || 0,
      })),
    };
  }

  // Get daily sales report
  async getDailySales(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const transactions = await prisma.transaction.findMany({
      where: {
        status: TransactionStatus.COMPLETED,
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    // Group by date
    const salesByDate: Record<string, { count: number; total: number }> = {};

    for (let i = 0; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      salesByDate[dateStr] = { count: 0, total: 0 };
    }

    transactions.forEach((tx) => {
      const dateStr = tx.createdAt.toISOString().slice(0, 10);
      if (salesByDate[dateStr]) {
        salesByDate[dateStr].count += 1;
        salesByDate[dateStr].total += Number(tx.total);
      }
    });

    return Object.entries(salesByDate)
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}

export const transactionService = new TransactionService();
