import { z } from "zod";

export const TopicSchema = z.object({
  slug: z.string().min(2),
  label: z.string().min(2),
});

export type Topic = z.infer<typeof TopicSchema>;
