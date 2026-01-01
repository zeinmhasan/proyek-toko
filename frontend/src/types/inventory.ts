// Category Types
export interface Category {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  icon?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export interface CategorySimple {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string | null;
  color?: string;
  icon?: string | null;
}

// Product Types
export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  price: number;
  costPrice?: number | null;
  stock: number;
  minStock: number;
  unit: string;
  image?: string | null;
  isActive: boolean;
  categoryId?: string | null;
  category?: CategorySimple | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  sku: string;
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  stock?: number;
  minStock?: number;
  unit?: string;
  image?: string;
  categoryId?: string;
  isActive?: boolean;
}

export interface UpdateProductData {
  sku?: string;
  name?: string;
  description?: string | null;
  price?: number;
  costPrice?: number | null;
  stock?: number;
  minStock?: number;
  unit?: string;
  image?: string | null;
  categoryId?: string | null;
  isActive?: boolean;
}

export interface UpdateStockData {
  quantity: number;
  type: "add" | "subtract" | "set";
  reason?: string;
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  lowStock: number;
  outOfStock: number;
}

// Pagination Types
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
  message?: string;
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ProductListParams extends ListParams {
  categoryId?: string;
  isActive?: boolean;
  lowStock?: boolean;
}
