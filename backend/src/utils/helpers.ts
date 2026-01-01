/**
 * Generate a unique invoice number
 * Format: INV-YYYYMMDD-XXXX (e.g., INV-20251227-0001)
 */
export const generateInvoiceNumber = async (
  getLastInvoice: () => Promise<string | null>
): Promise<string> => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `INV-${dateStr}-`;

  const lastInvoice = await getLastInvoice();

  let nextNumber = 1;
  if (lastInvoice && lastInvoice.startsWith(prefix)) {
    const lastNumber = parseInt(lastInvoice.slice(-4), 10);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(4, "0")}`;
};

/**
 * Generate a unique SKU for products
 * Format: PRD-XXXXX (e.g., PRD-A1B2C)
 */
export const generateSKU = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let sku = "PRD-";
  for (let i = 0; i < 5; i++) {
    sku += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return sku;
};

/**
 * Parse pagination parameters from query
 */
export const parsePagination = (
  page?: string | number,
  limit?: string | number,
  maxLimit: number = 100
): { page: number; limit: number; skip: number } => {
  const parsedPage = Math.max(1, parseInt(String(page || "1"), 10) || 1);
  const parsedLimit = Math.min(
    maxLimit,
    Math.max(1, parseInt(String(limit || "10"), 10) || 10)
  );
  const skip = (parsedPage - 1) * parsedLimit;

  return { page: parsedPage, limit: parsedLimit, skip };
};

/**
 * Format currency to IDR
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (
  current: number,
  previous: number
): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Get date range for filtering
 */
export const getDateRange = (
  period: "today" | "week" | "month" | "year" | "custom",
  startDate?: Date,
  endDate?: Date
): { start: Date; end: Date } => {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  let start = new Date(now);
  start.setHours(0, 0, 0, 0);

  switch (period) {
    case "today":
      break;
    case "week":
      start.setDate(now.getDate() - 7);
      break;
    case "month":
      start.setMonth(now.getMonth() - 1);
      break;
    case "year":
      start.setFullYear(now.getFullYear() - 1);
      break;
    case "custom":
      if (startDate) start = startDate;
      if (endDate) end.setTime(endDate.getTime());
      break;
  }

  return { start, end };
};
