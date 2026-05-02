import { z } from "zod";
import { Result, ok, err } from "@/src/shared/kernel/result";
import { ValidationError } from "@/src/shared/kernel/errors";

export const EraSchema = z.object({
  century: z.number().int().min(1).max(21),
  region: z.string().min(2),
});

export type Era = z.infer<typeof EraSchema>;

export function parseEra(input: unknown): Result<Era, ValidationError> {
  const parsed = EraSchema.safeParse(input);
  if (!parsed.success) {
    return err(new ValidationError("era", parsed.error.message));
  }
  return ok(parsed.data);
}
