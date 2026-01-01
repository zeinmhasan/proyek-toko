import { Request, Response, NextFunction } from "express";
import { categoryService } from "../services/category.service.js";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/response.js";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  ListCategoriesQuery,
} from "../schemas/category.schema.js";

export class CategoryController {
  async create(
    req: Request<object, object, CreateCategoryInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = await categoryService.create(req.body);
      sendCreated(res, category, "Kategori berhasil dibuat");
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
      const category = await categoryService.findById(req.params.id);
      sendSuccess(res, category);
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
      const query = req.query as unknown as ListCategoriesQuery;
      const result = await categoryService.findAll(query);
      sendSuccess(res, result.data, undefined, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async findAllSimple(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const categories = await categoryService.findAllSimple();
      sendSuccess(res, categories);
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: Request<{ id: string }, object, UpdateCategoryInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = await categoryService.update(req.params.id, req.body);
      sendSuccess(res, category, "Kategori berhasil diperbarui");
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
      await categoryService.delete(req.params.id);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
