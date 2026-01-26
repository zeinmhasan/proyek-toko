import { Router, Request, Response } from "express";
import { authenticate } from "../middlewares/index.js";

const router = Router();

// ML Service URL
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8001";

// Proxy helper function
const proxyToMLService = async (
  req: Request,
  res: Response,
  endpoint: string,
) => {
  try {
    const url = new URL(endpoint, ML_SERVICE_URL);

    // Add query params
    Object.entries(req.query).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).json(data);
      return;
    }

    res.json(data);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("fetch failed")
    ) {
      res.status(503).json({
        success: false,
        error: "ML Service tidak tersedia",
        message: "Pastikan ML Service berjalan di " + ML_SERVICE_URL,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "ML Service error",
        message: errorMessage,
      });
    }
  }
};

// Health check for ML service
router.get("/health", async (_req: Request, res: Response) => {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    const data = await response.json();
    res.json({
      status: "connected",
      ml_service: data,
    });
  } catch (error) {
    res.status(503).json({
      status: "disconnected",
      error: "ML Service tidak dapat dihubungi",
      ml_service_url: ML_SERVICE_URL,
    });
  }
});

// Get complete AI insights summary
router.get("/insights/summary", authenticate, (req: Request, res: Response) => {
  proxyToMLService(req, res, "/api/insights/summary");
});

// Get sales forecasting insights
router.get("/insights/sales", authenticate, (req: Request, res: Response) => {
  proxyToMLService(req, res, "/api/insights/sales");
});

// Get inventory optimization insights
router.get(
  "/insights/inventory",
  authenticate,
  (req: Request, res: Response) => {
    proxyToMLService(req, res, "/api/insights/inventory");
  },
);

// Get anomaly detection insights
router.get(
  "/insights/anomalies",
  authenticate,
  (req: Request, res: Response) => {
    proxyToMLService(req, res, "/api/insights/anomalies");
  },
);

// Get product-specific insights
router.get(
  "/insights/products/:productId",
  authenticate,
  (req: Request, res: Response) => {
    const { productId } = req.params;
    proxyToMLService(req, res, `/api/insights/products/${productId}`);
  },
);

export default router;
