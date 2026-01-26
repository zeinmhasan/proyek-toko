import api from "../lib/axios";

export interface DataStats {
  transactions: {
    total: number;
    recent_30_days: number;
    first_date: string | null;
    last_date: string | null;
    days_of_data: number;
  };
  products: {
    total_active: number;
    with_sales_history: number;
  };
  financial_records: {
    total: number;
  };
  ml_readiness: {
    forecasting: { ready: boolean; reason: string | null };
    inventory_optimization: { ready: boolean; reason: string | null };
    anomaly_detection: { ready: boolean; reason: string | null };
    overall_ready: boolean;
    using_fallback: boolean;
  };
}

export interface SalesForecast {
  method: string;
  model_confidence: string;
  predictions: Array<{
    date: string;
    predicted_revenue: number;
    lower_bound: number;
    upper_bound: number;
  }>;
  summary: {
    total_predicted_revenue: number;
    average_daily_revenue: number;
    trend: string;
    trend_percentage: number;
  };
  historical_summary?: {
    days_analyzed: number;
    average_revenue: number;
    max_revenue: number;
    min_revenue: number;
  };
  message?: string;
}

export interface InventoryRecommendation {
  product_id: string;
  product_name: string;
  sku: string;
  category: string | null;
  current_stock: number;
  min_stock: number;
  unit: string;
  price: number;
  status: "critical" | "warning" | "healthy" | "overstocked";
  metrics: {
    avg_daily_sales: number;
    days_until_stockout: number | null;
    reorder_point: number;
    sales_trend: string;
  };
  recommendation: {
    action: string;
    quantity: number | null;
    urgency: string;
  };
}

export interface InventoryAlerts {
  total_products: number;
  summary: {
    critical_count: number;
    warning_count: number;
    healthy_count: number;
    overstocked_count: number;
  };
  recommendations: {
    critical: InventoryRecommendation[];
    warning: InventoryRecommendation[];
    healthy: InventoryRecommendation[];
    overstocked: InventoryRecommendation[];
  };
  generated_at: string;
}

export interface Anomaly {
  type: string;
  transaction_id?: string;
  invoice_number?: string;
  timestamp?: string;
  date?: string;
  value?: number;
  severity: "high" | "medium" | "low";
  description: string;
  zscore?: number;
  expected_range?: string;
}

export interface AnomalyDetection {
  status: string;
  period_days: number;
  total_transactions_analyzed: number;
  anomalies: Anomaly[];
  daily_pattern_anomalies: Anomaly[];
  summary: {
    total_anomalies: number;
    high_severity: number;
    medium_severity: number;
    low_severity: number;
    by_type: Record<string, number>;
  };
  generated_at: string;
}

export interface AIAdvice {
  source: "gemini" | "fallback" | "system";
  advice: string;
  generated_at: string;
  error?: string;
}

export interface InsightsSummary {
  generated_at: string;
  data_stats: DataStats;
  sales_forecast: SalesForecast;
  inventory_alerts: InventoryAlerts;
  anomalies: AnomalyDetection;
  ai_advice: AIAdvice;
}

export interface SalesInsights {
  generated_at: string;
  forecast_days: number;
  forecast: SalesForecast;
  ai_advice: AIAdvice;
}

export interface InventoryInsights {
  generated_at: string;
  recommendations: InventoryAlerts;
  ai_advice: AIAdvice;
}

export interface AnomalyInsights {
  generated_at: string;
  period_days: number;
  anomalies: AnomalyDetection;
  ai_advice: AIAdvice;
}

export interface MLServiceHealth {
  status: string;
  ml_service?: {
    status: string;
    database: string;
    gemini_api: string;
    ml_config: {
      min_transactions: number;
      min_days: number;
    };
  };
  error?: string;
  ml_service_url?: string;
}

export const aiService = {
  // Health check
  async checkHealth(): Promise<MLServiceHealth> {
    const response = await api.get("/api/ai/health");
    return response.data;
  },

  // Get complete insights summary
  async getInsightsSummary(): Promise<InsightsSummary> {
    const response = await api.get("/api/ai/insights/summary");
    return response.data;
  },

  // Get sales forecasting
  async getSalesInsights(days: number = 7): Promise<SalesInsights> {
    const response = await api.get("/api/ai/insights/sales", {
      params: { days },
    });
    return response.data;
  },

  // Get inventory recommendations
  async getInventoryInsights(categoryId?: string): Promise<InventoryInsights> {
    const response = await api.get("/api/ai/insights/inventory", {
      params: { category_id: categoryId },
    });
    return response.data;
  },

  // Get anomaly detection
  async getAnomalyInsights(days: number = 7): Promise<AnomalyInsights> {
    const response = await api.get("/api/ai/insights/anomalies", {
      params: { days },
    });
    return response.data;
  },

  // Get product-specific insights
  async getProductInsights(productId: string): Promise<any> {
    const response = await api.get(`/api/ai/insights/products/${productId}`);
    return response.data;
  },
};

export default aiService;
