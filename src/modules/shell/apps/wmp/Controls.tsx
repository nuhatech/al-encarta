"use client";
import type { Skin } from "./types";

interface ControlsProps {
  skin: Skin;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (s: number) => void;
  onVolume: (v: number) => void;
  trackTitle: string;
}

export function Controls({
  skin,
  isPlaying,
  isLoading,
  currentTime,
  duration,
  volume,
  onPlayPause,
  onPrev,
  onNext,
  onSeek,
  onVolume,
  trackTitle,
}: ControlsProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        background: `linear-gradient(180deg, ${hexA(skin.outerStart, 0.85)} 0%, ${hexA(skin.outerEnd, 0.95)} 100%)`,
        borderTop: `1px solid ${skin.accentSoft}`,
        color: skin.text,
        fontFamily: "Tahoma, sans-serif",
        fontSize: 11,
      }}
    >
      <RoundButton skin={skin} onClick={onPrev} title="Précédent" symbol="⏮" />
      <RoundButton
        skin={skin}
        onClick={onPlayPause}
        title={isPlaying ? "Pause" : isLoading ? "Chargement..." : "Lecture"}
        symbol={isLoading ? "⌛" : isPlaying ? "⏸" : "▶"}
        big
      />
      <RoundButton skin={skin} onClick={onNext} title="Suivant" symbol="⏭" />

      {/* Scrubber + time */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 2 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
            color: skin.subtext,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span
            style={{
              maxWidth: "60%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: skin.text,
            }}
            title={trackTitle}
          >
            {trackTitle}
          </span>
          <span>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={Math.max(0.1, duration)}
          step={0.1}
          value={Math.min(currentTime, duration || 0)}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          disabled={duration <= 0}
          style={{
            width: "100%",
            accentColor: skin.accent,
            cursor: duration > 0 ? "pointer" : "default",
          }}
        />
      </div>

      {/* Volume */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 130 }}>
        <span style={{ fontSize: 13, color: skin.accent }} aria-hidden>
          🔊
        </span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => onVolume(parseFloat(e.target.value))}
          style={{ width: 100, accentColor: skin.accent }}
        />
      </div>
    </div>
  );
}

function RoundButton({
  skin,
  onClick,
  title,
  symbol,
  big = false,
}: {
  skin: Skin;
  onClick: () => void;
  title: string;
  symbol: string;
  big?: boolean;
}) {
  const size = big ? 38 : 28;
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        flexShrink: 0,
        boxSizing: "border-box",
        borderRadius: "50%",
        background: `radial-gradient(circle at 35% 28%, #fff 0%, ${skin.accent} 30%, ${skin.outerEnd} 100%)`,
        border: `1px solid ${skin.accentSoft}`,
        boxShadow: `inset 0 2px 4px rgba(255,255,255,0.4), 0 1px 3px rgba(0,0,0,0.5)`,
        cursor: "pointer",
        color: skin.text,
        fontSize: big ? 16 : 12,
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        textShadow: "0 1px 2px rgba(0,0,0,0.4)",
      }}
    >
      {symbol}
    </button>
  );
}

function formatTime(s: number): string {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function hexA(hex: string, alpha: number): string {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
