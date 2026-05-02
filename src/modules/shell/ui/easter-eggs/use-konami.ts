"use client";
import { useEffect } from "react";

const KONAMI: ReadonlyArray<string> = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

/**
 * Listens globally for the Konami code (case-insensitive on B/A) and fires
 * the callback. Resets on any non-matching key.
 */
export function useKonami(onTrigger: () => void) {
  useEffect(() => {
    let progress = 0;
    const onKey = (e: KeyboardEvent) => {
      // Don't intercept while typing in inputs.
      const target = e.target as HTMLElement | null;
      if (target && /^(input|textarea|select)$/i.test(target.tagName)) return;
      const expected = KONAMI[progress];
      if (!expected) return;
      const k = e.key === " " ? " " : e.key.toLowerCase();
      const ek = expected.toLowerCase();
      if (k === ek || e.key === expected) {
        progress++;
        if (progress === KONAMI.length) {
          progress = 0;
          onTrigger();
        }
      } else {
        // Allow restart from the beginning if mismatch.
        progress = e.key === KONAMI[0] ? 1 : 0;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onTrigger]);
}
