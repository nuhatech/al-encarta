"use client";
import { useCallback, useEffect, useState } from "react";
import type { AppId } from "@/src/modules/shell/ui/window-manager/types";

export type ShortcutId = AppId | "recyclebin";

export interface IconPos {
  readonly x: number;
  readonly y: number;
}

interface DesktopIconsState {
  positions: Record<string, IconPos>;
  deleted: ReadonlySet<ShortcutId>;
}

const STORAGE_KEY = "encarta-2001:desktop-icons";

const DEFAULT_POSITIONS: Record<ShortcutId, IconPos> = {
  encarta: { x: 16, y: 16 },
  kutub: { x: 16, y: 110 },
  hilalglobe: { x: 16, y: 204 },
  minesweeper: { x: 16, y: 298 },
  recyclebin: { x: 16, y: 410 },
};

interface PersistedState {
  positions: Record<string, IconPos>;
  deleted: ShortcutId[];
}

function load(): DesktopIconsState {
  if (typeof window === "undefined") {
    return { positions: { ...DEFAULT_POSITIONS }, deleted: new Set() };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { positions: { ...DEFAULT_POSITIONS }, deleted: new Set() };
    const parsed = JSON.parse(raw) as PersistedState;
    return {
      positions: { ...DEFAULT_POSITIONS, ...(parsed.positions ?? {}) },
      deleted: new Set(parsed.deleted ?? []),
    };
  } catch {
    return { positions: { ...DEFAULT_POSITIONS }, deleted: new Set() };
  }
}

function save(state: DesktopIconsState): void {
  if (typeof window === "undefined") return;
  try {
    const payload: PersistedState = {
      positions: state.positions,
      deleted: [...state.deleted],
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // quota or storage disabled — fail silently
  }
}

export interface DesktopIconsApi {
  readonly positions: Record<string, IconPos>;
  readonly deleted: ReadonlySet<ShortcutId>;
  readonly deletedList: ReadonlyArray<ShortcutId>;
  readonly hydrated: boolean;
  setPosition(id: ShortcutId, pos: IconPos): void;
  deleteIcon(id: ShortcutId): void;
  restoreIcon(id: ShortcutId): void;
  emptyTrash(): void;
}

export function useDesktopIcons(): DesktopIconsApi {
  // Start with defaults to avoid SSR/CSR mismatch; rehydrate from
  // localStorage on mount.
  const [state, setState] = useState<DesktopIconsState>(() => ({
    positions: { ...DEFAULT_POSITIONS },
    deleted: new Set<ShortcutId>(),
  }));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) save(state);
  }, [state, hydrated]);

  const setPosition = useCallback((id: ShortcutId, pos: IconPos) => {
    setState((s) => ({ ...s, positions: { ...s.positions, [id]: pos } }));
  }, []);

  const deleteIcon = useCallback((id: ShortcutId) => {
    if (id === "recyclebin") return; // can't delete the recycle bin itself
    setState((s) => {
      const next = new Set(s.deleted);
      next.add(id);
      return { ...s, deleted: next };
    });
  }, []);

  const restoreIcon = useCallback((id: ShortcutId) => {
    setState((s) => {
      const next = new Set(s.deleted);
      next.delete(id);
      return { ...s, deleted: next };
    });
  }, []);

  const emptyTrash = useCallback(() => {
    // For the demo, "empty trash" just keeps them deleted (no permanent
    // erasure since localStorage is the only state). Hide nothing extra.
    setState((s) => ({ ...s, deleted: new Set(s.deleted) }));
  }, []);

  return {
    positions: state.positions,
    deleted: state.deleted,
    deletedList: [...state.deleted],
    hydrated,
    setPosition,
    deleteIcon,
    restoreIcon,
    emptyTrash,
  };
}
