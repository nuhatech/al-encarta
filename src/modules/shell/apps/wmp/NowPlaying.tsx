"use client";
import { Visualizer, VISUALIZATION_MODES } from "./Visualizer";
import { Equalizer } from "./Equalizer";
import type { Skin, Track, VisualizationMode } from "./types";

interface NowPlayingProps {
  skin: Skin;
  track: Track | null;
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
  track,
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
        display: "grid",
        gridTemplateColumns: "1fr 240px",
        gap: 10,
        padding: 10,
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 0 }}>
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

        {/* Equalizer */}
        <Equalizer skin={skin} gains={eqGains} onChange={onEqChange} />
      </div>

      {/* Right: track info + album panel */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          padding: 12,
          background: "rgba(0,0,0,0.35)",
          border: `1px solid ${skin.accentSoft}`,
          borderRadius: 4,
          color: skin.text,
          fontFamily: "Tahoma, sans-serif",
          fontSize: 11,
          minHeight: 0,
        }}
      >
        <div
          style={{
            aspectRatio: "1 / 1",
            background: `linear-gradient(135deg, ${skin.outerStart} 0%, ${skin.outerEnd} 100%)`,
            border: `1px solid ${skin.accentSoft}`,
            borderRadius: 4,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: skin.text,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />
          <span style={{ fontSize: 36, fontFamily: "Georgia, serif", opacity: 0.7 }}>
            ﷽
          </span>
        </div>

        <div style={{ minHeight: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: skin.accent,
              marginBottom: 2,
              wordBreak: "break-word",
            }}
          >
            {track?.title ?? "—"}
          </div>
          <div style={{ color: skin.subtext, fontSize: 11 }}>
            {track?.author ?? ""}
          </div>
          {track?.album && (
            <div style={{ color: skin.subtext, fontSize: 10, marginTop: 4 }}>
              {track.album}
            </div>
          )}
          {track?.era && (
            <div
              style={{
                color: skin.subtext,
                fontSize: 10,
                fontStyle: "italic",
                marginTop: 4,
              }}
            >
              {track.era}
            </div>
          )}
        </div>

        <div style={{ marginTop: "auto", fontSize: 9, color: skin.subtext, lineHeight: 1.4 }}>
          Égaliseur Web Audio · 10 bandes biquad · analyseur FFT 256 bins
        </div>
      </div>
    </div>
  );
}
