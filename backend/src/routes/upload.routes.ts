import { Router, Request, Response, NextFunction } from "express";
import { uploadProductImage } from "../config/multer.js";
import { authenticate } from "../middlewares/index.js";
import { config } from "../config/index.js";
import path from "path";
import fs from "fs";

const router = Router();

// Upload product image
router.post(
  "/product",
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    uploadProductImage.single("image")(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "Ukuran file maksimal 5MB",
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || "Gagal upload file",
        });
      }
      next();
    });
  },
  (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File tidak ditemukan",
      });
    }

    // Generate URL for the uploaded file
    const fileUrl = `${config.backendUrl}/uploads/products/${req.file.filename}`;

    res.json({
      success: true,
      message: "File berhasil diupload",
      data: {
        filename: req.file.filename,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  }
);

// Delete uploaded image
router.delete(
  "/product/:filename",
  authenticate,
  (req: Request, res: Response) => {
    const { filename } = req.params;

    // Sanitize filename to prevent directory traversal
    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(
      process.cwd(),
      "uploads",
      "products",
      sanitizedFilename
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File tidak ditemukan",
      });
    }

    try {
      fs.unlinkSync(filePath);
      res.json({
        success: true,
        message: "File berhasil dihapus",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Gagal menghapus file",
      });
    }
  }
);

export default router;
