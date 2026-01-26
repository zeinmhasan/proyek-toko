import { z } from "zod";

// Fitur pengaturan toko dihapus
export const updateSettingsSchema = z.object({});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
