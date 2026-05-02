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
  nuhatech: [
    "Internet Explorer 6 charge github.com/nuhatech — pendant ce temps, le petit « e » tourne.",
    "Astuce : la barre Links en haut bascule entre Kutub, Hilal Globe et NuhaTech sans recharger.",
  ],
  minesweeper: [
    "Démineur — Ormuz : 8 mines sur 12×10. Évitez les angles, c'est piégé.",
    "Astuce : finissez la partie pour débloquer un personnage secret dans Encarta.",
  ],
  wmp: [
    "Windows Media Player 8 ! Choisissez une apparence dans l'onglet « Skin Chooser ».",
    "L'égaliseur 10 bandes en bas de « Now Playing » modifie le son en temps réel.",
    "Astuce : essayez la visualisation « Rosette polaire » pour un effet hypnotique.",
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
        <img
          src="/clippy.webp"
          alt="Clippit"
          width={86}
          height={108}
          draggable={false}
          style={{
            display: "block",
            filter: "drop-shadow(2px 2px 3px rgba(0,0,0,0.45))",
            pointerEvents: "none",
          }}
        />
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
