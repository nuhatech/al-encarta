"use client";

const UNLOCK_KEY = "encarta-2002:unlock:hormuz";

export function isHormuzUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

export function unlockHormuz(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(UNLOCK_KEY, "1");
    window.dispatchEvent(new CustomEvent("encarta:unlock", { detail: "hormuz" }));
  } catch {
    // ignore
  }
}

export function resetHormuzUnlock(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(UNLOCK_KEY);
  } catch {
    // ignore
  }
}
