// Bundles all tier1/tier2 personality JSON into a single generated TS file.
// JSON imports through Next.js → OpenNext → Workers bundle pipeline are
// fragile (TypeError: Cannot read properties of undefined). Inlining as
// TypeScript const exports sidesteps the issue.
//
// Run with: pnpm bundle:personality-data
// Output:   src/modules/catalog/data/_bundled.ts

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve("src/modules/catalog/data");
const TIERS = ["tier1", "tier2"];
const OUT = join(ROOT, "_bundled.ts");

const entries = [];
for (const tier of TIERS) {
  const dir = join(ROOT, tier);
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".json")) continue;
    const slug = file.replace(/\.json$/, "");
    const content = readFileSync(join(dir, file), "utf8");
    entries.push({ slug, json: content.trim() });
  }
}

entries.sort((a, b) => a.slug.localeCompare(b.slug));

const body = `// AUTO-GENERATED — do not edit. Regenerate with: pnpm bundle:personality-data
// Source: src/modules/catalog/data/{tier1,tier2}/*.json

export const PERSONALITY_RAW: ReadonlyArray<unknown> = [
${entries.map((e) => `  // ${e.slug}\n  ${e.json},`).join("\n")}
];
`;

writeFileSync(OUT, body, "utf8");
console.log(`✓ Wrote ${OUT} (${entries.length} personalities)`);
