"use client";
import type { Skin } from "./types";

interface SkinChooserProps {
  skins: ReadonlyArray<Skin>;
  currentId: string;
  onSelect: (id: string) => void;
}

export function SkinChooser({ skins, currentId, onSelect }: SkinChooserProps) {
  return (
    <div
      style={{
        padding: 14,
        height: "100%",
        boxSizing: "border-box",
        overflow: "auto",
        color: "#fff",
        fontFamily: "Tahoma, sans-serif",
        fontSize: 11,
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Skin Chooser</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>
          Cliquez sur une apparence pour la charger immédiatement.
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 10,
        }}
      >
        {skins.map((s) => {
          const active = s.id === currentId;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              style={{
                background: "rgba(0,0,0,0.4)",
                border: active ? `2px solid ${s.accent}` : "1px solid rgba(255,255,255,0.2)",
                borderRadius: 6,
                cursor: "pointer",
                padding: 8,
                fontFamily: "inherit",
                color: "#fff",
                textAlign: "left",
                position: "relative",
              }}
            >
              <SkinPreview skin={s} />
              <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700 }}>
                {s.displayName}
              </div>
              {active && (
                <span
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 6,
                    fontSize: 10,
                    color: s.accent,
                    fontWeight: 700,
                  }}
                >
                  ● actif
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SkinPreview({ skin }: { skin: Skin }) {
  return (
    <div
      style={{
        height: 96,
        borderRadius: 4,
        overflow: "hidden",
        position: "relative",
        background: `linear-gradient(180deg, ${skin.outerStart} 0%, ${skin.outerEnd} 100%)`,
        border: `1px solid ${skin.accentSoft}`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 8,
          background: skin.screen,
          borderRadius: 3,
          border: `1px solid ${skin.accentSoft}`,
          display: "flex",
          alignItems: "flex-end",
          padding: "4px 6px",
          gap: 2,
        }}
      >
        {[0.4, 0.7, 0.5, 0.9, 0.6, 0.3, 0.55, 0.8, 0.45, 0.7].map((h, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${h * 100}%`,
              background: `linear-gradient(180deg, ${skin.accent} 0%, ${skin.accentSoft} 60%, ${skin.outerEnd} 100%)`,
              borderRadius: 1,
            }}
          />
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          right: 6,
          top: 6,
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: skin.accent,
          boxShadow: `0 0 4px ${skin.accent}`,
        }}
      />
    </div>
  );
}
