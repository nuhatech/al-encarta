import type { Track } from "./types";

/**
 * Arabic poems and qasida recitations.
 * Drop the actual MP3 files in `public/audio/` matching the `src` paths.
 * If a file is missing the player shows "Source introuvable" and skips.
 */
export const TRACKS: ReadonlyArray<Track> = [
  {
    id: "burda",
    title: "Qaṣīda al-Burda",
    author: "Imam al-Būṣīrī",
    album: "Poèmes mystiques",
    src: "/audio/burda.mp3",
    era: "13ᵉ siècle, Égypte",
  },
  {
    id: "munajat",
    title: "Munājāt — Invocations nocturnes",
    author: "Imam ʿAlī ibn Abī Ṭālib",
    album: "Poèmes mystiques",
    src: "/audio/munajat.mp3",
    era: "7ᵉ siècle, Médine",
  },
  {
    id: "shafii-diwan",
    title: "Diwan al-Shāfiʿī — extraits",
    author: "Imam al-Shāfiʿī",
    album: "Poèmes classiques",
    src: "/audio/shafii.mp3",
    era: "9ᵉ siècle, Bagdad",
  },
  {
    id: "muallaqat",
    title: "Muʿallaqāt — extrait d'Imruʾ al-Qays",
    author: "Imruʾ al-Qays",
    album: "Poésie pré-islamique",
    src: "/audio/muallaqat.mp3",
    era: "6ᵉ siècle, Najd",
  },
  {
    id: "rumi-mathnawi",
    title: "Mathnawī — début du livre I (récité en arabe)",
    author: "Mawlānā Jalāl al-Dīn Rūmī",
    album: "Poèmes soufis",
    src: "/audio/rumi.mp3",
    era: "13ᵉ siècle, Konya",
  },
];
