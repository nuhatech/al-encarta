"use client";
import type { RadioStation, Skin } from "./types";

interface RadioTunerProps {
  skin: Skin;
}

const STATIONS: ReadonlyArray<RadioStation> = [
  {
    id: "azhar",
    name: "Radio al-Azhar",
    tagline: "Récitations classiques · Caire",
    bitrate: "128 kbps",
    online: true,
  },
  {
    id: "qarawiyyin",
    name: "Qarawiyyin Live",
    tagline: "Conférences depuis Fès",
    bitrate: "96 kbps",
    online: true,
  },
  {
    id: "andalus",
    name: "Andalus FM",
    tagline: "Muwashahat & qasidas — héritage al-Andalus",
    bitrate: "192 kbps",
    online: true,
  },
  {
    id: "hadith-bagdad",
    name: "Bayt al-Hikma",
    tagline: "Lectures de la Risāla, du Muwaṭṭaʾ et de la Muqaddima",
    bitrate: "128 kbps",
    online: false,
  },
  {
    id: "diwan-shafii",
    name: "Diwan al-Shāfiʿī",
    tagline: "Diction de poésie classique en boucle",
    bitrate: "64 kbps",
    online: true,
  },
];

export function RadioTuner({ skin }: RadioTunerProps) {
  return (
    <div
      style={{
        padding: 14,
        height: "100%",
        boxSizing: "border-box",
        color: skin.text,
        fontFamily: "Tahoma, sans-serif",
        fontSize: 11,
        overflow: "auto",
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <div style={{ color: skin.accent, fontSize: 16, fontWeight: 700 }}>
          Radio Tuner
        </div>
        <div style={{ color: skin.subtext, fontSize: 11 }}>
          Stations virtuelles — démo non-streamable. La vraie démo joue la
          bibliothèque locale.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {STATIONS.map((s) => (
          <button
            key={s.id}
            disabled={!s.online}
            style={{
              textAlign: "left",
              padding: 10,
              background: s.online
                ? "rgba(0,0,0,0.35)"
                : "rgba(0,0,0,0.18)",
              border: `1px solid ${s.online ? skin.accentSoft : "rgba(255,255,255,0.15)"}`,
              borderRadius: 4,
              cursor: s.online ? "pointer" : "default",
              color: skin.text,
              fontFamily: "inherit",
              opacity: s.online ? 1 : 0.5,
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: `radial-gradient(circle at 35% 30%, ${skin.accent} 0%, ${skin.outerEnd} 100%)`,
                border: `1px solid ${skin.accentSoft}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                color: skin.outerEnd,
                flexShrink: 0,
              }}
            >
              📻
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: skin.accent }}>{s.name}</div>
              <div
                style={{
                  fontSize: 10,
                  color: skin.subtext,
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
              >
                {s.tagline}
              </div>
              <div style={{ fontSize: 9, color: skin.subtext, marginTop: 3 }}>
                {s.bitrate} · {s.online ? "● en ligne" : "○ hors ligne"}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
