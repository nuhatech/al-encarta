import { z } from "zod";

export const BiographySchema = z.object({
  summary: z.string().min(50),
  keyAchievements: z.array(z.string().min(5)).min(1),
  birthYear: z.number().int().optional(),
  deathYear: z.number().int().optional(),
});

export type Biography = z.infer<typeof BiographySchema>;
