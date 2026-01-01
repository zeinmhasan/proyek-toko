import { Request, Response, NextFunction } from "express";
import { productService } from "../services/product.service.js";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/response.js";
import {
  CreateProductInput,
  UpdateProductInput,
  ListProductsQuery,
  UpdateStockInput,
} from "../schemas/product.schema.js";

export class ProductController {
  async create(
    req: Request<object, object, CreateProductInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const product = await productService.create(req.body);
      sendCreated(res, product, "Produk berhasil dibuat");
    } catch (error) {
      next(error);
    }
  }

  async findById(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const product = await productService.findById(req.params.id);
      sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  }

  async findAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = req.query as unknown as ListProductsQuery;
      const result = await productService.findAll(query);
      sendSuccess(res, result.data, undefined, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: Request<{ id: string }, object, UpdateProductInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const product = await productService.update(req.params.id, req.body);
      sendSuccess(res, product, "Produk berhasil diperbarui");
    } catch (error) {
      next(error);
    }
  }

  async delete(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await productService.delete(req.params.id);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }

  async updateStock(
    req: Request<{ id: string }, object, UpdateStockInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const product = await productService.updateStock(req.params.id, req.body);
      sendSuccess(res, product, "Stok berhasil diperbarui");
    } catch (error) {
      next(error);
    }
  }

  async getLowStock(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const products = await productService.getLowStock();
      sendSuccess(res, products);
    } catch (error) {
      next(error);
    }
  }

  async getStats(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await productService.getStats();
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
