"use client";
import { createContext, useCallback, useContext, useState } from "react";
import { APP_REGISTRY, type AppId, type ManagedWindow } from "./types";

interface WindowManagerState {
  /** Open windows in z-order (last = top). Closed apps are absent. */
  windows: ReadonlyArray<ManagedWindow>;
}

export interface WindowManagerApi {
  windows: ReadonlyArray<ManagedWindow>;
  isOpen: (appId: AppId) => boolean;
  topAppId: AppId | null;
  open: (appId: AppId) => void;
  close: (appId: AppId) => void;
  minimize: (appId: AppId) => void;
  restore: (appId: AppId) => void;
  focus: (appId: AppId) => void;
  move: (appId: AppId, x: number, y: number) => void;
  toggleMinimize: (appId: AppId) => void;
}

function defaultPosition(index: number, w: number, h: number): { x: number; y: number } {
  // Cascade windows: each subsequent open is offset 30px down-right.
  const baseX = Math.max(20, Math.floor(window.innerWidth / 2 - w / 2));
  const baseY = Math.max(20, Math.floor(window.innerHeight / 2 - h / 2 - 40));
  const offset = index * 28;
  return { x: baseX + offset, y: baseY + offset };
}

export function useWindowManagerState(): WindowManagerApi {
  const [state, setState] = useState<WindowManagerState>({ windows: [] });

  const isOpen = useCallback(
    (appId: AppId) => state.windows.some((w) => w.appId === appId),
    [state.windows],
  );

  const topAppId =
    state.windows.length > 0 && !state.windows[state.windows.length - 1]!.minimized
      ? state.windows[state.windows.length - 1]!.appId
      : null;

  const focus = useCallback((appId: AppId) => {
    setState((prev) => {
      const idx = prev.windows.findIndex((w) => w.appId === appId);
      if (idx === -1) return prev;
      const win = prev.windows[idx]!;
      const others = prev.windows.filter((_, i) => i !== idx);
      return { windows: [...others, { ...win, minimized: false }] };
    });
  }, []);

  const open = useCallback((appId: AppId) => {
    setState((prev) => {
      const existing = prev.windows.find((w) => w.appId === appId);
      if (existing) {
        // Already open — focus + restore
        const others = prev.windows.filter((w) => w.appId !== appId);
        return { windows: [...others, { ...existing, minimized: false }] };
      }
      const meta = APP_REGISTRY[appId];
      const w = Math.min(meta.defaultW, window.innerWidth - 40);
      const h = Math.min(meta.defaultH, window.innerHeight - 80);
      const pos = defaultPosition(prev.windows.length, w, h);
      return {
        windows: [
          ...prev.windows,
          { appId, x: pos.x, y: pos.y, w, h, minimized: false },
        ],
      };
    });
  }, []);

  const close = useCallback((appId: AppId) => {
    setState((prev) => ({
      windows: prev.windows.filter((w) => w.appId !== appId),
    }));
  }, []);

  const minimize = useCallback((appId: AppId) => {
    setState((prev) => ({
      windows: prev.windows.map((w) =>
        w.appId === appId ? { ...w, minimized: true } : w,
      ),
    }));
  }, []);

  const restore = useCallback(
    (appId: AppId) => {
      focus(appId);
    },
    [focus],
  );

  const toggleMinimize = useCallback((appId: AppId) => {
    setState((prev) => {
      const idx = prev.windows.findIndex((w) => w.appId === appId);
      if (idx === -1) return prev;
      const win = prev.windows[idx]!;
      if (win.minimized) {
        // Restore + focus
        const others = prev.windows.filter((_, i) => i !== idx);
        return { windows: [...others, { ...win, minimized: false }] };
      }
      // Minimize: if this is the top window, just minimize
      return {
        windows: prev.windows.map((w, i) =>
          i === idx ? { ...w, minimized: true } : w,
        ),
      };
    });
  }, []);

  const move = useCallback((appId: AppId, x: number, y: number) => {
    setState((prev) => ({
      windows: prev.windows.map((w) =>
        w.appId === appId ? { ...w, x, y } : w,
      ),
    }));
  }, []);

  return {
    windows: state.windows,
    isOpen,
    topAppId,
    open,
    close,
    minimize,
    restore,
    focus,
    move,
    toggleMinimize,
  };
}

const Ctx = createContext<WindowManagerApi | null>(null);

export const WindowManagerProvider = Ctx.Provider;

export function useWindowManager(): WindowManagerApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWindowManager outside provider");
  return ctx;
}
