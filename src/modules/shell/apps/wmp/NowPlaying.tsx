"use client";
import { Visualizer, VISUALIZATION_MODES } from "./Visualizer";
import { Equalizer } from "./Equalizer";
import type { Skin, VisualizationMode } from "./types";

interface NowPlayingProps {
  skin: Skin;
  isPlaying: boolean;
  visualization: VisualizationMode["id"];
  onChangeVisualization: (id: VisualizationMode["id"]) => void;
  eqGains: ReadonlyArray<number>;
  onEqChange: (band: number, gain: number) => void;
  getFrequencyData: (b: Uint8Array) => void;
  getTimeDomainData: (b: Uint8Array) => void;
  error: string | null;
}

export function NowPlaying({
  skin,
  isPlaying,
  visualization,
  onChangeVisualization,
  eqGains,
  onEqChange,
  getFrequencyData,
  getTimeDomainData,
  error,
}: NowPlayingProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 10,
        height: "100%",
        boxSizing: "border-box",
        minHeight: 0,
      }}
    >
      {/* Visualization picker chip strip */}
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <span style={{ fontSize: 10, color: skin.subtext, marginRight: 4 }}>
          Visualisation :
        </span>
        {VISUALIZATION_MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => onChangeVisualization(m.id)}
            style={{
              fontSize: 10,
              padding: "2px 8px",
              background:
                visualization === m.id
                  ? `linear-gradient(180deg, ${skin.accent} 0%, ${skin.accentSoft} 100%)`
                  : "rgba(255,255,255,0.08)",
              color: visualization === m.id ? "#000" : skin.text,
              border: `1px solid ${skin.accentSoft}`,
              cursor: "pointer",
              borderRadius: 2,
              fontFamily: "Tahoma, sans-serif",
            }}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* Visualizer canvas */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          border: `1px solid ${skin.accentSoft}`,
          borderRadius: 4,
          overflow: "hidden",
          position: "relative",
          background: skin.screen,
        }}
      >
        <Visualizer
          skin={skin}
          mode={visualization}
          isPlaying={isPlaying}
          getFrequencyData={getFrequencyData}
          getTimeDomainData={getTimeDomainData}
        />
        {error && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              background: "rgba(0,0,0,0.6)",
              border: `1px solid ${skin.accentSoft}`,
              color: skin.text,
              padding: "10px 16px",
              fontSize: 11,
              fontFamily: "Tahoma, sans-serif",
            }}
          >
            ⚠ {error} — vérifiez que le fichier audio est bien dans <code>public/audio/</code>
          </div>
        )}
      </div>

      <Equalizer skin={skin} gains={eqGains} onChange={onEqChange} />
    </div>
  );
}
