import { z } from "zod";

/**
 * VoiceProfile carries the byte-stable inputs to the system prompt.
 * Any change here invalidates the Anthropic prompt cache for that personality.
 */
export const VoiceProfileSchema = z.object({
  systemPromptTemplate: z.string().min(200),
  speakingStyle: z.string().min(20),
  refusalStyle: z.string().min(20),
});

export type VoiceProfile = z.infer<typeof VoiceProfileSchema>;
