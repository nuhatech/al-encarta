"use client";
import { useEffect, useState } from "react";
import {
  visiblePersonalities,
  type PersonalitySummary,
} from "@/src/modules/catalog/infrastructure/personality-index";

interface IndexEntry {
  label: string;
  slug?: string; // present = personality, clickable
  italic?: boolean; // italic = related work / city / concept (Encarta convention)
  letter: string;
  secret?: boolean; // recently unlocked — sparkle in UI
}

// Italic decorative entries: works, cities, concepts. These add Encarta-style
// density to the sidebar but are not clickable.
const ITALIC_ENTRIES: ReadonlyArray<{ label: string; italic: true }> = [
  { label: "Al-Andalus", italic: true },
  { label: "Al-Mansuri (hôpital)", italic: true },
  { label: "Al-Qarawiyyin", italic: true },
  { label: "Andalousie médiévale", italic: true },
  { label: "Avicenne (voir aussi)", italic: true },
  { label: "Bagdad", italic: true },
  { label: "Bayt al-Hikma", italic: true },
  { label: "Chine des Yuan", italic: true },
  { label: "Constantinople (1453)", italic: true },
  { label: "Cordoue omeyyade", italic: true },
  { label: "Damas", italic: true },
  { label: "Empire du Mali", italic: true },
  { label: "Fès idrisside", italic: true },
  { label: "Fiqh maliki", italic: true },
  { label: "Galien (réfutation)", italic: true },
  { label: "Hôpital al-Nuri", italic: true },
  { label: "Jérusalem (1187)", italic: true },
  { label: "Kairouan", italic: true },
  { label: "Kanunname ottoman", italic: true },
  { label: "Kitab al-Hayawan", italic: true },
  { label: "Kitab al-jabr", italic: true },
  { label: "Kitab al-Manazir", italic: true },
  { label: "Maïmonide", italic: true },
  { label: "Maragha (observatoire)", italic: true },
  { label: "Mecque, La", italic: true },
  { label: "Mille et Une Nuits", italic: true },
  { label: "Mohács (1526)", italic: true },
  { label: "Muqaddima", italic: true },
  { label: "Ptolémée (voir aussi)", italic: true },
  { label: "Rihla", italic: true },
  { label: "Rubaiyat", italic: true },
  { label: "Sahara (caravanes)", italic: true },
  { label: "Sinan (architecte)", italic: true },
  { label: "Tabula Rogeriana", italic: true },
  { label: "Tamerlan (Timur)", italic: true },
  { label: "Tanger", italic: true },
  { label: "Tombouctou", italic: true },
  { label: "Topkapi (palais)", italic: true },
  { label: "Voxtral™ (service)", italic: true },
  { label: "Zij al-Sindhind", italic: true },
];

interface PersonalityListProps {
  selectedSlug: string;
  onSelect: (slug: string) => void;
  onHome?: () => void;
}

export function PersonalityList({ selectedSlug, onSelect, onHome }: PersonalityListProps) {
  // Reactive list: re-runs visiblePersonalities() when an unlock event fires.
  const [perso, setPerso] = useState<ReadonlyArray<PersonalitySummary>>(() =>
    visiblePersonalities(),
  );
  useEffect(() => {
    const refresh = () => setPerso(visiblePersonalities());
    window.addEventListener("encarta:unlock", refresh);
    return () => window.removeEventListener("encarta:unlock", refresh);
  }, []);

  // Build entries: visible personalities (clickable) + italic decoratives, sorted alphabetically.
  const personEntries: IndexEntry[] = perso.map((p) => ({
    label: p.displayName,
    slug: p.slug,
    letter: (p.displayName[0] ?? "?").toUpperCase(),
    secret: !!p.secret,
  }));
  const italicEntries: IndexEntry[] = ITALIC_ENTRIES.map((e) => ({
    label: e.label,
    italic: e.italic,
    letter: (e.label[0] ?? "?").toUpperCase(),
  }));
  const all = [...personEntries, ...italicEntries].sort((a, b) =>
    a.label.localeCompare(b.label, "fr", { sensitivity: "base" }),
  );

  // Group by first letter.
  const grouped = new Map<string, IndexEntry[]>();
  for (const e of all) {
    const arr = grouped.get(e.letter) ?? [];
    arr.push(e);
    grouped.set(e.letter, arr);
  }

  return (
    <div
      style={{
        background: "#fff",
        borderRight: "1px solid #888",
        height: "100%",
        overflowY: "auto",
        fontFamily: "Tahoma, sans-serif",
        fontSize: 11,
      }}
    >
      <div
        style={{
          padding: "6px 10px",
          background:
            "linear-gradient(180deg, #4a8de0 0%, #2a6cc8 50%, #1c5cb6 100%)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 12,
          borderBottom: "1px solid #103e7a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 1,
        }}
      >
        <span>All entries</span>
        {onHome && (
          <button
            onClick={onHome}
            title="Retour à l'accueil"
            style={{
              fontSize: 10,
              padding: "0 6px",
              minWidth: 0,
              minHeight: 0,
              height: 18,
            }}
          >
            🏠
          </button>
        )}
      </div>

      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {[...grouped.entries()].map(([letter, items]) => (
          <li key={letter}>
            <div
              style={{
                padding: "3px 10px",
                background: "#e6e6e6",
                color: "#000080",
                fontWeight: 700,
                fontFamily: "Georgia, serif",
                fontSize: 13,
                borderTop: "1px solid #b8b8b8",
                borderBottom: "1px solid #d8d8d8",
              }}
            >
              {letter}
            </div>
            {items.map((entry, i) => (
              <Item
                key={i}
                entry={entry}
                selected={!!entry.slug && entry.slug === selectedSlug}
                onClick={() => entry.slug && onSelect(entry.slug)}
              />
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Item({
  entry,
  selected,
  onClick,
}: {
  entry: IndexEntry;
  selected: boolean;
  onClick: () => void;
}) {
  const clickable = !!entry.slug;
  return (
    <button
      type="button"
      onClick={clickable ? onClick : undefined}
      disabled={!clickable}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "2px 10px 2px 18px",
        border: "none",
        background: selected ? "#316ac5" : "transparent",
        color: selected ? "#fff" : clickable ? "#000" : "#666",
        cursor: clickable ? "pointer" : "default",
        fontFamily: "inherit",
        fontSize: "inherit",
        fontStyle: entry.italic ? "italic" : "normal",
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 6,
        lineHeight: 1.6,
      }}
      onMouseEnter={(e) => {
        if (!selected && clickable) e.currentTarget.style.background = "#e0ebff";
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.background = "transparent";
      }}
    >
      <span aria-hidden style={{ fontSize: 9, opacity: 0.7 }}>
        {clickable ? (entry.secret ? "✨" : "👤") : "📄"}
      </span>
      <span>{entry.label}</span>
    </button>
  );
}
