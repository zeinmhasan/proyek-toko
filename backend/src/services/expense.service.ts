import prisma from "../lib/prisma.js";
import {
  CreateExpenseInput,
  UpdateExpenseInput,
} from "../schemas/expense.schema.js";
import { Prisma } from "@prisma/client";

// Expense categories
export const EXPENSE_CATEGORIES = [
  { value: "operational", label: "Operasional", color: "#EF4444" },
  { value: "inventory", label: "Pembelian Stok", color: "#F59E0B" },
  { value: "salary", label: "Gaji Karyawan", color: "#8B5CF6" },
  { value: "utility", label: "Utilitas (Listrik/Air)", color: "#3B82F6" },
  { value: "rent", label: "Sewa", color: "#EC4899" },
  { value: "marketing", label: "Marketing", color: "#10B981" },
  { value: "maintenance", label: "Pemeliharaan", color: "#6366F1" },
  { value: "other", label: "Lainnya", color: "#6B7280" },
];

class ExpenseService {
  // Create expense
  async create(userId: string, data: CreateExpenseInput) {
    const expense = await prisma.financialRecord.create({
      data: {
        type: "EXPENSE",
        category: data.category,
        amount: new Prisma.Decimal(data.amount),
        description: data.description || null,
        date: data.date ? new Date(data.date) : new Date(),
        reference: data.reference || null,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return expense;
  }

  // Get all expenses with pagination and filters
  async findAll(options: {
    page?: number;
    limit?: number;
    category?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.FinancialRecordWhereInput = {
      type: "EXPENSE",
    };

    if (options.category) {
      where.category = options.category;
    }

    if (options.startDate || options.endDate) {
      where.date = {};
      if (options.startDate) {
        where.date.gte = new Date(options.startDate);
      }
      if (options.endDate) {
        const endDate = new Date(options.endDate);
        endDate.setHours(23, 59, 59, 999);
        where.date.lte = endDate;
      }
    }

    const [expenses, total] = await Promise.all([
      prisma.financialRecord.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.financialRecord.count({ where }),
    ]);

    return {
      data: expenses,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get expense by ID
  async findById(id: string) {
    const expense = await prisma.financialRecord.findFirst({
      where: {
        id,
        type: "EXPENSE",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return expense;
  }

  // Update expense
  async update(id: string, data: UpdateExpenseInput) {
    const updateData: Prisma.FinancialRecordUpdateInput = {};

    if (data.category !== undefined) updateData.category = data.category;
    if (data.amount !== undefined)
      updateData.amount = new Prisma.Decimal(data.amount);
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.reference !== undefined) updateData.reference = data.reference;

    const expense = await prisma.financialRecord.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return expense;
  }

  // Delete expense
  async delete(id: string) {
    await prisma.financialRecord.delete({
      where: { id },
    });
  }

  // Get expense summary
  async getSummary(startDate?: string, endDate?: string) {
    const where: Prisma.FinancialRecordWhereInput = {
      type: "EXPENSE",
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    } else {
      // Default: this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      where.date = { gte: startOfMonth };
    }

    // Get expenses grouped by category
    const expenses = await prisma.financialRecord.findMany({
      where,
      select: {
        category: true,
        amount: true,
      },
    });

    // Calculate totals
    const categoryTotals = new Map<string, number>();
    let totalExpense = 0;

    expenses.forEach((e) => {
      const amount = Number(e.amount);
      totalExpense += amount;
      categoryTotals.set(
        e.category,
        (categoryTotals.get(e.category) || 0) + amount
      );
    });

    const byCategory = EXPENSE_CATEGORIES.map((cat) => ({
      category: cat.value,
      label: cat.label,
      color: cat.color,
      amount: categoryTotals.get(cat.value) || 0,
      percentage:
        totalExpense > 0
          ? ((categoryTotals.get(cat.value) || 0) / totalExpense) * 100
          : 0,
    })).filter((c) => c.amount > 0);

    return {
      total: totalExpense,
      count: expenses.length,
      byCategory,
    };
  }

  // Get categories
  getCategories() {
    return EXPENSE_CATEGORIES;
  }
}

export const expenseService = new ExpenseService();
export default expenseService;
