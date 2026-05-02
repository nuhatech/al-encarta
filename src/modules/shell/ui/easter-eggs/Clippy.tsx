"use client";
import { useEffect, useMemo, useState } from "react";
import { useWindowManager } from "@/src/modules/shell/ui/window-manager/use-window-manager";
import type { AppId } from "@/src/modules/shell/ui/window-manager/types";

/**
 * Clippit (the Office Assistant paperclip), 2002 edition. Floats above the
 * desktop bottom-right, dispenses contextual tips based on the focused app
 * window, and can be dismissed permanently.
 *
 * Persisted dismissal lives in localStorage under "encarta-2001:clippy-hidden".
 */

const STORAGE_DISMISSED = "encarta-2001:clippy-hidden";
const STORAGE_TIP_INDEX = "encarta-2001:clippy-tip-index";

const HOME_TIPS = [
  "Bonjour ! On dirait que vous découvrez le bureau. Double-cliquez sur Encarta pour démarrer.",
  "Astuce : tapez la séquence ↑↑↓↓←→←→BA pour invoquer un astrolabe interactif.",
  "Vous pouvez glisser les icônes du bureau où vous voulez. Glissez-les sur la Corbeille pour les supprimer.",
  "Win+R ouvre la boîte « Exécuter ». Essayez les commandes : 1258, bayt, hormuz…",
];

const APP_TIPS: Record<AppId, ReadonlyArray<string>> = {
  encarta: [
    "Cliquez sur un personnage à gauche pour ouvrir sa fiche, puis sur « Conversation » pour lui parler !",
    "Le bouton « Frise » affiche les 27 figures sur un axe chronologique 7ᵉ–16ᵉ siècle.",
    "Le bouton 🖨 imprime la conversation au format Encarta classique.",
    "Tapez « 1258 » ou « tamerlan » dans la barre Find pour révéler des fiches cachées.",
  ],
  kutub: [
    "Bienvenue sur Kutub.io — 9000+ livres arabes classiques. Tapez un mot-clé en haut.",
    "Astuce : recherchez « Muqaddima » pour les œuvres d'Ibn Khaldoun.",
  ],
  hilalglobe: [
    "Le globe affiche la visibilité du croissant lunaire (méthode Odeh).",
    "Glissez le globe pour l'orienter. Cliquez sur une ville pour voir la prévision locale.",
  ],
  minesweeper: [
    "Démineur — Ormuz : 8 mines sur 12×10. Évitez les angles, c'est piégé.",
    "Astuce : finissez la partie pour débloquer un personnage secret dans Encarta.",
  ],
};

interface ClippyProps {
  onAbout?: () => void;
}

export function Clippy({ onAbout }: ClippyProps) {
  const wm = useWindowManager();
  const [hidden, setHidden] = useState(true); // start hidden until we hydrate
  const [tipIndex, setTipIndex] = useState(0);
  const [bubbleVisible, setBubbleVisible] = useState(true);
  const [hopping, setHopping] = useState(false);

  // Hydrate from localStorage.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = window.localStorage.getItem(STORAGE_DISMISSED) === "1";
    setHidden(dismissed);
    const ti = parseInt(window.localStorage.getItem(STORAGE_TIP_INDEX) ?? "0", 10);
    if (Number.isFinite(ti)) setTipIndex(ti);
  }, []);

  // Pick the active context: top window or "home" if none.
  const context: AppId | "home" = useMemo(() => {
    if (wm.topAppId && !wm.windows.find((w) => w.appId === wm.topAppId)?.minimized) {
      return wm.topAppId;
    }
    return "home";
  }, [wm.topAppId, wm.windows]);

  // Tip list for the current context.
  const tips: ReadonlyArray<string> = useMemo(() => {
    if (context === "home") return HOME_TIPS;
    return APP_TIPS[context] ?? HOME_TIPS;
  }, [context]);

  // Reset to first tip and trigger a hop animation when context changes.
  useEffect(() => {
    setTipIndex(0);
    setBubbleVisible(true);
    setHopping(true);
    const t = setTimeout(() => setHopping(false), 600);
    return () => clearTimeout(t);
  }, [context]);

  if (hidden) return null;

  const tip = tips[tipIndex % tips.length] ?? tips[0] ?? "";

  const nextTip = () => {
    setTipIndex((i) => {
      const next = (i + 1) % tips.length;
      try {
        window.localStorage.setItem(STORAGE_TIP_INDEX, String(next));
      } catch {
        // ignore
      }
      return next;
    });
    setHopping(true);
    setTimeout(() => setHopping(false), 400);
  };

  const dismiss = () => {
    setHidden(true);
    try {
      window.localStorage.setItem(STORAGE_DISMISSED, "1");
    } catch {
      // ignore
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: 50,
        zIndex: 4000,
        fontFamily: "Tahoma, sans-serif",
        fontSize: 11,
        userSelect: "none",
      }}
    >
      <style>{KEYFRAMES}</style>

      {bubbleVisible && (
        <div
          style={{
            background: "#ffffe1",
            border: "1px solid #000",
            boxShadow: "2px 2px 0 rgba(0,0,0,0.25)",
            padding: "8px 10px 6px",
            maxWidth: 260,
            position: "relative",
            marginBottom: 4,
            color: "#000",
            lineHeight: 1.45,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 11 }}>
            Office Assistant
          </div>
          <div>{tip}</div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 4, marginTop: 6 }}>
            <button
              onClick={nextTip}
              style={smallBtnStyle}
              title="Astuce suivante"
            >
              Astuce suivante
            </button>
            {onAbout && (
              <button onClick={onAbout} style={smallBtnStyle}>
                Aide
              </button>
            )}
            <button
              onClick={() => setBubbleVisible(false)}
              style={smallBtnStyle}
              title="Réduire (Clippit reste là)"
            >
              OK
            </button>
            <button
              onClick={dismiss}
              style={smallBtnStyle}
              title="Masquer définitivement Clippit"
            >
              Masquer
            </button>
          </div>
          {/* Speech bubble tail pointing down-right */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              right: 22,
              bottom: -10,
              width: 0,
              height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "10px solid #000",
            }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              right: 23,
              bottom: -8,
              width: 0,
              height: 0,
              borderLeft: "7px solid transparent",
              borderRight: "7px solid transparent",
              borderTop: "9px solid #ffffe1",
            }}
          />
        </div>
      )}

      <button
        onClick={() => setBubbleVisible((v) => !v)}
        title={bubbleVisible ? "Masquer la bulle" : "Cliquer pour une astuce"}
        style={{
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: "pointer",
          display: "block",
          marginLeft: "auto",
          animation: hopping
            ? "clippy-hop 0.4s ease-out 1"
            : "clippy-sway 5s ease-in-out infinite",
          transformOrigin: "50% 100%",
        }}
      >
        <PaperclipSvg />
      </button>
    </div>
  );
}

const smallBtnStyle: React.CSSProperties = {
  fontSize: 10,
  padding: "1px 6px",
  fontFamily: "inherit",
  cursor: "pointer",
  minWidth: 36,
};

function PaperclipSvg() {
  return (
    <svg
      width="76"
      height="96"
      viewBox="0 0 76 96"
      aria-label="Clippit"
      style={{ filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.4))" }}
    >
      {/* Body — two paperclip loops in metallic grey gradient */}
      <defs>
        <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5f5f5" />
          <stop offset="40%" stopColor="#cfcfcf" />
          <stop offset="60%" stopColor="#9b9b9b" />
          <stop offset="100%" stopColor="#5b5b5b" />
        </linearGradient>
      </defs>
      <path
        d="M 28 8
           C 14 8 8 18 8 32
           L 8 76
           C 8 84 14 88 22 88
           C 30 88 36 84 36 76
           L 36 28
           C 36 22 40 20 44 20
           C 48 20 52 22 52 28
           L 52 70
           C 52 74 50 76 46 76
           C 42 76 40 74 40 70
           L 40 36"
        stroke="url(#metal)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Inner highlight to read shiny */}
      <path
        d="M 28 11
           C 16 11 11 19 11 32
           L 11 76"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Eyes — round whites with black pupils, with blink animation */}
      <g style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        <ellipse cx="22" cy="38" rx="6" ry="7" fill="#fff" stroke="#000" strokeWidth="1.4">
          <animate
            attributeName="ry"
            values="7;7;0.4;7;7;7"
            keyTimes="0;0.45;0.5;0.55;1;1"
            dur="3.7s"
            repeatCount="indefinite"
          />
        </ellipse>
        <ellipse cx="40" cy="36" rx="6" ry="7" fill="#fff" stroke="#000" strokeWidth="1.4">
          <animate
            attributeName="ry"
            values="7;7;0.4;7;7;7"
            keyTimes="0;0.45;0.5;0.55;1;1"
            dur="3.7s"
            repeatCount="indefinite"
          />
        </ellipse>
        {/* Pupils */}
        <circle cx="23" cy="40" r="2.2" fill="#000" />
        <circle cx="41" cy="38" r="2.2" fill="#000" />
        {/* Eye highlights */}
        <circle cx="20.6" cy="36" r="0.9" fill="#fff" />
        <circle cx="38.6" cy="34" r="0.9" fill="#fff" />
      </g>

      {/* Subtle eyebrow strokes */}
      <path d="M 16 28 Q 22 24 28 28" stroke="#222" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M 33 26 Q 40 22 46 26" stroke="#222" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

const KEYFRAMES = `
@keyframes clippy-sway {
  0%, 100% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
}
@keyframes clippy-hop {
  0% { transform: translateY(0) rotate(-3deg); }
  35% { transform: translateY(-14px) rotate(2deg); }
  70% { transform: translateY(-3px) rotate(-1deg); }
  100% { transform: translateY(0) rotate(0deg); }
}
`;
