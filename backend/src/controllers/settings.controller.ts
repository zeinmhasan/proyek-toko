import { Request, Response, NextFunction } from "express";
import { settingsService } from "../services/settings.service.js";
import { sendSuccess } from "../utils/response.js";
import { UpdateSettingsInput } from "../schemas/settings.schema.js";

export class SettingsController {
  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.getSettings();
      sendSuccess(res, settings);
    } catch (error) {
      next(error);
    }
  }

  // Fitur pengaturan toko dihapus
  settingsController = new SettingsController();
}

export const settingsController = new SettingsController();
