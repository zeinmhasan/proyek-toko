export type PaymentMethod = "CASH" | "CARD" | "TRANSFER" | "QRIS" | "OTHER";
export type TransactionStatus =
  | "PENDING"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

export interface TransactionItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
  product: {
    id: string;
    name: string;
    sku: string;
  };
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  changeAmount: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  notes?: string;
  customerName?: string;
  customerPhone?: string;
  userId: string;
  user: {
    id: string;
    name: string;
  };
  items: TransactionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  sku: string;
  price: number;
  quantity: number;
  stock: number;
  image?: string;
}

export interface CreateTransactionInput {
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  discount?: number;
  tax?: number;
  paidAmount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  customerName?: string;
  customerPhone?: string;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: TransactionStatus;
  paymentMethod?: PaymentMethod;
  startDate?: string;
  endDate?: string;
  sortBy?: "createdAt" | "total" | "invoiceNumber";
  sortOrder?: "asc" | "desc";
}

export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TransactionStats {
  totalTransactions: number;
  totalRevenue: number;
  todayTransactions: number;
  todayRevenue: number;
  paymentBreakdown: {
    method: PaymentMethod;
    count: number;
    total: number;
  }[];
}

export interface DailySales {
  date: string;
  count: number;
  total: number;
}
