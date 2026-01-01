import prisma from "../lib/prisma.js";
import {
  CreateDebtInput,
  UpdateDebtInput,
  AddPaymentInput,
} from "../schemas/debt.schema.js";
import { Prisma, DebtType, DebtStatus } from "@prisma/client";

class DebtService {
  // Create new debt
  async create(data: CreateDebtInput) {
    const debt = await prisma.debtReceivable.create({
      data: {
        type: data.type as DebtType,
        personName: data.personName,
        personPhone: data.personPhone || null,
        personAddress: data.personAddress || null,
        amount: new Prisma.Decimal(data.amount),
        paidAmount: new Prisma.Decimal(0),
        remainingAmount: new Prisma.Decimal(data.amount),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        description: data.description || null,
        status: "PENDING",
      },
      include: {
        payments: true,
      },
    });

    return debt;
  }

  // Get all debts with pagination and filters
  async findAll(options: {
    page?: number;
    limit?: number;
    type?: "RECEIVABLE" | "PAYABLE";
    status?: "PENDING" | "PARTIAL" | "PAID" | "OVERDUE";
    search?: string;
  }) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.DebtReceivableWhereInput = {};

    if (options.type) {
      where.type = options.type;
    }

    if (options.status) {
      where.status = options.status;
    }

    if (options.search) {
      where.OR = [
        { personName: { contains: options.search, mode: "insensitive" } },
        { personPhone: { contains: options.search, mode: "insensitive" } },
        { description: { contains: options.search, mode: "insensitive" } },
      ];
    }

    const [debts, total] = await Promise.all([
      prisma.debtReceivable.findMany({
        where,
        include: {
          payments: {
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.debtReceivable.count({ where }),
    ]);

    return {
      data: debts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get debt by ID
  async findById(id: string) {
    const debt = await prisma.debtReceivable.findUnique({
      where: { id },
      include: {
        payments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return debt;
  }

  // Update debt
  async update(id: string, data: UpdateDebtInput) {
    const updateData: Prisma.DebtReceivableUpdateInput = {};

    if (data.personName !== undefined) updateData.personName = data.personName;
    if (data.personPhone !== undefined)
      updateData.personPhone = data.personPhone;
    if (data.personAddress !== undefined)
      updateData.personAddress = data.personAddress;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.dueDate !== undefined)
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.status !== undefined)
      updateData.status = data.status as DebtStatus;

    // If amount is changed, recalculate remaining
    if (data.amount !== undefined) {
      const existing = await this.findById(id);
      if (existing) {
        const paidAmount = Number(existing.paidAmount);
        const newRemaining = data.amount - paidAmount;
        updateData.amount = new Prisma.Decimal(data.amount);
        updateData.remainingAmount = new Prisma.Decimal(
          Math.max(0, newRemaining)
        );

        // Update status based on payment
        if (newRemaining <= 0) {
          updateData.status = "PAID";
        } else if (paidAmount > 0) {
          updateData.status = "PARTIAL";
        }
      }
    }

    const debt = await prisma.debtReceivable.update({
      where: { id },
      data: updateData,
      include: {
        payments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return debt;
  }

  // Delete debt
  async delete(id: string) {
    await prisma.debtReceivable.delete({
      where: { id },
    });
  }

  // Add payment to debt
  async addPayment(debtId: string, data: AddPaymentInput) {
    const debt = await this.findById(debtId);
    if (!debt) {
      throw new Error("Hutang tidak ditemukan");
    }

    const remaining = Number(debt.remainingAmount);
    const paymentAmount = Math.min(data.amount, remaining);

    // Create payment
    const payment = await prisma.debtPayment.create({
      data: {
        debtReceivableId: debtId,
        amount: new Prisma.Decimal(paymentAmount),
        paymentMethod: data.paymentMethod || "CASH",
        notes: data.notes || null,
      },
    });

    // Update debt amounts
    const newPaidAmount = Number(debt.paidAmount) + paymentAmount;
    const newRemainingAmount = Number(debt.amount) - newPaidAmount;

    let newStatus: DebtStatus = "PARTIAL";
    if (newRemainingAmount <= 0) {
      newStatus = "PAID";
    } else if (newPaidAmount === 0) {
      newStatus = "PENDING";
    }

    await prisma.debtReceivable.update({
      where: { id: debtId },
      data: {
        paidAmount: new Prisma.Decimal(newPaidAmount),
        remainingAmount: new Prisma.Decimal(Math.max(0, newRemainingAmount)),
        status: newStatus,
      },
    });

    return payment;
  }

  // Delete payment
  async deletePayment(paymentId: string) {
    const payment = await prisma.debtPayment.findUnique({
      where: { id: paymentId },
      include: { debtReceivable: true },
    });

    if (!payment) {
      throw new Error("Pembayaran tidak ditemukan");
    }

    const debt = payment.debtReceivable;
    const paymentAmount = Number(payment.amount);

    // Delete payment
    await prisma.debtPayment.delete({
      where: { id: paymentId },
    });

    // Update debt amounts
    const newPaidAmount = Number(debt.paidAmount) - paymentAmount;
    const newRemainingAmount = Number(debt.amount) - newPaidAmount;

    let newStatus: DebtStatus = "PENDING";
    if (newRemainingAmount <= 0) {
      newStatus = "PAID";
    } else if (newPaidAmount > 0) {
      newStatus = "PARTIAL";
    }

    await prisma.debtReceivable.update({
      where: { id: debt.id },
      data: {
        paidAmount: new Prisma.Decimal(Math.max(0, newPaidAmount)),
        remainingAmount: new Prisma.Decimal(Math.max(0, newRemainingAmount)),
        status: newStatus,
      },
    });
  }

  // Get debt summary
  async getSummary() {
    const [receivables, payables] = await Promise.all([
      prisma.debtReceivable.aggregate({
        where: { type: "RECEIVABLE", status: { not: "PAID" } },
        _sum: { remainingAmount: true },
        _count: true,
      }),
      prisma.debtReceivable.aggregate({
        where: { type: "PAYABLE", status: { not: "PAID" } },
        _sum: { remainingAmount: true },
        _count: true,
      }),
    ]);

    // Get overdue debts
    const now = new Date();
    const [overdueReceivables, overduePayables] = await Promise.all([
      prisma.debtReceivable.count({
        where: {
          type: "RECEIVABLE",
          status: { not: "PAID" },
          dueDate: { lt: now },
        },
      }),
      prisma.debtReceivable.count({
        where: {
          type: "PAYABLE",
          status: { not: "PAID" },
          dueDate: { lt: now },
        },
      }),
    ]);

    return {
      receivables: {
        total: Number(receivables._sum.remainingAmount) || 0,
        count: receivables._count,
        overdue: overdueReceivables,
      },
      payables: {
        total: Number(payables._sum.remainingAmount) || 0,
        count: payables._count,
        overdue: overduePayables,
      },
      netPosition:
        (Number(receivables._sum.remainingAmount) || 0) -
        (Number(payables._sum.remainingAmount) || 0),
    };
  }

  // Check and update overdue status
  async updateOverdueStatus() {
    const now = new Date();
    await prisma.debtReceivable.updateMany({
      where: {
        status: { in: ["PENDING", "PARTIAL"] },
        dueDate: { lt: now },
      },
      data: {
        status: "OVERDUE",
      },
    });
  }
}

export const debtService = new DebtService();
export default debtService;
