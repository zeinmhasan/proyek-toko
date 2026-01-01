export interface ExpenseCategory {
  value: string;
  label: string;
  color: string;
}

export interface Expense {
  id: string;
  type: "EXPENSE";
  category: string;
  amount: number;
  description: string | null;
  date: string;
  reference: string | null;
  userId: string;
  user: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseSummary {
  total: number;
  count: number;
  byCategory: {
    category: string;
    label: string;
    color: string;
    amount: number;
    percentage: number;
  }[];
}

export interface CreateExpenseInput {
  category: string;
  amount: number;
  description?: string;
  date?: string;
  reference?: string;
}

export interface UpdateExpenseInput {
  category?: string;
  amount?: number;
  description?: string;
  date?: string;
  reference?: string;
}

export interface ExpenseFilters {
  page?: number;
  limit?: number;
  category?: string;
  startDate?: string;
  endDate?: string;
}
