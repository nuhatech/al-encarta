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

export function WindowFrame({ win, zIndex, children, titleOverride }: WindowFrameProps) {
  const wm = useWindowManager();
  const meta = APP_REGISTRY[win.appId];
  const dragging = useRef<{ originX: number; originY: number; startX: number; startY: number } | null>(null);
  const [position, setPosition] = useState({ x: win.x, y: win.y });

  // Sync external moves (e.g. from focus/snap actions) back into local state.
  useEffect(() => {
    setPosition({ x: win.x, y: win.y });
  }, [win.x, win.y]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only the title bar background is draggable, not its buttons.
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

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const d = dragging.current;
      if (!d) return;
      const dx = e.clientX - d.originX;
      const dy = e.clientY - d.originY;
      // Clamp to viewport with a small margin so the title bar is always reachable.
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 60;
      const x = Math.min(maxX, Math.max(-(win.w - 80), d.startX + dx));
      const y = Math.min(maxY, Math.max(0, d.startY + dy));
      setPosition({ x, y });
    }
    function onUp() {
      const d = dragging.current;
      if (!d) return;
      dragging.current = null;
      // Commit final position to the manager.
      wm.move(win.appId, position.x, position.y);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [position.x, position.y, wm, win.appId, win.w]);

  // Only focus when the click reaches a non-top window — otherwise every
  // button click in the active window would trigger a state churn that
  // re-renders the WindowsLayer mid-click and can swallow underlying onClick.
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
        width: win.w,
        height: win.h,
        zIndex,
        display: "flex",
        flexDirection: "column",
        boxShadow: "2px 4px 16px rgba(0,0,0,0.35)",
      }}
    >
      <div
        className="title-bar"
        onMouseDown={onMouseDown}
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
              // Hackathon: toggle maximize = snap to viewport size
              const isMax =
                win.x === 10 &&
                win.y === 10 &&
                win.w >= window.innerWidth - 30 &&
                win.h >= window.innerHeight - 70;
              if (isMax) {
                wm.move(win.appId, position.x, position.y); // no-op
              } else {
                wm.move(win.appId, 10, 10);
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
    </div>
  );
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
