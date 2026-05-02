"use client";
import { useEffect } from "react";

interface XpSplashProps {
  onDone: () => void;
  durationMs?: number;
}

/**
 * Iconic Windows XP boot splash: black background, "Microsoft Windows XP"
 * wordmark, glowing horizontal logo strip, and the 4-block sliding progress
 * indicator that 2000s laptops showed for 20-30 seconds before login.
 *
 * We keep it short (~5s) so the demo doesn't drag.
 */
export function XpSplash({ onDone, durationMs = 5000 }: XpSplashProps) {
  useEffect(() => {
    const t = setTimeout(onDone, durationMs);
    return () => clearTimeout(t);
  }, [onDone, durationMs]);

  return (
    <div
      onClick={onDone}
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        cursor: "pointer",
        fontFamily: '"Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif',
        zIndex: 9999,
      }}
      title="Cliquer pour passer"
    >
      <img
        src="/windows-logo.png"
        alt="Windows logo"
        style={{
          width: 130,
          height: "auto",
          filter: "drop-shadow(0 4px 12px rgba(255,255,255,0.15))",
        }}
      />
      <div
        style={{
          fontSize: 38,
          fontWeight: 400,
          letterSpacing: 0.5,
          color: "#fff",
        }}
      >
        Microsoft<sup style={{ fontSize: 16, marginLeft: 2 }}>®</sup>
      </div>
      <div
        style={{
          fontSize: 70,
          fontWeight: 300,
          letterSpacing: 1,
          color: "#fff",
          marginTop: -28,
          fontStyle: "italic",
        }}
      >
        Windows<sup style={{ fontSize: 22, marginLeft: 4 }}>xp</sup>
      </div>

      <ProgressStrip />

      <div
        style={{
          marginTop: 36,
          fontSize: 11,
          color: "#888",
          letterSpacing: 1,
        }}
      >
        Copyright © Microsoft Corporation
      </div>
    </div>
  );
}

function ProgressStrip() {
  return (
    <div
      role="progressbar"
      aria-label="Démarrage en cours"
      style={{
        marginTop: 28,
        width: 220,
        height: 18,
        border: "1px solid #2a2a2a",
        background: "#000",
        borderRadius: 2,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, transparent 0%, transparent 30%, #4a90e2 40%, #87c2ff 50%, #4a90e2 60%, transparent 70%, transparent 100%)",
          animation: "xp-strip 1.2s linear infinite",
          backgroundSize: "200% 100%",
        }}
      />
      <style>{`
        @keyframes xp-strip {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
