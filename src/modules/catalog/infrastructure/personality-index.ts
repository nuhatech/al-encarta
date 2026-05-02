export type Gender = "male" | "female";

/**
 * Per-personality voice tuning. Used by useSpeechSynthesis to differentiate
 * personalities even when the browser exposes only one TTS voice (Chrome on
 * Windows typically only ships "Google français"). On browsers with multiple
 * voices (Edge, Safari), gender also drives voice selection.
 */
export interface VoiceTuning {
  readonly pitch: number;
  readonly rate: number;
}

export interface PersonalitySummary {
  readonly slug: string;
  readonly displayName: string;
  readonly tier: 1 | 2 | 3;
  readonly century: number;
  readonly region: string;
  readonly tagline: string;
  readonly gender: Gender;
  readonly voice: VoiceTuning;
  /** Hidden until unlocked via easter egg (e.g. winning Minesweeper Hormuz). */
  readonly secret?: { readonly unlockKey: string };
}

// Default voice tunings by archetype. Pitches kept low (≤ 0.65) for all
// male archetypes to avoid the "child-on-helium" effect with Google français
// (Chrome's only French voice on Windows).
const VOICE_GRAVE: VoiceTuning = { pitch: 0.42, rate: 0.9 }; // savant grave (Khaldoun-style)
const VOICE_SCHOLAR: VoiceTuning = { pitch: 0.52, rate: 0.95 }; // pédagogue (Khawarizmi-style)
const VOICE_BRIGHT: VoiceTuning = { pitch: 0.62, rate: 1.0 }; // énergique (jeune savant)
const VOICE_NARRATOR: VoiceTuning = { pitch: 0.58, rate: 1.05 }; // vivant, narratif (voyageur)
const VOICE_RULER: VoiceTuning = { pitch: 0.48, rate: 0.95 }; // royal, mesuré
const VOICE_FEMALE: VoiceTuning = { pitch: 1.15, rate: 0.95 }; // posée, féminine

export const personalityIndex: ReadonlyArray<PersonalitySummary> = [
  // ── Tier 1 (6 stars) ──
  {
    slug: "al-khawarizmi",
    displayName: "Al-Khawarizmi",
    tier: 1,
    century: 9,
    region: "Bagdad",
    tagline: "Père de l'algèbre et de l'algorithme",
    gender: "male",
    voice: { pitch: 0.5, rate: 0.92 },
  },
  {
    slug: "ibn-al-haytham",
    displayName: "Ibn al-Haytham",
    tier: 1,
    century: 11,
    region: "Le Caire",
    tagline: "Père de l'optique moderne",
    gender: "male",
    voice: { pitch: 0.45, rate: 1.02 },
  },
  {
    slug: "ibn-al-nafis",
    displayName: "Ibn al-Nafis",
    tier: 1,
    century: 13,
    region: "Damas, Le Caire",
    tagline: "Découvreur de la circulation pulmonaire",
    gender: "male",
    voice: { pitch: 0.55, rate: 0.95 },
  },
  {
    slug: "ibn-battuta",
    displayName: "Ibn Battuta",
    tier: 1,
    century: 14,
    region: "Tanger, Monde connu",
    tagline: "30 ans de voyage, 120 000 km",
    gender: "male",
    voice: { pitch: 0.62, rate: 1.05 },
  },
  {
    slug: "ibn-khaldoun",
    displayName: "Ibn Khaldoun",
    tier: 1,
    century: 14,
    region: "Tunis, Le Caire",
    tagline: "Père de la sociologie",
    gender: "male",
    voice: { pitch: 0.4, rate: 0.88 },
  },
  {
    slug: "fatima-al-fihri",
    displayName: "Fatima al-Fihri",
    tier: 1,
    century: 9,
    region: "Fès",
    tagline: "Fondatrice de la 1ère université du monde",
    gender: "female",
    voice: { pitch: 1.15, rate: 0.95 },
  },

  // ── Tier 2 — Sciences ──
  {
    slug: "al-biruni",
    displayName: "Al-Biruni",
    tier: 2,
    century: 11,
    region: "Khwarezm, Ghazna",
    tagline: "Polymathe, calcule le rayon terrestre à 10% près",
    gender: "male",
    voice: VOICE_SCHOLAR,
  },
  {
    slug: "al-kindi",
    displayName: "Al-Kindi",
    tier: 2,
    century: 9,
    region: "Bagdad",
    tagline: "Philosophe des Arabes, père de la cryptanalyse",
    gender: "male",
    voice: VOICE_GRAVE,
  },
  {
    slug: "omar-khayyam",
    displayName: "Omar Khayyam",
    tier: 2,
    century: 11,
    region: "Nichapour, Ispahan",
    tagline: "Équations cubiques + Rubaiyat",
    gender: "male",
    voice: VOICE_BRIGHT,
  },
  {
    slug: "jabir-ibn-hayyan",
    displayName: "Jabir ibn Hayyan (Geber)",
    tier: 2,
    century: 8,
    region: "Koufa, Bagdad",
    tagline: "Père de la chimie expérimentale",
    gender: "male",
    voice: VOICE_GRAVE,
  },
  {
    slug: "al-zahrawi",
    displayName: "Al-Zahrawi (Albucasis)",
    tier: 2,
    century: 10,
    region: "Cordoue",
    tagline: "Père de la chirurgie moderne",
    gender: "male",
    voice: VOICE_SCHOLAR,
  },
  {
    slug: "banu-musa",
    displayName: "Banu Musa (3 frères)",
    tier: 2,
    century: 9,
    region: "Bagdad",
    tagline: "Pionniers de l'ingénierie mécanique",
    gender: "male",
    voice: VOICE_BRIGHT,
  },
  {
    slug: "al-jazari",
    displayName: "Al-Jazari",
    tier: 2,
    century: 12,
    region: "Diyarbakir",
    tagline: "Père de la robotique médiévale",
    gender: "male",
    voice: VOICE_NARRATOR,
  },
  {
    slug: "al-jahiz",
    displayName: "Al-Jahiz",
    tier: 2,
    century: 9,
    region: "Bassora, Bagdad",
    tagline: "Sélection naturelle 1000 ans avant Darwin",
    gender: "male",
    voice: VOICE_NARRATOR,
  },

  // ── Tier 2 — Astronomie/Maths ──
  {
    slug: "al-tusi",
    displayName: "Nasir al-Din al-Tusi",
    tier: 2,
    century: 13,
    region: "Tus, Maragha",
    tagline: "Couple de Tusi, repris par Copernic",
    gender: "male",
    voice: VOICE_GRAVE,
  },
  {
    slug: "al-battani",
    displayName: "Al-Battani (Albategnius)",
    tier: 2,
    century: 9,
    region: "Harran, Raqqa",
    tagline: "Précision astronomique inégalée pendant 700 ans",
    gender: "male",
    voice: VOICE_SCHOLAR,
  },
  {
    slug: "thabit-ibn-qurra",
    displayName: "Thabit ibn Qurra",
    tier: 2,
    century: 9,
    region: "Harran, Bagdad",
    tagline: "Géomètre sabéen, traducteur d'Apollonius",
    gender: "male",
    voice: VOICE_SCHOLAR,
  },

  // ── Tier 2 — Explorateurs ──
  {
    slug: "al-idrisi",
    displayName: "Al-Idrisi",
    tier: 2,
    century: 12,
    region: "Ceuta, Palerme",
    tagline: "Tabula Rogeriana — la meilleure carte du monde médiéval",
    gender: "male",
    voice: VOICE_NARRATOR,
  },
  {
    slug: "ahmad-ibn-majid",
    displayName: "Ahmad ibn Majid",
    tier: 2,
    century: 15,
    region: "Julfar, océan Indien",
    tagline: "Le Lion de la Mer, navigateur de l'océan Indien",
    gender: "male",
    voice: VOICE_NARRATOR,
  },
  {
    slug: "piri-reis",
    displayName: "Piri Reis",
    tier: 2,
    century: 16,
    region: "Gallipoli, Méditerranée",
    tagline: "Amiral cartographe, carte du monde de 1513",
    gender: "male",
    voice: VOICE_BRIGHT,
  },

  // ── Tier 2 — Dirigeants/Militaires ──
  {
    slug: "saladin",
    displayName: "Saladin (Salah ad-Din)",
    tier: 2,
    century: 12,
    region: "Le Caire, Damas",
    tagline: "Reprise de Jérusalem en 1187",
    gender: "male",
    voice: VOICE_RULER,
  },
  {
    slug: "tariq-ibn-ziyad",
    displayName: "Tariq ibn Ziyad",
    tier: 2,
    century: 8,
    region: "Maroc, Espagne",
    tagline: "Conquête d'al-Andalus en 711 — Gibraltar tient son nom",
    gender: "male",
    voice: VOICE_NARRATOR,
  },
  {
    slug: "mehmed-ii",
    displayName: "Mehmed II le Conquérant",
    tier: 2,
    century: 15,
    region: "Edirne, Istanbul",
    tagline: "Prise de Constantinople en 1453",
    gender: "male",
    voice: VOICE_RULER,
  },
  {
    slug: "soliman-le-magnifique",
    displayName: "Soliman le Magnifique",
    tier: 2,
    century: 16,
    region: "Istanbul",
    tagline: "Apogée ottomane, mécène de Sinan",
    gender: "male",
    voice: VOICE_RULER,
  },
  {
    slug: "mansa-musa",
    displayName: "Mansa Musa",
    tier: 2,
    century: 14,
    region: "Empire du Mali",
    tagline: "L'homme le plus riche de l'histoire",
    gender: "male",
    voice: VOICE_GRAVE,
  },
  {
    slug: "haroun-al-rachid",
    displayName: "Haroun al-Rachid",
    tier: 2,
    century: 8,
    region: "Bagdad",
    tagline: "Calife des Mille et Une Nuits, ami de Charlemagne",
    gender: "male",
    voice: VOICE_RULER,
  },
  {
    slug: "al-mamun",
    displayName: "Al-Ma'mun",
    tier: 2,
    century: 9,
    region: "Bagdad",
    tagline: "Calife fondateur de la Maison de la Sagesse",
    gender: "male",
    voice: VOICE_SCHOLAR,
  },

  // ── Tier 2 — Secret unlock ──
  {
    slug: "nasir-bin-murshid",
    displayName: "Imam Nasir bin Murshid Al Ya'rubi",
    tier: 2,
    century: 17,
    region: "Oman",
    tagline: "Premier imam ya'rubi, libérateur d'Oman des Portugais",
    gender: "male",
    voice: VOICE_GRAVE,
    secret: { unlockKey: "encarta-2002:unlock:hormuz" },
  },
];

export function findPersonalitySummary(slug: string): PersonalitySummary | undefined {
  return personalityIndex.find((p) => p.slug === slug);
}

/**
 * Filters out secret personalities that haven't been unlocked yet.
 * Reads localStorage at call time — wrap in a state hook if reactivity needed.
 */
export function visiblePersonalities(): ReadonlyArray<PersonalitySummary> {
  if (typeof window === "undefined") return personalityIndex.filter((p) => !p.secret);
  return personalityIndex.filter((p) => {
    if (!p.secret) return true;
    try {
      return window.localStorage.getItem(p.secret.unlockKey) === "1";
    } catch {
      return false;
    }
  });
}

// Helpers to satisfy unused-var lints if any of the archetypes is not used.
void VOICE_FEMALE;
