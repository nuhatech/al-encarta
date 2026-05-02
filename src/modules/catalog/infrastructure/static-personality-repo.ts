import { Personality, type PersonalityId } from "@/src/modules/catalog/domain/personality";
import type { PersonalityRepository } from "@/src/modules/catalog/domain/personality-repo";
import { unwrap } from "@/src/shared/kernel/result";
import { PERSONALITY_RAW } from "@/src/modules/catalog/data/_bundled";

export class StaticPersonalityRepository implements PersonalityRepository {
  private readonly cache: Map<string, Personality>;

  constructor() {
    const all = PERSONALITY_RAW.map((raw) => unwrap(Personality.create(raw)));
    this.cache = new Map(all.map((p) => [p.id, p]));
  }

  async findById(id: PersonalityId): Promise<Personality | null> {
    return this.cache.get(id) ?? null;
  }

  async findBySlug(slug: string): Promise<Personality | null> {
    for (const p of this.cache.values()) {
      if (p.slug === slug) return p;
    }
    return null;
  }

  async list(): Promise<ReadonlyArray<Personality>> {
    return [...this.cache.values()];
  }
}
