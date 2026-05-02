"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAudioEngine } from "./wmp/use-audio-engine";
import { TRACKS } from "./wmp/tracks";
import { SKINS, DEFAULT_SKIN_ID } from "./wmp/skins";
import { NowPlaying } from "./wmp/NowPlaying";
import { Library } from "./wmp/Library";
import { RadioTuner } from "./wmp/RadioTuner";
import { SkinChooser } from "./wmp/SkinChooser";
import { Controls } from "./wmp/Controls";
import { VISUALIZATION_MODES } from "./wmp/Visualizer";
import type { WmpView, VisualizationMode } from "./wmp/types";

const VIEWS: ReadonlyArray<{ id: WmpView; label: string }> = [
  { id: "now-playing", label: "Now Playing" },
  { id: "library", label: "Media Library" },
  { id: "radio", label: "Radio Tuner" },
  { id: "skin", label: "Skin Chooser" },
];

const STORAGE_SKIN = "encarta-2001:wmp-skin";

/** Windows Media Player 8 — full chrome with skins, EQ, visualizer, library. */
export function WmpApp() {
  const audio = useAudioEngine();
  const [view, setView] = useState<WmpView>("now-playing");
  const [skinId, setSkinId] = useState<string>(DEFAULT_SKIN_ID);
  const [visualization, setVisualization] = useState<VisualizationMode["id"]>("bars");
  const [currentTrackId, setCurrentTrackId] = useState<string>(
    TRACKS[0]?.id ?? "",
  );

  // Load skin from localStorage on mount.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_SKIN);
      if (saved && SKINS.some((s) => s.id === saved)) setSkinId(saved);
    } catch {
      // ignore
    }
  }, []);

  // Persist skin choice.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_SKIN, skinId);
    } catch {
      // ignore
    }
  }, [skinId]);

  const skin = useMemo(
    () => SKINS.find((s) => s.id === skinId) ?? SKINS[0]!,
    [skinId],
  );
  const track = useMemo(
    () => TRACKS.find((t) => t.id === currentTrackId) ?? null,
    [currentTrackId],
  );

  // Whenever the selected track changes, point the engine to its source.
  useEffect(() => {
    if (track) audio.load(track.src);
  }, [track, audio]);

  const onPrev = useCallback(() => {
    const idx = TRACKS.findIndex((t) => t.id === currentTrackId);
    if (idx <= 0) return;
    const previous = TRACKS[idx - 1];
    if (previous) setCurrentTrackId(previous.id);
  }, [currentTrackId]);

  const onNext = useCallback(() => {
    const idx = TRACKS.findIndex((t) => t.id === currentTrackId);
    if (idx < 0 || idx >= TRACKS.length - 1) return;
    const next = TRACKS[idx + 1];
    if (next) setCurrentTrackId(next.id);
  }, [currentTrackId]);

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        background: `linear-gradient(180deg, ${skin.outerStart} 0%, ${skin.outerEnd} 100%)`,
        borderRadius: 4,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        color: skin.text,
        fontFamily: "Tahoma, sans-serif",
      }}
    >
      {/* Top branding strip */}
      <div
        style={{
          padding: "6px 12px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: `linear-gradient(180deg, ${hexA("#000", 0.2)} 0%, transparent 100%)`,
          borderBottom: `1px solid ${skin.accentSoft}`,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: skin.accent,
            letterSpacing: 0.4,
            fontStyle: "italic",
          }}
        >
          Microsoft Windows Media Player
        </span>
        <span style={{ fontSize: 10, color: skin.subtext }}>· version 8</span>
      </div>

      {/* Tab strip */}
      <div
        style={{
          display: "flex",
          gap: 0,
          background: "rgba(0,0,0,0.25)",
          borderBottom: `1px solid ${skin.accentSoft}`,
        }}
      >
        {VIEWS.map((v) => {
          const active = view === v.id;
          return (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              style={{
                background: active
                  ? `linear-gradient(180deg, ${skin.accent} 0%, ${skin.accentSoft} 50%, ${skin.outerEnd} 100%)`
                  : "transparent",
                color: active ? "#000" : skin.text,
                border: "none",
                padding: "8px 18px",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 12,
                fontWeight: active ? 700 : 400,
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                marginRight: 2,
                boxShadow: active
                  ? `inset 0 1px 0 rgba(255,255,255,0.5), 0 0 6px ${hexA(skin.accent, 0.4)}`
                  : "none",
              }}
            >
              {v.label}
            </button>
          );
        })}
      </div>

      {/* Main view */}
      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        {view === "now-playing" && (
          <NowPlaying
            skin={skin}
            track={track}
            isPlaying={audio.state.isPlaying}
            visualization={visualization}
            onChangeVisualization={setVisualization}
            eqGains={audio.state.eqGains}
            onEqChange={audio.setEqGain}
            getFrequencyData={audio.getFrequencyData}
            getTimeDomainData={audio.getTimeDomainData}
            error={audio.state.error}
          />
        )}
        {view === "library" && (
          <Library
            skin={skin}
            tracks={TRACKS}
            currentId={currentTrackId}
            onSelect={(id) => {
              setCurrentTrackId(id);
              setView("now-playing");
            }}
          />
        )}
        {view === "radio" && <RadioTuner skin={skin} />}
        {view === "skin" && (
          <SkinChooser skins={SKINS} currentId={skinId} onSelect={setSkinId} />
        )}
      </div>

      {/* Transport */}
      <Controls
        skin={skin}
        isPlaying={audio.state.isPlaying}
        isLoading={audio.state.isLoading}
        currentTime={audio.state.currentTime}
        duration={audio.state.duration}
        volume={audio.state.volume}
        onPlayPause={audio.toggle}
        onPrev={onPrev}
        onNext={onNext}
        onSeek={audio.seek}
        onVolume={audio.setVolume}
        trackTitle={track?.title ?? "Aucun titre"}
      />

      {/* Visualizations selector list shown only when in "Now Playing" — handled inline */}
      {VISUALIZATION_MODES.length === 0 && null /* keep the import alive for type sanity */}
    </div>
  );
}

function hexA(hex: string, alpha: number): string {
  const n = hex.replace("#", "");
  if (n.length === 3) return hexA("#" + n.split("").map((c) => c + c).join(""), alpha);
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
