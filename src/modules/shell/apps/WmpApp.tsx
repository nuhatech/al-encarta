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
import type { Skin, WmpView, VisualizationMode } from "./wmp/types";

interface NavItem {
  id: WmpView | string;
  label: string;
  view?: WmpView;
  disabled?: boolean;
}

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { id: "now-playing", label: "Now Playing", view: "now-playing" },
  { id: "media-guide", label: "Media Guide", disabled: true },
  { id: "copy-cd", label: "Copy from CD", disabled: true },
  { id: "library", label: "Media Library", view: "library" },
  { id: "radio", label: "Radio Tuner", view: "radio" },
  { id: "copy-device", label: "Copy to CD\nor Device", disabled: true },
  { id: "premium", label: "Premium Services", disabled: true },
  { id: "skin", label: "Skin Chooser", view: "skin" },
];

const MENU_BAR = ["File", "View", "Play", "Tools", "Help"] as const;

const STORAGE_SKIN = "encarta-2001:wmp-skin";

/**
 * Windows Media Player 8 — full-chrome layout matching the original:
 * - top menu bar
 * - left vertical navigation rail
 * - center main view
 * - right Info Center panel (track list)
 * - bottom transport controls
 * - bottom-left WMP branding strip
 */
export function WmpApp() {
  const audio = useAudioEngine();
  const [view, setView] = useState<WmpView>("now-playing");
  const [skinId, setSkinId] = useState<string>(DEFAULT_SKIN_ID);
  const [visualization, setVisualization] = useState<VisualizationMode["id"]>("battery");
  const [currentTrackId, setCurrentTrackId] = useState<string>(
    TRACKS[0]?.id ?? "",
  );

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_SKIN);
      if (saved && SKINS.some((s) => s.id === saved)) setSkinId(saved);
    } catch {
      // ignore
    }
  }, []);

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
        display: "grid",
        gridTemplateRows: "auto 1fr auto auto",
        gridTemplateColumns: "1fr",
        overflow: "hidden",
        color: skin.text,
        fontFamily: "Tahoma, sans-serif",
      }}
    >
      <MenuBar skin={skin} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "146px 1fr 280px",
          minHeight: 0,
        }}
      >
        <NavRail
          skin={skin}
          activeView={view}
          onSelect={(v) => setView(v)}
        />

        <main
          style={{
            background: skin.screen,
            borderLeft: `1px solid ${hexA("#000", 0.4)}`,
            borderRight: `1px solid ${hexA("#000", 0.4)}`,
            minHeight: 0,
            position: "relative",
            overflow: "hidden",
          }}
        >
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
        </main>

        <InfoCenter
          skin={skin}
          tracks={TRACKS}
          currentId={currentTrackId}
          duration={audio.state.duration}
          onSelect={(id) => {
            setCurrentTrackId(id);
            setView("now-playing");
          }}
        />
      </div>

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

      <BrandingStrip skin={skin} />
    </div>
  );
}

function MenuBar({ skin }: { skin: Skin }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        padding: "4px 6px",
        background: `linear-gradient(180deg, ${hexA(skin.outerStart, 0.95)} 0%, ${hexA(skin.outerEnd, 0.95)} 100%)`,
        borderBottom: `1px solid ${hexA("#000", 0.3)}`,
        fontFamily: "Tahoma, sans-serif",
        fontSize: 11,
        color: skin.text,
      }}
    >
      <img
        src="/wmp-icon.webp"
        alt=""
        aria-hidden
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
        style={{ width: 16, height: 16, marginRight: 8, marginLeft: 4 }}
      />
      {MENU_BAR.map((label) => (
        <button
          key={label}
          style={{
            background: "transparent",
            border: "none",
            color: skin.text,
            padding: "2px 10px",
            fontFamily: "inherit",
            fontSize: "inherit",
            cursor: "default",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = hexA(skin.accent, 0.15))}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function NavRail({
  skin,
  activeView,
  onSelect,
}: {
  skin: Skin;
  activeView: WmpView;
  onSelect: (v: WmpView) => void;
}) {
  return (
    <nav
      style={{
        background: `linear-gradient(180deg, ${hexA("#000", 0.18)} 0%, ${hexA("#000", 0.4)} 100%)`,
        padding: "8px 0",
        fontFamily: "Tahoma, sans-serif",
        fontSize: 11,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        overflowY: "auto",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = !!item.view && item.view === activeView;
        return (
          <button
            key={item.id}
            onClick={() => item.view && !item.disabled && onSelect(item.view)}
            disabled={item.disabled}
            style={{
              textAlign: "left",
              background: active
                ? `linear-gradient(180deg, ${skin.accentSoft} 0%, ${skin.outerStart} 100%)`
                : "transparent",
              border: "none",
              color: item.disabled
                ? hexA(skin.subtext, 0.55)
                : active
                  ? "#fff"
                  : skin.text,
              padding: "10px 14px",
              fontFamily: "inherit",
              fontSize: 12,
              fontWeight: active ? 700 : 400,
              cursor: item.disabled ? "default" : "pointer",
              whiteSpace: "pre-line",
              lineHeight: 1.2,
              position: "relative",
              borderLeft: active
                ? `3px solid ${skin.accent}`
                : "3px solid transparent",
              boxShadow: active ? `inset 0 0 12px ${hexA(skin.accent, 0.4)}` : "none",
            }}
            onMouseEnter={(e) => {
              if (!active && !item.disabled) {
                e.currentTarget.style.background = hexA(skin.accent, 0.12);
              }
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.background = "transparent";
            }}
          >
            {item.label}
            {active && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 10,
                  color: "#fff",
                }}
              >
                ▶
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

function InfoCenter({
  skin,
  tracks,
  currentId,
  duration,
  onSelect,
}: {
  skin: Skin;
  tracks: ReadonlyArray<typeof TRACKS[number]>;
  currentId: string;
  duration: number;
  onSelect: (id: string) => void;
}) {
  const current = tracks.find((t) => t.id === currentId);
  return (
    <aside
      style={{
        background: `linear-gradient(180deg, ${hexA(skin.outerStart, 0.85)} 0%, ${hexA(skin.outerEnd, 0.95)} 100%)`,
        borderLeft: `1px solid ${hexA("#000", 0.35)}`,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        fontFamily: "Tahoma, sans-serif",
        fontSize: 11,
        color: skin.text,
      }}
    >
      <div
        style={{
          display: "flex",
          padding: "6px 0 0",
          background: `linear-gradient(180deg, ${hexA("#000", 0.2)} 0%, transparent 100%)`,
          gap: 2,
          paddingLeft: 6,
        }}
      >
        <Tab skin={skin} active={false} disabled>
          🔍 Info Center
        </Tab>
        <Tab skin={skin} active>
          🎵 Now Playing ▾
        </Tab>
      </div>

      <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8, minHeight: 0, flex: 1 }}>
        <div style={{ textAlign: "right" }}>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{
              fontSize: 10,
              color: skin.accent,
              textDecoration: "underline",
            }}
          >
            Find Album Info
          </a>
        </div>

        <div
          style={{
            aspectRatio: "1 / 1",
            background: `linear-gradient(135deg, ${skin.outerStart} 0%, ${skin.outerEnd} 100%)`,
            border: `1px solid ${skin.accentSoft}`,
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            maxHeight: 140,
          }}
        >
          <span style={{ fontSize: 36, fontFamily: "Georgia, serif", opacity: 0.7, color: skin.text }}>
            ﷽
          </span>
        </div>

        <div style={{ minHeight: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 11, color: skin.text }}>
            {current?.author ?? "—"} - {current?.title ?? "—"}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            background: hexA("#000", 0.3),
            border: `1px solid ${hexA("#000", 0.4)}`,
            borderRadius: 2,
          }}
        >
          {tracks.map((t) => {
            const active = t.id === currentId;
            return (
              <div
                key={t.id}
                onClick={() => onSelect(t.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 6px",
                  cursor: "pointer",
                  background: active ? hexA(skin.accent, 0.25) : "transparent",
                  borderBottom: `1px solid ${hexA("#000", 0.25)}`,
                  fontSize: 10,
                  color: active ? skin.accent : skin.text,
                  fontWeight: active ? 700 : 400,
                }}
              >
                <span
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={`${t.author} - ${t.title}`}
                >
                  {t.author === "—" ? t.title : `${t.author} - ${t.title}`}
                </span>
                <span style={{ color: skin.subtext, fontVariantNumeric: "tabular-nums" }}>
                  {active && duration ? formatTime(duration) : "--:--"}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: skin.subtext,
                    cursor: "pointer",
                    padding: 0,
                    fontSize: 11,
                  }}
                  title="Retirer"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 6,
            borderTop: `1px solid ${hexA("#000", 0.3)}`,
            color: skin.subtext,
            fontSize: 10,
          }}
        >
          <span>
            Total Time : <strong style={{ color: skin.text }}>{formatTime(duration)}</strong>
          </span>
          <span>
            <span style={{ color: skin.accent, marginRight: 4 }}>♪</span> STEREO
          </span>
        </div>
      </div>
    </aside>
  );
}

function Tab({
  children,
  skin,
  active,
  disabled,
}: {
  children: React.ReactNode;
  skin: Skin;
  active: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      style={{
        padding: "4px 10px",
        background: active
          ? `linear-gradient(180deg, ${skin.outerStart} 0%, ${skin.outerEnd} 100%)`
          : "transparent",
        color: disabled ? hexA(skin.subtext, 0.6) : skin.text,
        fontSize: 10,
        border: "none",
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        cursor: disabled ? "default" : "pointer",
        fontFamily: "inherit",
        boxShadow: active ? `inset 0 1px 0 ${hexA("#fff", 0.25)}` : "none",
      }}
    >
      {children}
    </button>
  );
}

function BrandingStrip({ skin }: { skin: Skin }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "5px 12px",
        background: `linear-gradient(180deg, ${hexA(skin.outerEnd, 0.8)} 0%, ${hexA("#000", 0.6)} 100%)`,
        borderTop: `1px solid ${hexA("#000", 0.3)}`,
        color: skin.text,
        fontFamily: "Tahoma, sans-serif",
        fontSize: 10,
      }}
    >
      <img
        src="/wmp-icon.webp"
        alt=""
        aria-hidden
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
        style={{ width: 18, height: 18 }}
      />
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
        <span style={{ fontFamily: "Trebuchet MS, sans-serif", fontStyle: "italic", fontWeight: 700, fontSize: 11, color: skin.text }}>
          Windows
        </span>
        <span style={{ fontFamily: "Trebuchet MS, sans-serif", fontWeight: 700, fontSize: 9, color: skin.subtext, letterSpacing: 0.5 }}>
          Media Player
        </span>
      </div>
    </div>
  );
}

function formatTime(s: number): string {
  if (!Number.isFinite(s) || s <= 0) return "--:--";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

function hexA(hex: string, alpha: number): string {
  const n = hex.replace("#", "");
  if (n.length === 3) return hexA("#" + n.split("").map((c) => c + c).join(""), alpha);
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
