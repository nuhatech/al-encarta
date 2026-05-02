"use client";
import { useEffect, useRef, useState } from "react";
import { useWindowManager } from "./window-manager/use-window-manager";
import { APP_REGISTRY, type AppId } from "./window-manager/types";
import { DesktopContextMenu } from "./easter-eggs/DesktopContextMenu";
import { StartMenu } from "./easter-eggs/StartMenu";
import { RecycleBinDialog } from "./easter-eggs/RecycleBinDialog";
import {
  useDesktopIcons,
  type ShortcutId,
  type IconPos,
} from "./use-desktop-icons";

interface DesktopProps {
  onTripleClickWallpaper?: () => void;
  onAbout?: () => void;
  onRun?: () => void;
  onShutdown?: () => void;
}

interface ShortcutDef {
  readonly id: ShortcutId;
  readonly label: string;
  readonly icon: string;
  readonly fallbackEmoji?: string;
  readonly shortcut: boolean;
  readonly isApp: boolean;
}

const SHORTCUTS: ReadonlyArray<ShortcutDef> = [
  { id: "encarta", label: "Encarta 2002", icon: "/encarta-2002-icon.webp", shortcut: true, isApp: true },
  { id: "kutub", label: "Kutub", icon: "/kutub-logo.png", shortcut: true, isApp: true },
  { id: "hilalglobe", label: "Hilal Globe", icon: "/hilal-logo.png", shortcut: true, isApp: true },
  { id: "minesweeper", label: "Démineur — Ormuz", icon: "/minesweeper.png", fallbackEmoji: "💣", shortcut: true, isApp: true },
  { id: "recyclebin", label: "Corbeille", icon: "/bin-icon.webp", fallbackEmoji: "🗑", shortcut: false, isApp: false },
];

const SHORTCUT_BY_ID: Record<string, ShortcutDef> = Object.fromEntries(
  SHORTCUTS.map((s) => [s.id, s]),
);

/**
 * XP-style desktop. Icons are draggable and persist their positions to
 * localStorage; dropping any app icon onto the Corbeille (Recycle Bin)
 * "deletes" it, which the bin's dialog can restore.
 *
 * Easter eggs:
 *  - right-click on wallpaper → Properties → onAbout
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
  const [recycleOpen, setRecycleOpen] = useState(false);
  const clickTimes = useRef<number[]>([]);
  const icons = useDesktopIcons();

  const onWallpaperClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("input") ||
      target.closest("[data-start-menu]") ||
      target.closest(".window") ||
      target.closest("[data-icon]")
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
        paddingBottom: 30, // taskbar
      }}
    >
      {SHORTCUTS.map((s) => {
        if (icons.deleted.has(s.id)) return null;
        const pos = icons.positions[s.id] ?? { x: 16, y: 16 };
        return (
          <DesktopIcon
            key={s.id}
            shortcut={s}
            position={pos}
            onCommitPosition={(p) => icons.setPosition(s.id, p)}
            onOpenBin={() => setRecycleOpen(true)}
            onDropOnBin={() => icons.deleteIcon(s.id)}
          />
        );
      })}

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

      {recycleOpen && (
        <RecycleBinDialog
          deleted={icons.deletedList}
          resolveLabel={(id) => SHORTCUT_BY_ID[id]?.label ?? id}
          resolveIcon={(id) =>
            SHORTCUT_BY_ID[id]?.icon ||
            // fallback for icons without raster (recyclebin shouldn't be in this list)
            "/encarta-2002-icon.webp"
          }
          onRestore={(id) => icons.restoreIcon(id)}
          onEmpty={() => icons.emptyTrash()}
          onClose={() => setRecycleOpen(false)}
        />
      )}
    </div>
  );
}

interface DesktopIconProps {
  shortcut: ShortcutDef;
  position: IconPos;
  onCommitPosition: (pos: IconPos) => void;
  onOpenBin: () => void;
  onDropOnBin: () => void;
}

function DesktopIcon({
  shortcut,
  position,
  onCommitPosition,
  onOpenBin,
  onDropOnBin,
}: DesktopIconProps) {
  const wm = useWindowManager();
  const [selected, setSelected] = useState(false);
  const [iconError, setIconError] = useState(false);
  const [dragPos, setDragPos] = useState<IconPos | null>(null);
  const dragState = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);

  const isBin = shortcut.id === "recyclebin";

  // Click anywhere outside to deselect.
  useEffect(() => {
    if (!selected) return;
    const off = () => setSelected(false);
    const t = setTimeout(
      () => window.addEventListener("pointerdown", off, { once: true }),
      0,
    );
    return () => {
      clearTimeout(t);
      window.removeEventListener("pointerdown", off);
    };
  }, [selected]);

  const handleDoubleClick = () => {
    if (isBin) {
      onOpenBin();
      return;
    }
    if (shortcut.isApp) {
      wm.open(shortcut.id as AppId);
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    // Only left button; ignore right-click drags.
    if (e.button !== 0) return;
    setSelected(true);
    dragState.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: position.x,
      originY: position.y,
      moved: false,
    };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const ds = dragState.current;
    if (!ds || ds.pointerId !== e.pointerId) return;
    const dx = e.clientX - ds.startX;
    const dy = e.clientY - ds.startY;
    if (!ds.moved && Math.hypot(dx, dy) < 4) return; // dead zone
    ds.moved = true;
    setDragPos({
      x: clamp(ds.originX + dx, 0, window.innerWidth - 100),
      y: clamp(ds.originY + dy, 0, window.innerHeight - 110),
    });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const ds = dragState.current;
    if (!ds || ds.pointerId !== e.pointerId) return;
    dragState.current = null;
    (e.target as Element).releasePointerCapture?.(e.pointerId);

    if (!ds.moved) {
      // No drag — treat as click selection (already done in pointerdown).
      setDragPos(null);
      return;
    }

    // Detect drop target via geometry: is the cursor over a recycle bin icon?
    const droppedOnBin = !isBin && isCursorOverRecycleBin(e.clientX, e.clientY);

    if (droppedOnBin) {
      onDropOnBin();
      setDragPos(null);
      return;
    }

    if (dragPos) {
      onCommitPosition(dragPos);
      setDragPos(null);
    }
  };

  const display = dragPos ?? position;
  const isDragging = dragPos !== null;

  return (
    <button
      type="button"
      data-icon={shortcut.id}
      data-recyclebin={isBin ? "true" : undefined}
      onDoubleClick={handleDoubleClick}
      onClick={(e) => {
        e.stopPropagation();
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      title={
        isBin
          ? `Corbeille — double-clic pour l'ouvrir, glissez d'autres icônes dessus pour les supprimer`
          : `Double-cliquer pour ouvrir ${shortcut.label}`
      }
      style={{
        position: "absolute",
        left: display.x,
        top: display.y,
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
        cursor: isDragging ? "grabbing" : "pointer",
        fontFamily: "Tahoma, sans-serif",
        opacity: isDragging ? 0.65 : 1,
        zIndex: isDragging ? 1500 : 1,
        touchAction: "none",
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
        {(iconError || !shortcut.icon) && shortcut.fallbackEmoji ? (
          <span
            aria-hidden
            style={{
              fontSize: 36,
              filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.55))",
            }}
          >
            {shortcut.fallbackEmoji}
          </span>
        ) : (
          <img
            src={shortcut.icon}
            alt={shortcut.label}
            onError={() => setIconError(true)}
            draggable={false}
            style={{
              width: 48,
              height: 48,
              objectFit: "contain",
              filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.55))",
              pointerEvents: "none",
            }}
          />
        )}
        {shortcut.shortcut && <ShortcutArrow />}
      </div>
      <span style={{ lineHeight: 1.2, textAlign: "center", pointerEvents: "none" }}>
        {shortcut.label}
      </span>
    </button>
  );
}

function isCursorOverRecycleBin(x: number, y: number): boolean {
  // Geometric overlap check (the dragged icon itself is geometrically on top
  // of the bin during drag, so document.elementFromPoint would just return
  // the dragged icon — useless. We compute the bin's rect directly).
  const binEl = document.querySelector(
    "[data-recyclebin='true']",
  ) as HTMLElement | null;
  if (!binEl) return false;
  const r = binEl.getBoundingClientRect();
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
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
