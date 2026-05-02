"use client";
import { useReducer, useCallback } from "react";

export type BootPhase =
  | "bios" // CRT/BIOS boot text
  | "xp-splash" // Windows XP startup splash
  | "installer" // Encarta CD-ROM installation
  | "desktop"; // Y2K desktop with WindowManager — apps open as floating windows

interface BootState {
  phase: BootPhase;
}

type Action =
  | { type: "BIOS_DONE" }
  | { type: "XP_SPLASH_DONE" }
  | { type: "INSTALL_DONE" }
  | { type: "SKIP_TO_DESKTOP" };

function reducer(state: BootState, action: Action): BootState {
  switch (action.type) {
    case "BIOS_DONE":
      return state.phase === "bios" ? { phase: "xp-splash" } : state;
    case "XP_SPLASH_DONE":
      return state.phase === "xp-splash" ? { phase: "installer" } : state;
    case "INSTALL_DONE":
      return state.phase === "installer" ? { phase: "desktop" } : state;
    case "SKIP_TO_DESKTOP":
      return { phase: "desktop" };
    default:
      return state;
  }
}

export function useBootSequence(initial: BootPhase = "bios") {
  const [state, dispatch] = useReducer(reducer, { phase: initial });

  return {
    phase: state.phase,
    biosDone: useCallback(() => dispatch({ type: "BIOS_DONE" }), []),
    xpSplashDone: useCallback(() => dispatch({ type: "XP_SPLASH_DONE" }), []),
    installDone: useCallback(() => dispatch({ type: "INSTALL_DONE" }), []),
    skipToDesktop: useCallback(() => dispatch({ type: "SKIP_TO_DESKTOP" }), []),
  };
}
