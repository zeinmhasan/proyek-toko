export type DebtType = "RECEIVABLE" | "PAYABLE";
export type DebtStatus = "PENDING" | "PARTIAL" | "PAID" | "OVERDUE";
export type PaymentMethod = "CASH" | "CARD" | "TRANSFER" | "QRIS" | "OTHER";

export interface DebtPayment {
  id: string;
  amount: number;
  paymentMethod: PaymentMethod;
  notes: string | null;
  debtReceivableId: string;
  createdAt: string;
}

export interface Debt {
  id: string;
  type: DebtType;
  personName: string;
  personPhone: string | null;
  personAddress: string | null;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string | null;
  status: DebtStatus;
  description: string | null;
  payments: DebtPayment[];
  createdAt: string;
  updatedAt: string;
}

export interface DebtSummary {
  receivables: {
    total: number;
    count: number;
    overdue: number;
  };
  payables: {
    total: number;
    count: number;
    overdue: number;
  };
  netPosition: number;
}

export interface CreateDebtInput {
  type: DebtType;
  personName: string;
  personPhone?: string;
  personAddress?: string;
  amount: number;
  dueDate?: string;
  description?: string;
}

export interface UpdateDebtInput {
  personName?: string;
  personPhone?: string;
  personAddress?: string;
  amount?: number;
  dueDate?: string;
  description?: string;
  status?: DebtStatus;
}

export interface AddPaymentInput {
  amount: number;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export interface DebtFilters {
  page?: number;
  limit?: number;
  type?: DebtType;
  status?: DebtStatus;
  search?: string;
}
