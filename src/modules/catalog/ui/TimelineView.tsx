"use client";
import { useMemo } from "react";
import { PERSONALITY_RAW } from "@/src/modules/catalog/data/_bundled";
import { personalityIndex } from "@/src/modules/catalog/infrastructure/personality-index";

interface TimelineViewProps {
  onPickArticle: (slug: string) => void;
}

interface TimelineEntry {
  slug: string;
  displayName: string;
  tier: number;
  birthYear: number;
  deathYear: number;
  region: string;
}

interface RawShape {
  slug?: string;
  displayName?: string;
  tier?: number;
  era?: { region?: string };
  biography?: { birthYear?: number; deathYear?: number };
}

const YEAR_START = 700;
const YEAR_END = 1500;
const PX_PER_YEAR = 4.5; // 800 years × 4.5 = 3600px wide
const TIMELINE_PX = (YEAR_END - YEAR_START) * PX_PER_YEAR;
const ROW_HEIGHT = 64;
const CARD_GAP = 6;

/** Era bands rendered as colored stripes behind the figure cards. */
const ERAS: ReadonlyArray<{
  label: string;
  start: number;
  end: number;
  color: string;
  textColor: string;
}> = [
  { label: "Califat abbasside", start: 750, end: 1258, color: "#dde8d4", textColor: "#3a5128" },
  { label: "al-Andalus / Cordoue", start: 711, end: 1492, color: "#f0e8d0", textColor: "#5b4a1f" },
  { label: "Empire mongol / Yuan", start: 1206, end: 1368, color: "#f0d8d8", textColor: "#7a2c2c" },
  { label: "Empire ottoman", start: 1299, end: 1500, color: "#d8e0f0", textColor: "#1f3a7a" },
];

const TICK_EVERY = 50;

export function TimelineView({ onPickArticle }: TimelineViewProps) {
  const entries = useMemo(() => buildEntries(), []);
  const rows = useMemo(() => packRows(entries), [entries]);
  const totalRows = Math.max(...rows.map((r) => r.row), 0) + 1;
  const canvasHeight = Math.max(360, totalRows * ROW_HEIGHT + 80);

  return (
    <div
      style={{
        height: "100%",
        overflow: "auto",
        background: "#fafaf6",
        fontFamily: "Tahoma, sans-serif",
      }}
    >
      <div style={{ padding: "12px 16px 8px", borderBottom: "1px solid #ccc", background: "#fff" }}>
        <h2
          style={{
            margin: 0,
            fontFamily: "Georgia, serif",
            fontSize: 18,
            color: "#000080",
          }}
        >
          Frise chronologique
        </h2>
        <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
          {entries.length} figures · 8e–15e siècle · cliquez sur une carte pour ouvrir l&apos;article
        </div>
      </div>

      <div style={{ position: "relative", width: TIMELINE_PX, height: canvasHeight, paddingTop: 36 }}>
        {/* Era bands (z-index 0) */}
        {ERAS.map((era, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: yearToX(era.start),
              top: 0,
              width: yearToX(era.end) - yearToX(era.start),
              height: canvasHeight,
              background: era.color,
              opacity: 0.55,
              zIndex: 0,
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Era labels at top */}
        {ERAS.map((era, i) => (
          <div
            key={`label-${i}`}
            style={{
              position: "absolute",
              left: yearToX(era.start) + 4,
              top: 4 + i * 14,
              fontSize: 10,
              fontStyle: "italic",
              color: era.textColor,
              fontWeight: 600,
              zIndex: 1,
              pointerEvents: "none",
              textShadow: "0 0 4px rgba(255,255,255,0.7)",
            }}
          >
            {era.label} ({era.start}–{era.end})
          </div>
        ))}

        {/* Year ticks (vertical lines + sticky year label at top) */}
        {yearTicks().map((year) => (
          <div
            key={year}
            style={{
              position: "absolute",
              left: yearToX(year),
              top: 70,
              width: 1,
              height: canvasHeight - 70,
              background: year % 100 === 0 ? "rgba(80,80,80,0.35)" : "rgba(180,180,180,0.5)",
              zIndex: 2,
              pointerEvents: "none",
            }}
          />
        ))}
        {yearTicks()
          .filter((y) => y % 100 === 0)
          .map((year) => (
            <div
              key={`yr-${year}`}
              style={{
                position: "absolute",
                left: yearToX(year) - 18,
                top: 72,
                fontSize: 11,
                fontWeight: 700,
                color: "#333",
                background: "rgba(255,255,255,0.85)",
                padding: "1px 4px",
                border: "1px solid #aaa",
                borderRadius: 2,
                zIndex: 4,
                pointerEvents: "none",
              }}
            >
              {year}
            </div>
          ))}

        {/* Personality cards */}
        {rows.map((entry) => (
          <PersonalityCard
            key={entry.slug}
            entry={entry}
            onClick={() => onPickArticle(entry.slug)}
          />
        ))}
      </div>
    </div>
  );
}

function PersonalityCard({
  entry,
  onClick,
}: {
  entry: TimelineEntry & { row: number };
  onClick: () => void;
}) {
  const left = yearToX(entry.birthYear);
  const width = Math.max(110, (entry.deathYear - entry.birthYear) * PX_PER_YEAR);
  const top = 36 + entry.row * ROW_HEIGHT + CARD_GAP;
  const isStar = entry.tier === 1;

  return (
    <button
      onClick={onClick}
      title={`${entry.displayName} (${entry.birthYear}–${entry.deathYear}) · ${entry.region}`}
      style={{
        position: "absolute",
        left,
        top,
        width,
        height: ROW_HEIGHT - CARD_GAP * 2,
        padding: "4px 6px",
        background: isStar
          ? "linear-gradient(180deg, #fff 0%, #f0f6ff 100%)"
          : "linear-gradient(180deg, #fff 0%, #f6f6f0 100%)",
        border: isStar ? "1px solid #5a8bc4" : "1px solid #999",
        borderLeft: isStar ? "3px solid #245edb" : "2px solid #555",
        textAlign: "left",
        fontFamily: "Tahoma, sans-serif",
        fontSize: 10,
        cursor: "pointer",
        zIndex: 3,
        boxShadow: "1px 1px 0 rgba(0,0,0,0.18)",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isStar
          ? "linear-gradient(180deg, #cfe2ff 0%, #a5c8ff 100%)"
          : "linear-gradient(180deg, #fffbe6 0%, #f0e8c0 100%)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isStar
          ? "linear-gradient(180deg, #fff 0%, #f0f6ff 100%)"
          : "linear-gradient(180deg, #fff 0%, #f6f6f0 100%)";
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: 11,
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          overflow: "hidden",
          color: "#000",
        }}
      >
        {isStar && <span style={{ color: "#ec9112" }}>★ </span>}
        {entry.displayName}
      </div>
      <div style={{ color: "#555", fontSize: 9 }}>
        {entry.birthYear}–{entry.deathYear}
      </div>
      <div
        style={{
          color: "#666",
          fontSize: 9,
          fontStyle: "italic",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          overflow: "hidden",
        }}
      >
        {entry.region}
      </div>
    </button>
  );
}

function yearToX(year: number): number {
  return (year - YEAR_START) * PX_PER_YEAR;
}

function yearTicks(): number[] {
  const out: number[] = [];
  for (let y = YEAR_START; y <= YEAR_END; y += TICK_EVERY) out.push(y);
  return out;
}

function buildEntries(): TimelineEntry[] {
  const visibleSlugs = new Set(personalityIndex.map((p) => p.slug));
  const out: TimelineEntry[] = [];
  for (const raw of PERSONALITY_RAW) {
    const r = raw as RawShape;
    if (!r.slug || !r.displayName || !r.biography || typeof r.tier !== "number") continue;
    if (!visibleSlugs.has(r.slug)) continue; // skip secret personalities not yet unlocked
    const birth = r.biography.birthYear;
    const death = r.biography.deathYear;
    if (typeof birth !== "number" || typeof death !== "number") continue;
    out.push({
      slug: r.slug,
      displayName: r.displayName,
      tier: r.tier,
      birthYear: birth,
      deathYear: death,
      region: r.era?.region ?? "—",
    });
  }
  out.sort((a, b) => a.birthYear - b.birthYear);
  return out;
}

/** Greedy row packing: assign each entry to the lowest row where it doesn't overlap. */
function packRows(entries: TimelineEntry[]): Array<TimelineEntry & { row: number }> {
  const rowEnds: number[] = []; // rowEnds[r] = last x-end on row r
  const out: Array<TimelineEntry & { row: number }> = [];
  for (const entry of entries) {
    const start = yearToX(entry.birthYear);
    const end = start + Math.max(110, (entry.deathYear - entry.birthYear) * PX_PER_YEAR);
    let row = 0;
    while (true) {
      const lastEnd = rowEnds[row];
      if (lastEnd === undefined || lastEnd <= start - 4) break;
      row++;
    }
    rowEnds[row] = end;
    out.push({ ...entry, row });
  }
  return out;
}
