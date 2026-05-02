"use client";

interface AboutDialogProps {
  onClose: () => void;
}

export function AboutDialog({ onClose }: AboutDialogProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 5000,
      }}
    >
      <div
        className="window"
        onClick={(e) => e.stopPropagation()}
        style={{ width: 460 }}
      >
        <div className="title-bar">
          <div className="title-bar-text">À propos de Microsoft Windows</div>
          <div className="title-bar-controls">
            <button aria-label="Close" onClick={onClose} />
          </div>
        </div>
        <div
          className="window-body"
          style={{
            padding: 18,
            fontFamily: "Tahoma, sans-serif",
            fontSize: 12,
            display: "flex",
            gap: 16,
          }}
        >
          <img
            src="/windows-logo.png"
            alt="Windows"
            style={{
              width: 64,
              height: 64,
              flexShrink: 0,
              filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.3))",
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
              Microsoft<sup style={{ fontSize: 9 }}>®</sup> Windows
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#000080", marginBottom: 8 }}>
              Édition Encarta DefendHack 2026
            </div>
            <hr style={{ border: "none", borderTop: "1px solid #888", margin: "8px 0" }} />
            <dl style={{ margin: 0, fontSize: 11, lineHeight: 1.7 }}>
              <Fact label="Système" value="Microsoft Windows XP — Édition Encarta 2026" />
              <Fact label="Build" value="1.0.0 · DefendHack" />
              <Fact label="Processeur" value="Claude Sonnet 4.6 + Voxtral Mini Transcribe" />
              <Fact
                label="Mémoire"
                value="27 personnages · 4 applications · 1 mer infinie"
              />
              <Fact label="Cache" value="Anthropic ephemeral (90% économie)" />
              <Fact label="Hébergement" value="Cloudflare Pages — edge runtime" />
            </dl>
            <hr style={{ border: "none", borderTop: "1px solid #888", margin: "8px 0" }} />
            <p style={{ margin: 0, fontSize: 11, color: "#444" }}>
              Made with ❤ par <strong>NuhaTech</strong> pour le hackathon
              DefendHack 2026 (thème : « Site année 2000 »).
            </p>
            <p style={{ margin: "6px 0 0", fontSize: 11, color: "#444" }}>
              Architecture : Next.js 16 · DDD/VSA · TypeScript strict · xp.css
            </p>
            <div style={{ marginTop: 14, textAlign: "right" }}>
              <button onClick={onClose} style={{ minWidth: 80 }}>
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt style={{ fontWeight: 700, display: "inline" }}>{label} :</dt>
      <dd style={{ display: "inline", margin: "0 0 0 4px" }}>{value}</dd>
      <br />
    </>
  );
}
