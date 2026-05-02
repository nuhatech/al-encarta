"use client";

/**
 * Mobile gate: at < 768px, the Encarta hero panel and sidebar layout breaks.
 * We show a Y2K-styled splash inviting the user to come back on desktop.
 *
 * Visibility is CSS-only (.mobile-only / .desktop-only in globals.css) — no
 * JS detection, no hydration mismatches.
 */
export function MobileSplash() {
  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: "Tahoma, 'Segoe UI', sans-serif",
      }}
    >
      <div
        className="window"
        style={{
          width: "100%",
          maxWidth: 400,
        }}
      >
        <div className="title-bar">
          <div className="title-bar-text">Microsoft Encarta — Information</div>
          <div className="title-bar-controls">
            <button aria-label="Minimize" />
            <button aria-label="Maximize" />
            <button aria-label="Close" />
          </div>
        </div>
        <div
          className="window-body"
          style={{
            padding: 18,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <img
            src="/encarta-2002-icon.webp"
            alt="Encarta"
            style={{
              width: 64,
              height: 64,
              filter: "drop-shadow(1px 2px 3px rgba(0,0,0,0.45))",
            }}
          />
          <h1
            style={{
              margin: 0,
              fontFamily: "Georgia, serif",
              fontSize: 18,
              color: "#000080",
              fontWeight: 700,
            }}
          >
            Configuration système requise
          </h1>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "#222" }}>
            Microsoft Encarta Reference Library 2002 nécessite un{" "}
            <strong>moniteur de bureau</strong> de résolution minimale{" "}
            <code style={{ background: "#eee", padding: "0 4px" }}>800×600</code>.
          </p>
          <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: "#444" }}>
            Veuillez consulter cette expérience sur un ordinateur — les
            CD-ROM Encarta n&apos;étaient pas conçus pour les téléphones
            portables (qui n&apos;existaient d&apos;ailleurs pas en 2002).
          </p>
          <div
            style={{
              border: "1px solid #b8b8b8",
              background: "#fffbe6",
              padding: 8,
              fontSize: 11,
              color: "#555",
              fontStyle: "italic",
            }}
          >
            💡 Astuce : sur ordinateur, vous pourrez aussi parler aux
            personnages historiques par micro (Voxtral™), et les entendre
            répondre avec une voix d&apos;époque (TTS Web Speech).
          </div>
          <div
            style={{
              fontSize: 10,
              color: "#777",
              marginTop: 4,
            }}
          >
            DefendHack 2026 · CD-ROM 1/2 · encarta.msn.com
          </div>
        </div>
      </div>
    </main>
  );
}
