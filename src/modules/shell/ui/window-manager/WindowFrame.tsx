"use client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useWindowManager } from "./use-window-manager";
import type { AppId, ManagedWindow } from "./types";
import { APP_REGISTRY } from "./types";

interface WindowFrameProps {
  win: ManagedWindow;
  zIndex: number;
  children: ReactNode;
  /** Optional override of the title bar text */
  titleOverride?: string;
}

type ResizeEdge = "n" | "s" | "e" | "w" | "nw" | "ne" | "sw" | "se";

const MIN_W = 320;
const MIN_H = 200;
const HANDLE_THICK = 6;

export function WindowFrame({ win, zIndex, children, titleOverride }: WindowFrameProps) {
  const wm = useWindowManager();
  const meta = APP_REGISTRY[win.appId];
  const dragging = useRef<{ originX: number; originY: number; startX: number; startY: number } | null>(null);
  const resizing = useRef<{
    edge: ResizeEdge;
    originX: number;
    originY: number;
    startW: number;
    startH: number;
    startX: number;
    startY: number;
  } | null>(null);
  const [position, setPosition] = useState({ x: win.x, y: win.y });
  const [size, setSize] = useState({ w: win.w, h: win.h });

  // Sync external moves/resizes back into local state.
  useEffect(() => {
    setPosition({ x: win.x, y: win.y });
  }, [win.x, win.y]);
  useEffect(() => {
    setSize({ w: win.w, h: win.h });
  }, [win.w, win.h]);

  const onTitleBarMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      e.preventDefault();
      dragging.current = {
        originX: e.clientX,
        originY: e.clientY,
        startX: position.x,
        startY: position.y,
      };
      wm.focus(win.appId);
    },
    [position.x, position.y, wm, win.appId],
  );

  const onResizeMouseDown = useCallback(
    (edge: ResizeEdge) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      resizing.current = {
        edge,
        originX: e.clientX,
        originY: e.clientY,
        startW: size.w,
        startH: size.h,
        startX: position.x,
        startY: position.y,
      };
      wm.focus(win.appId);
    },
    [size.w, size.h, position.x, position.y, wm, win.appId],
  );

  // Global pointer listeners — attached once, branch on whichever drag is active.
  useEffect(() => {
    function onMove(e: MouseEvent) {
      const drag = dragging.current;
      if (drag) {
        const dx = e.clientX - drag.originX;
        const dy = e.clientY - drag.originY;
        const maxX = window.innerWidth - 80;
        const maxY = window.innerHeight - 60;
        const x = Math.min(maxX, Math.max(-(size.w - 80), drag.startX + dx));
        const y = Math.min(maxY, Math.max(0, drag.startY + dy));
        setPosition({ x, y });
        return;
      }
      const r = resizing.current;
      if (r) {
        const dx = e.clientX - r.originX;
        const dy = e.clientY - r.originY;
        let newW = r.startW;
        let newH = r.startH;
        let newX = r.startX;
        let newY = r.startY;
        if (r.edge.includes("e")) {
          newW = Math.max(MIN_W, r.startW + dx);
        }
        if (r.edge.includes("w")) {
          newW = Math.max(MIN_W, r.startW - dx);
          newX = r.startX + (r.startW - newW);
        }
        if (r.edge.includes("s")) {
          newH = Math.max(MIN_H, r.startH + dy);
        }
        if (r.edge.includes("n")) {
          newH = Math.max(MIN_H, r.startH - dy);
          newY = r.startY + (r.startH - newH);
        }
        setSize({ w: newW, h: newH });
        setPosition({ x: newX, y: newY });
      }
    }
    function onUp() {
      if (dragging.current) {
        dragging.current = null;
        wm.move(win.appId, position.x, position.y);
      }
      if (resizing.current) {
        resizing.current = null;
        wm.move(win.appId, position.x, position.y);
        wm.resize(win.appId, size.w, size.h);
      }
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [position.x, position.y, size.w, size.h, wm, win.appId]);

  const focusIfNeeded = useCallback(() => {
    if (wm.topAppId !== win.appId) wm.focus(win.appId);
  }, [wm, win.appId]);

  if (win.minimized) return null;

  return (
    <div
      className="window"
      onMouseDown={focusIfNeeded}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        width: size.w,
        height: size.h,
        zIndex,
        display: "flex",
        flexDirection: "column",
        boxShadow: "2px 4px 16px rgba(0,0,0,0.35)",
      }}
    >
      <div
        className="title-bar"
        onMouseDown={onTitleBarMouseDown}
        onDoubleClick={() => wm.toggleMinimize(win.appId)}
        style={{ cursor: "grab", userSelect: "none" }}
      >
        <div className="title-bar-text" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <img
            src={meta.icon}
            alt=""
            aria-hidden
            style={{ width: 16, height: 16, objectFit: "contain" }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <span>{titleOverride ?? meta.title}</span>
        </div>
        <div className="title-bar-controls">
          <button
            aria-label="Minimize"
            onClick={(e) => {
              e.stopPropagation();
              wm.minimize(win.appId);
            }}
          />
          <button
            aria-label="Maximize"
            onClick={(e) => {
              e.stopPropagation();
              const targetW = window.innerWidth - 20;
              const targetH = window.innerHeight - 50;
              const isMax =
                position.x === 10 &&
                position.y === 10 &&
                size.w >= targetW - 5 &&
                size.h >= targetH - 5;
              if (isMax) {
                // Restore to default size, centered
                wm.resize(win.appId, meta.defaultW, meta.defaultH);
                wm.move(
                  win.appId,
                  Math.max(20, Math.floor((window.innerWidth - meta.defaultW) / 2)),
                  Math.max(20, Math.floor((window.innerHeight - meta.defaultH) / 2 - 30)),
                );
              } else {
                wm.move(win.appId, 10, 10);
                wm.resize(win.appId, targetW, targetH);
              }
            }}
          />
          <button
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation();
              wm.close(win.appId);
            }}
          />
        </div>
      </div>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          padding: meta.bare ? 0 : undefined,
        }}
      >
        {children}
      </div>

      {/* Resize handles — 4 edges + 4 corners. Corners overlap edges so
          they take precedence on cursor change. */}
      <ResizeHandle edge="n" onMouseDown={onResizeMouseDown("n")} />
      <ResizeHandle edge="s" onMouseDown={onResizeMouseDown("s")} />
      <ResizeHandle edge="e" onMouseDown={onResizeMouseDown("e")} />
      <ResizeHandle edge="w" onMouseDown={onResizeMouseDown("w")} />
      <ResizeHandle edge="nw" onMouseDown={onResizeMouseDown("nw")} />
      <ResizeHandle edge="ne" onMouseDown={onResizeMouseDown("ne")} />
      <ResizeHandle edge="sw" onMouseDown={onResizeMouseDown("sw")} />
      <ResizeHandle edge="se" onMouseDown={onResizeMouseDown("se")} />
    </div>
  );
}

function ResizeHandle({
  edge,
  onMouseDown,
}: {
  edge: ResizeEdge;
  onMouseDown: (e: React.MouseEvent) => void;
}) {
  const cursor =
    edge === "n" || edge === "s"
      ? "ns-resize"
      : edge === "e" || edge === "w"
        ? "ew-resize"
        : edge === "nw" || edge === "se"
          ? "nwse-resize"
          : "nesw-resize";

  const cornerSize = 14;
  let style: React.CSSProperties = {
    position: "absolute",
    background: "transparent",
    cursor,
    zIndex: 1,
  };
  switch (edge) {
    case "n":
      style = { ...style, top: -HANDLE_THICK / 2, left: cornerSize, right: cornerSize, height: HANDLE_THICK };
      break;
    case "s":
      style = { ...style, bottom: -HANDLE_THICK / 2, left: cornerSize, right: cornerSize, height: HANDLE_THICK };
      break;
    case "e":
      style = { ...style, top: cornerSize, bottom: cornerSize, right: -HANDLE_THICK / 2, width: HANDLE_THICK };
      break;
    case "w":
      style = { ...style, top: cornerSize, bottom: cornerSize, left: -HANDLE_THICK / 2, width: HANDLE_THICK };
      break;
    case "nw":
      style = { ...style, top: -HANDLE_THICK / 2, left: -HANDLE_THICK / 2, width: cornerSize, height: cornerSize };
      break;
    case "ne":
      style = { ...style, top: -HANDLE_THICK / 2, right: -HANDLE_THICK / 2, width: cornerSize, height: cornerSize };
      break;
    case "sw":
      style = { ...style, bottom: -HANDLE_THICK / 2, left: -HANDLE_THICK / 2, width: cornerSize, height: cornerSize };
      break;
    case "se":
      style = { ...style, bottom: -HANDLE_THICK / 2, right: -HANDLE_THICK / 2, width: cornerSize, height: cornerSize };
      break;
  }
  return <div onMouseDown={onMouseDown} style={style} aria-hidden />;
}

interface WindowsLayerProps {
  /** Maps appId → React node to render inside the frame. */
  renderers: Partial<Record<AppId, ReactNode>>;
}

/**
 * Renders all currently-open (non-minimized) windows in z-order.
 * Closed or minimized windows are absent.
 */
export function WindowsLayer({ renderers }: WindowsLayerProps) {
  const { windows } = useWindowManager();
  const baseZ = 1000;
  return (
    <>
      {windows.map((w, i) => {
        const node = renderers[w.appId];
        if (!node) return null;
        return (
          <WindowFrame key={w.appId} win={w} zIndex={baseZ + i}>
            {node}
          </WindowFrame>
        );
      })}
    </>
  );
}
