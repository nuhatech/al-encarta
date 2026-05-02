import type { Personality, PersonalityId } from "./personality";

export interface PersonalityRepository {
  findById(id: PersonalityId): Promise<Personality | null>;
  findBySlug(slug: string): Promise<Personality | null>;
  list(): Promise<ReadonlyArray<Personality>>;
}
