import { Personality, type PersonalityId } from "@/src/modules/catalog/domain/personality";
import type { PersonalityRepository } from "@/src/modules/catalog/domain/personality-repo";
import { unwrap } from "@/src/shared/kernel/result";

// Tier 1 (6 stars)
import alKhawarizmi from "@/src/modules/catalog/data/tier1/al-khawarizmi.json";
import ibnAlHaytham from "@/src/modules/catalog/data/tier1/ibn-al-haytham.json";
import ibnAlNafis from "@/src/modules/catalog/data/tier1/ibn-al-nafis.json";
import ibnBattuta from "@/src/modules/catalog/data/tier1/ibn-battuta.json";
import ibnKhaldoun from "@/src/modules/catalog/data/tier1/ibn-khaldoun.json";
import fatimaAlFihri from "@/src/modules/catalog/data/tier1/fatima-al-fihri.json";

// Tier 2 (21 secondaires)
import alBiruni from "@/src/modules/catalog/data/tier2/al-biruni.json";
import alKindi from "@/src/modules/catalog/data/tier2/al-kindi.json";
import omarKhayyam from "@/src/modules/catalog/data/tier2/omar-khayyam.json";
import jabirIbnHayyan from "@/src/modules/catalog/data/tier2/jabir-ibn-hayyan.json";
import alZahrawi from "@/src/modules/catalog/data/tier2/al-zahrawi.json";
import banuMusa from "@/src/modules/catalog/data/tier2/banu-musa.json";
import alJazari from "@/src/modules/catalog/data/tier2/al-jazari.json";
import alJahiz from "@/src/modules/catalog/data/tier2/al-jahiz.json";
import alTusi from "@/src/modules/catalog/data/tier2/al-tusi.json";
import alBattani from "@/src/modules/catalog/data/tier2/al-battani.json";
import thabitIbnQurra from "@/src/modules/catalog/data/tier2/thabit-ibn-qurra.json";
import alIdrisi from "@/src/modules/catalog/data/tier2/al-idrisi.json";
import ahmadIbnMajid from "@/src/modules/catalog/data/tier2/ahmad-ibn-majid.json";
import piriReis from "@/src/modules/catalog/data/tier2/piri-reis.json";
import saladin from "@/src/modules/catalog/data/tier2/saladin.json";
import tariqIbnZiyad from "@/src/modules/catalog/data/tier2/tariq-ibn-ziyad.json";
import mehmedIi from "@/src/modules/catalog/data/tier2/mehmed-ii.json";
import solimanLeMagnifique from "@/src/modules/catalog/data/tier2/soliman-le-magnifique.json";
import mansaMusa from "@/src/modules/catalog/data/tier2/mansa-musa.json";
import harounAlRachid from "@/src/modules/catalog/data/tier2/haroun-al-rachid.json";
import alMamun from "@/src/modules/catalog/data/tier2/al-mamun.json";
import nasirBinMurshid from "@/src/modules/catalog/data/tier2/nasir-bin-murshid.json";

const ALL: ReadonlyArray<unknown> = [
  alKhawarizmi,
  ibnAlHaytham,
  ibnAlNafis,
  ibnBattuta,
  ibnKhaldoun,
  fatimaAlFihri,
  alBiruni,
  alKindi,
  omarKhayyam,
  jabirIbnHayyan,
  alZahrawi,
  banuMusa,
  alJazari,
  alJahiz,
  alTusi,
  alBattani,
  thabitIbnQurra,
  alIdrisi,
  ahmadIbnMajid,
  piriReis,
  saladin,
  tariqIbnZiyad,
  mehmedIi,
  solimanLeMagnifique,
  mansaMusa,
  harounAlRachid,
  alMamun,
  nasirBinMurshid,
];

export class StaticPersonalityRepository implements PersonalityRepository {
  private readonly cache: Map<string, Personality>;

  constructor() {
    const all = ALL.map((raw) => unwrap(Personality.create(raw)));
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
