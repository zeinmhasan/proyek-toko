import { z } from "zod";

export const updateSettingsSchema = z.object({
// Fitur pengaturan toko dihapus
export const updateSettingsSchema = z.object({});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
