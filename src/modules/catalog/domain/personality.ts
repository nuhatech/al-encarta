import { z } from "zod";
import type { Id } from "@/src/shared/kernel/id";
import { idOf } from "@/src/shared/kernel/id";
import { Result, ok, err } from "@/src/shared/kernel/result";
import { ValidationError } from "@/src/shared/kernel/errors";
import { EraSchema, type Era } from "./era";
import { BiographySchema, type Biography } from "./biography";
import { TopicSchema, type Topic } from "./topic";
import { VoiceProfileSchema, type VoiceProfile } from "./voice-profile";

export type PersonalityId = Id<"Personality">;

const SectionSchema = z.object({
  title: z.string().min(2),
  body: z.string().min(20),
});

const QuoteSchema = z.object({
  text: z.string().min(10),
  attribution: z.string().min(2),
});

const TimelineEventSchema = z.object({
  year: z.string().min(1),
  label: z.string().min(2),
});

const SidebarFactSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

export const PersonalitySchema = z.object({
  id: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  displayName: z.string().min(2),
  tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  era: EraSchema,
  biography: BiographySchema,
  voice: VoiceProfileSchema,
  topics: z.array(TopicSchema).min(1),
  // Rich article content (optional — only used by ArticleView, not by VoiceComposer).
  sections: z.array(SectionSchema).optional(),
  quote: QuoteSchema.optional(),
  timeline: z.array(TimelineEventSchema).optional(),
  sidebar: z.array(SidebarFactSchema).optional(),
});

export type PersonalityProps = z.infer<typeof PersonalitySchema>;

export class Personality {
  private constructor(
    public readonly id: PersonalityId,
    public readonly slug: string,
    public readonly displayName: string,
    public readonly tier: 1 | 2 | 3,
    public readonly era: Era,
    public readonly biography: Biography,
    public readonly voice: VoiceProfile,
    public readonly topics: ReadonlyArray<Topic>,
  ) {}

  static create(input: unknown): Result<Personality, ValidationError> {
    const parsed = PersonalitySchema.safeParse(input);
    if (!parsed.success) {
      return err(new ValidationError("personality", parsed.error.message));
    }
    const p = parsed.data;
    return ok(
      new Personality(
        idOf<"Personality">(p.id),
        p.slug,
        p.displayName,
        p.tier,
        p.era,
        p.biography,
        p.voice,
        p.topics,
      ),
    );
  }
}
