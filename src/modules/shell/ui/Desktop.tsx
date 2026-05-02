"use client";
import { useEffect, useRef, useState } from "react";
import { useWindowManager } from "./window-manager/use-window-manager";
import { APP_REGISTRY, type AppId } from "./window-manager/types";
import { DesktopContextMenu } from "./easter-eggs/DesktopContextMenu";
import { StartMenu } from "./easter-eggs/StartMenu";

interface DesktopProps {
  onTripleClickWallpaper?: () => void;
  onAbout?: () => void;
  onRun?: () => void;
  onShutdown?: () => void;
}

/**
 * Desktop with multiple app shortcuts. Double-click an icon to launch the
 * matching app via the WindowManager. The Taskbar shows currently open
 * windows (with click-to-focus / click-to-restore behavior).
 *
 * Easter eggs:
 *  - right-click on wallpaper → XP context menu → "Propriétés" → onAbout
 *  - triple-click on wallpaper → onTripleClickWallpaper (BSOD)
 *  - Start menu → "Exécuter…" → onRun
 */
export function Desktop({
  onTripleClickWallpaper,
  onAbout,
  onRun,
  onShutdown,
}: DesktopProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const clickTimes = useRef<number[]>([]);

  const onWallpaperClick = (e: React.MouseEvent) => {
    // Don't count clicks on interactive elements (icons, taskbar, windows).
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("input") ||
      target.closest("[data-start-menu]") ||
      target.closest(".window")
    ) {
      return;
    }
    const now = performance.now();
    clickTimes.current = [...clickTimes.current.filter((t) => now - t < 700), now];
    if (clickTimes.current.length >= 3) {
      clickTimes.current = [];
      onTripleClickWallpaper?.();
    }
  };

  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  return (
    <div
      onClick={onWallpaperClick}
      onContextMenu={onContextMenu}
      style={{
        position: "fixed",
        inset: 0,
        paddingTop: 20,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 50,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          alignItems: "flex-start",
        }}
      >
        <DesktopIcon
          appId="encarta"
          label="Encarta 2002"
          icon="/encarta-2002-icon.webp"
          shortcut
        />
        <DesktopIcon appId="kutub" label="Kutub" icon="/kutub-logo.png" shortcut />
        <DesktopIcon
          appId="hilalglobe"
          label="Hilal Globe"
          icon="/hilal-logo.png"
          shortcut
        />
        <DesktopIcon
          appId="minesweeper"
          label="Démineur — Ormuz"
          icon="/minesweeper.png"
          fallbackEmoji="💣"
          shortcut
        />
      </div>

      <Taskbar onRun={onRun} onAbout={onAbout} onShutdown={onShutdown} />

      {contextMenu && (
        <DesktopContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onAbout={() => {
            setContextMenu(null);
            onAbout?.();
          }}
        />
      )}
    </div>
  );
}

interface DesktopIconProps {
  appId: AppId;
  label: string;
  icon: string;
  shortcut?: boolean;
  fallbackEmoji?: string;
}

function DesktopIcon({ appId, label, icon, shortcut, fallbackEmoji }: DesktopIconProps) {
  const wm = useWindowManager();
  const [selected, setSelected] = useState(false);
  const [iconError, setIconError] = useState(false);

  // Click anywhere outside to deselect.
  useEffect(() => {
    if (!selected) return;
    const off = () => setSelected(false);
    const t = setTimeout(() => window.addEventListener("pointerdown", off, { once: true }), 0);
    return () => {
      clearTimeout(t);
      window.removeEventListener("pointerdown", off);
    };
  }, [selected]);

  return (
    <button
      type="button"
      onDoubleClick={() => wm.open(appId)}
      onClick={(e) => {
        e.stopPropagation();
        setSelected(true);
      }}
      title={`Double-cliquer pour ouvrir ${label}`}
      style={{
        background: selected ? "rgba(49, 106, 197, 0.55)" : "transparent",
        border: selected
          ? "1px dotted rgba(255,255,255,0.85)"
          : "1px dotted transparent",
        color: "#fff",
        textShadow: "1px 1px 1px rgba(0,0,0,0.85)",
        fontSize: 12,
        padding: 6,
        width: 92,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        cursor: "pointer",
        fontFamily: "Tahoma, sans-serif",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 48,
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {iconError && fallbackEmoji ? (
          <span
            aria-hidden
            style={{ fontSize: 36, filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.55))" }}
          >
            {fallbackEmoji}
          </span>
        ) : (
          <img
            src={icon}
            alt={label}
            onError={() => setIconError(true)}
            style={{
              width: 48,
              height: 48,
              objectFit: "contain",
              filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.55))",
            }}
          />
        )}
        {shortcut && <ShortcutArrow />}
      </div>
      <span style={{ lineHeight: 1.2, textAlign: "center" }}>{label}</span>
    </button>
  );
}

function ShortcutArrow() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden
      style={{
        position: "absolute",
        left: -2,
        bottom: -2,
        filter: "drop-shadow(0 0 1px rgba(0,0,0,0.4))",
      }}
    >
      <rect x="0" y="0" width="14" height="14" fill="#fff" stroke="#000" strokeWidth="0.5" />
      <path d="M3 11 Q 3 5 9 5 L 9 3 L 12 6 L 9 9 L 9 7 Q 5 7 5 11 Z" fill="#000" />
    </svg>
  );
}

function Taskbar({
  onRun,
  onAbout,
  onShutdown,
}: {
  onRun?: () => void;
  onAbout?: () => void;
  onShutdown?: () => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 30,
        display: "flex",
        alignItems: "stretch",
        fontFamily: "Tahoma, 'Segoe UI', sans-serif",
        fontSize: 11,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
        background:
          "linear-gradient(180deg, #1f56c4 0%, #2566db 8%, #2c75e8 35%, #2666d8 60%, #1c54bf 88%, #103e7a 100%)",
        zIndex: 2000,
      }}
    >
      <StartButton onRun={onRun} onAbout={onAbout} onShutdown={onShutdown} />
      <WindowsList />
      <SystemTray />
    </div>
  );
}

function StartButton({
  onRun,
  onAbout,
  onShutdown,
}: {
  onRun?: () => void;
  onAbout?: () => void;
  onShutdown?: () => void;
}) {
  const [hover, setHover] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ position: "relative", display: "flex" }}>
      <button
        type="button"
        data-start-button
        onClick={() => setMenuOpen((v) => !v)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          position: "relative",
          height: "100%",
          minWidth: 100,
          padding: "0 22px 0 10px",
          border: "none",
          cursor: "pointer",
          background:
            hover || menuOpen
              ? "linear-gradient(180deg, #4fa12a 0%, #6dbf3d 35%, #4a9b27 70%, #2c7115 100%)"
              : "linear-gradient(180deg, #3c8b22 0%, #5eaf30 35%, #399023 70%, #246b14 100%)",
          borderTopRightRadius: 10,
          borderBottomRightRadius: 10,
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.4), inset -1px 0 0 rgba(0,0,0,0.25), 1px 0 0 #163e0a",
          color: "#fff",
          fontFamily: "Tahoma, 'Segoe UI', sans-serif",
          fontStyle: "italic",
          fontSize: 16,
          fontWeight: 700,
          textShadow: "1px 1px 1px rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <img
          src="/windows-logo.png"
          alt=""
          aria-hidden
          style={{
            width: 20,
            height: 20,
            filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.4))",
          }}
        />
        <span>start</span>
      </button>

      {menuOpen && (
        <StartMenu
          onClose={() => setMenuOpen(false)}
          onRun={() => {
            setMenuOpen(false);
            onRun?.();
          }}
          onAbout={() => {
            setMenuOpen(false);
            onAbout?.();
          }}
          onShutdown={() => {
            setMenuOpen(false);
            onShutdown?.();
          }}
        />
      )}
    </div>
  );
}

function WindowsList() {
  const wm = useWindowManager();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 6px",
        marginLeft: 2,
        flex: 1,
        overflow: "hidden",
        boxShadow: "inset 1px 0 0 rgba(255,255,255,0.25), inset -1px 0 0 rgba(0,0,0,0.18)",
      }}
    >
      {wm.windows.map((w) => {
        const meta = APP_REGISTRY[w.appId];
        const isTop = wm.topAppId === w.appId;
        return (
          <button
            key={w.appId}
            onClick={() => wm.toggleMinimize(w.appId)}
            title={meta.title}
            style={{
              minWidth: 0,
              maxWidth: 220,
              flex: "0 1 180px",
              height: 22,
              padding: "0 8px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 11,
              fontWeight: isTop && !w.minimized ? 700 : 400,
              color: "#fff",
              textShadow: "1px 1px 1px rgba(0,0,0,0.55)",
              background:
                isTop && !w.minimized
                  ? "linear-gradient(180deg, #1d4aaf 0%, #1248a4 100%)"
                  : "linear-gradient(180deg, #2f6dd2 0%, #1e54c4 100%)",
              boxShadow:
                isTop && !w.minimized
                  ? "inset 1px 1px 0 rgba(0,0,0,0.4), inset -1px -1px 0 rgba(255,255,255,0.2)"
                  : "inset 1px 1px 0 rgba(255,255,255,0.2), inset -1px -1px 0 rgba(0,0,0,0.3)",
              borderRadius: 2,
            }}
          >
            <img
              src={meta.icon}
              alt=""
              aria-hidden
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
              style={{ width: 14, height: 14, objectFit: "contain", flexShrink: 0 }}
            />
            <span
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {meta.title.split(" — ")[0] ?? meta.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SystemTray() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 8px 0 12px",
        background: "linear-gradient(180deg, #0e4ab1 0%, #1357c0 50%, #0a3a8a 100%)",
        boxShadow:
          "inset 1px 0 0 rgba(0,0,0,0.4), inset 2px 0 0 rgba(255,255,255,0.18)",
        color: "#fff",
        fontFamily: "Tahoma, 'Segoe UI', sans-serif",
        fontSize: 11,
        textShadow: "1px 1px 1px rgba(0,0,0,0.55)",
      }}
    >
      <span style={{ fontSize: 13, opacity: 0.9 }} title="Volume">
        🔊
      </span>
      <span style={{ fontSize: 13, opacity: 0.9 }} title="Réseau">
        🖧
      </span>
      <ClockNow />
    </div>
  );
}

function ClockNow() {
  const [time, setTime] = useState<string>("--:--");
  const [hijri, setHijri] = useState<string>("");
  const [showHijri, setShowHijri] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
      try {
        const fmt = new Intl.DateTimeFormat("fr-FR-u-ca-islamic", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        setHijri(fmt.format(now).replace(/ AH| H| ap\. H\./i, ""));
      } catch {
        setHijri("");
      }
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <button
      type="button"
      onClick={() => setShowHijri((v) => !v)}
      title={
        showHijri
          ? `Calendrier hégirien — clic pour revenir au grégorien\n${time}`
          : `Calendrier grégorien — clic pour le calendrier hégirien${hijri ? `\n${hijri}` : ""}`
      }
      style={{
        background: "transparent",
        border: "none",
        color: "inherit",
        font: "inherit",
        textShadow: "inherit",
        padding: 0,
        cursor: "pointer",
        minWidth: showHijri ? 140 : 36,
        textAlign: "right",
        whiteSpace: "nowrap",
      }}
    >
      <span suppressHydrationWarning>{showHijri && hijri ? hijri : time}</span>
    </button>
  );
}
