// Scans public/audio/ for audio files and generates a typed Track index.
// Title/author parsed from filename via simple heuristics:
//   "Title ｜ Author.mp3"  (fullwidth pipe — YouTube convention)
//   "Title | Author.mp3"
//   "Author：Title.mp3"    (fullwidth colon)
//   "Title by Author.mp3"
//   otherwise: filename becomes the title, author = "—"
//
// Run with: pnpm build:tracks
// Output:   src/modules/shell/apps/wmp/_tracks-bundled.ts

import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const AUDIO_DIR = resolve("public/audio");
const OUT = resolve("src/modules/shell/apps/wmp/_tracks-bundled.ts");
const SUPPORTED = /\.(mp3|m4a|ogg|wav|flac)$/i;

if (!existsSync(AUDIO_DIR)) {
  mkdirSync(AUDIO_DIR, { recursive: true });
}

const files = readdirSync(AUDIO_DIR)
  .filter((f) => SUPPORTED.test(f))
  .sort((a, b) => a.localeCompare(b, "fr"));

const tracks = files.map((file, idx) => {
  const noExt = file.replace(SUPPORTED, "");
  let title = noExt;
  let author = "—";

  // Step 1: split on the strongest separator we recognise.
  let m = noExt.match(/^(.+?)\s*[｜|]\s*(.+)$/);
  if (m) {
    // "Title ｜ Author" (YouTube fullwidth pipe convention)
    title = m[1].trim();
    author = m[2].trim();
  } else {
    m = noExt.match(/^([^：:]+)[：:]\s*(.+)$/);
    if (m && m[1].split(/\s+/).length <= 8) {
      // "Author：Title" or "Author: Title"
      author = m[1].trim();
      title = m[2].trim();
    }
  }

  // Step 2: refine — if the resolved "author" still contains "by NAME",
  // extract NAME (covers "Arabic Poetry by Tarafa" → "Tarafa").
  if (author !== "—") {
    const by = author.match(/^.*?\s+by\s+(.+)$/i);
    if (by) author = by[1].trim();
  } else {
    // Fallback: no separator, but a "X by Y" pattern in the raw filename
    m = noExt.match(/^(.+?)\s+by\s+(.+)$/i);
    if (m) {
      title = m[1].trim();
      author = m[2].trim();
    }
  }

  // Trim trailing dots/ellipses common in YouTube titles.
  title = title.replace(/[.…]+$/, "").trim();

  const slug =
    noExt
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64) || `track-${idx + 1}`;

  return {
    id: slug,
    title,
    author,
    src: "/audio/" + encodeURIComponent(file),
  };
});

const body = `// AUTO-GENERATED — do not edit by hand. Regenerate with: pnpm build:tracks
// Source: public/audio/*.{mp3,m4a,ogg,wav,flac}

import type { Track } from "./types";

export const TRACKS: ReadonlyArray<Track> = ${JSON.stringify(tracks, null, 2)};
`;

writeFileSync(OUT, body, "utf8");
console.log(`✓ Wrote ${OUT} (${tracks.length} track${tracks.length === 1 ? "" : "s"})`);
