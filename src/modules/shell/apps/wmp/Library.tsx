"use client";
import type { Skin, Track } from "./types";

interface LibraryProps {
  skin: Skin;
  tracks: ReadonlyArray<Track>;
  currentId: string | null;
  onSelect: (id: string) => void;
}

export function Library({ skin, tracks, currentId, onSelect }: LibraryProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "200px 1fr",
        gap: 8,
        padding: 10,
        height: "100%",
        boxSizing: "border-box",
        color: skin.text,
        fontFamily: "Tahoma, sans-serif",
        fontSize: 11,
      }}
    >
      <aside
        style={{
          background: "rgba(0,0,0,0.35)",
          border: `1px solid ${skin.accentSoft}`,
          borderRadius: 4,
          padding: 10,
        }}
      >
        <div style={{ color: skin.accent, fontWeight: 700, marginBottom: 8 }}>
          Bibliothèque
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 3 }}>
          {[
            { label: "Tous les contenus", count: tracks.length, active: true },
            { label: "Poèmes mystiques", count: 2 },
            { label: "Poèmes classiques", count: 1 },
            { label: "Poésie pré-islamique", count: 1 },
            { label: "Poèmes soufis", count: 1 },
            { label: "Récents", count: 0 },
          ].map((item) => (
            <li
              key={item.label}
              style={{
                padding: "3px 6px",
                cursor: "pointer",
                background: item.active ? skin.accent : "transparent",
                color: item.active ? "#000" : skin.text,
                borderRadius: 2,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>{item.label}</span>
              <span style={{ opacity: 0.6 }}>{item.count}</span>
            </li>
          ))}
        </ul>
      </aside>

      <main
        style={{
          background: "rgba(0,0,0,0.35)",
          border: `1px solid ${skin.accentSoft}`,
          borderRadius: 4,
          overflow: "auto",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.06)" }}>
              <Th skin={skin}>Titre</Th>
              <Th skin={skin}>Auteur</Th>
              <Th skin={skin}>Album</Th>
              <Th skin={skin}>Époque</Th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((t) => {
              const active = t.id === currentId;
              return (
                <tr
                  key={t.id}
                  onDoubleClick={() => onSelect(t.id)}
                  onClick={() => onSelect(t.id)}
                  style={{
                    cursor: "pointer",
                    background: active ? skin.accent : "transparent",
                    color: active ? "#000" : skin.text,
                    transition: "background 80ms ease-out",
                  }}
                >
                  <Td>{t.title}</Td>
                  <Td>{t.author}</Td>
                  <Td>{t.album ?? "—"}</Td>
                  <Td>{t.era ?? "—"}</Td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {tracks.length === 0 && (
          <div style={{ padding: 20, color: skin.subtext, textAlign: "center" }}>
            Aucun titre dans la bibliothèque.
          </div>
        )}
      </main>
    </div>
  );
}

function Th({ children, skin }: { children: React.ReactNode; skin: Skin }) {
  return (
    <th
      style={{
        textAlign: "left",
        fontWeight: 700,
        padding: "6px 8px",
        color: skin.accent,
        borderBottom: `1px solid ${skin.accentSoft}`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td
      style={{
        padding: "5px 8px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflow: "hidden",
        maxWidth: 240,
      }}
    >
      {children}
    </td>
  );
}
