import prisma from "../lib/prisma.js";
import { UpdateSettingsInput } from "../schemas/settings.schema.js";

export class SettingsService {
  async getSettings() {
    let settings = await prisma.storeSettings.findFirst();
    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {},
      });
    }
    return settings;
  }

  async updateSettings(data: UpdateSettingsInput["body"]) {
    let settings = await prisma.storeSettings.findFirst();
    if (!settings) {
      settings = await prisma.storeSettings.create({ data: {} });
    }
    return prisma.storeSettings.update({
      where: { id: settings.id },
      data,
    });
  }

  async updateLogo(fileUrl: string) {
    let settings = await prisma.storeSettings.findFirst();
    if (!settings) {
      settings = await prisma.storeSettings.create({ data: {} });
    }
    return prisma.storeSettings.update({
      where: { id: settings.id },
      data: { logo: fileUrl },
    });
  }

  async deleteLogo() {
    let settings = await prisma.storeSettings.findFirst();
    if (!settings || !settings.logo) return settings;
    return prisma.storeSettings.update({
      where: { id: settings.id },
      data: { logo: null },
    });
  }
}

export const settingsService = new SettingsService();
