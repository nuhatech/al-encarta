"use client";
import type { Skin } from "./types";
import { EQ_FREQUENCIES } from "./use-audio-engine";

interface EqualizerProps {
  skin: Skin;
  gains: ReadonlyArray<number>; // length === EQ_FREQUENCIES.length
  onChange: (bandIndex: number, gainDb: number) => void;
}

const PRESETS: Record<string, ReadonlyArray<number>> = {
  Plat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  Voix: [-2, -1, 0, 2, 4, 4, 3, 2, 0, -1],
  Acoustique: [3, 2, 1, 0, -1, -1, 0, 2, 3, 4],
  Salle: [4, 3, 2, 1, 0, 0, 0, 1, 2, 3],
  "Maqām (sombre)": [3, 2, 1, 0, -1, -2, -2, -1, 1, 2],
};

export function Equalizer({ skin, gains, onChange }: EqualizerProps) {
  const applyPreset = (vals: ReadonlyArray<number>) => {
    vals.forEach((g, i) => onChange(i, g));
  };

  return (
    <div
      style={{
        background: "rgba(0,0,0,0.35)",
        border: `1px solid ${skin.accentSoft}`,
        borderRadius: 4,
        padding: 12,
        color: skin.text,
        fontFamily: "Tahoma, sans-serif",
        fontSize: 11,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <strong style={{ color: skin.accent, letterSpacing: 0.5 }}>
          Égaliseur 10 bandes
        </strong>
        <div style={{ display: "flex", gap: 4 }}>
          {Object.entries(PRESETS).map(([name, vals]) => (
            <button
              key={name}
              onClick={() => applyPreset(vals)}
              style={{
                fontSize: 10,
                padding: "1px 6px",
                background: "rgba(255,255,255,0.08)",
                border: `1px solid ${skin.accentSoft}`,
                color: skin.text,
                cursor: "pointer",
                borderRadius: 2,
                fontFamily: "inherit",
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${EQ_FREQUENCIES.length}, 1fr)`,
          gap: 6,
          alignItems: "end",
        }}
      >
        {EQ_FREQUENCIES.map((freq, i) => (
          <div
            key={freq}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span
              style={{
                fontSize: 9,
                color: (gains[i] ?? 0) !== 0 ? skin.accent : skin.subtext,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {(gains[i] ?? 0) > 0 ? "+" : ""}
              {Math.round(gains[i] ?? 0)}
            </span>
            <input
              type="range"
              min={-12}
              max={12}
              step={1}
              value={gains[i] ?? 0}
              onChange={(e) => onChange(i, parseInt(e.target.value, 10))}
              style={
                {
                  writingMode: "vertical-lr",
                  WebkitAppearance: "slider-vertical",
                  appearance: "slider-vertical",
                  width: 18,
                  height: 90,
                  accentColor: skin.accent,
                } as unknown as React.CSSProperties
              }
            />
            <span style={{ fontSize: 9, color: skin.subtext }}>{formatHz(freq)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatHz(hz: number): string {
  if (hz >= 1000) return `${hz / 1000}k`;
  return `${hz}`;
}
