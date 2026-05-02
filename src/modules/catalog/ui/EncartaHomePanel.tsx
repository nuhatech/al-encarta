"use client";

interface EncartaHomePanelProps {
  onPickArticle: () => void;
  onPickChat: () => void;
  onPickTimeline: () => void;
}

/**
 * Microsoft Encarta Reference Library 2002 — home hero panel.
 *
 * Layout matches the iconic 2002 default screen: glossy blue gradient on the
 * left with the big "Reference Library 2002" title, "What's Inside" subnav
 * in the middle, and "Encarta News" feed on the right.
 */
export function EncartaHomePanel({ onPickArticle, onPickChat, onPickTimeline }: EncartaHomePanelProps) {
  const today = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long" });

  return (
    <div
      style={{
        height: "100%",
        background:
          "radial-gradient(circle at 80% 20%, #5b9adb 0%, #2569b3 35%, #103e7a 80%, #08254a 100%)",
        color: "#fff",
        fontFamily: "'Segoe UI', Tahoma, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <DecorativeShine />

      <div
        style={{
          position: "relative",
          height: "100%",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 0.95fr)",
          gap: 0,
        }}
      >
        <LeftHero
          onPickArticle={onPickArticle}
          onPickChat={onPickChat}
          onPickTimeline={onPickTimeline}
        />
        <RightNews date={today} />
      </div>
    </div>
  );
}

function DecorativeShine() {
  return (
    <>
      {/* Soft diagonal glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 35%, transparent 65%, rgba(0,0,0,0.25) 100%)",
          pointerEvents: "none",
        }}
      />
      {/* Subtle grid lines, evocative of MS print materials */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 80px)",
          pointerEvents: "none",
        }}
      />
    </>
  );
}

function LeftHero({
  onPickArticle,
  onPickChat,
  onPickTimeline,
}: {
  onPickArticle: () => void;
  onPickChat: () => void;
  onPickTimeline: () => void;
}) {
  return (
    <div
      style={{
        padding: "32px 24px 24px 32px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Real Encarta logo, top-right corner. White frosted pill so the
          black wordmark reads against the dark blue gradient. */}
      <img
        src="/encarta-2002-logo.png"
        alt="Microsoft Encarta"
        style={{
          position: "absolute",
          top: 18,
          right: 18,
          height: 56,
          width: "auto",
          background: "rgba(255,255,255,0.92)",
          padding: "6px 12px",
          borderRadius: 4,
          boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
          zIndex: 2,
        }}
      />

      <h1
        style={{
          margin: "44px 0 0",
          fontFamily: "'Segoe UI Light', 'Segoe UI', Tahoma, sans-serif",
          fontWeight: 300,
          fontSize: 60,
          lineHeight: 0.95,
          letterSpacing: -1,
          color: "#fff",
          textShadow: "0 1px 0 rgba(0,0,0,0.35)",
        }}
      >
        Reference
        <br />
        Library 2002
      </h1>

      <div
        style={{
          marginTop: 28,
          fontSize: 12,
          color: "rgba(255,255,255,0.85)",
          maxWidth: 320,
          lineHeight: 1.5,
        }}
      >
        Pionniers de la Civilisation arabo-musulmane — édition spéciale 2002.
        Six personnages historiques disponibles à la consultation interactive,
        avec assistance vocale Voxtral™.
      </div>

      <WhatsInside
        onPickArticle={onPickArticle}
        onPickChat={onPickChat}
        onPickTimeline={onPickTimeline}
      />

      <div style={{ flex: 1 }} />

      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
        encarta.msn.com · CD-ROM 1 sur 2
      </div>
    </div>
  );
}

function WhatsInside({
  onPickArticle,
  onPickChat,
  onPickTimeline,
}: {
  onPickArticle: () => void;
  onPickChat: () => void;
  onPickTimeline: () => void;
}) {
  const items: Array<{ label: string; onClick?: () => void; muted?: boolean }> = [
    { label: "Articles", onClick: onPickArticle },
    { label: "Conversations", onClick: onPickChat },
    { label: "Cartes", muted: true },
    { label: "Multimédia", muted: true },
    { label: "En ligne", muted: true },
    { label: "Recherche", muted: true },
    { label: "Statistiques", muted: true },
    { label: "Chronologie", onClick: onPickTimeline },
    { label: "Visites guidées", muted: true },
  ];

  return (
    <div style={{ marginTop: 36 }}>
      <div
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.7)",
          marginBottom: 4,
          letterSpacing: 0.3,
        }}
      >
        Au sommaire
      </div>
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          textAlign: "right",
          maxWidth: 360,
        }}
      >
        {items.map((it) => (
          <li key={it.label} style={{ margin: 0 }}>
            <button
              type="button"
              onClick={it.onClick}
              disabled={it.muted}
              style={{
                background: "transparent",
                border: "none",
                color: it.muted ? "rgba(255,255,255,0.45)" : "#ffd24a",
                fontFamily: "inherit",
                fontSize: 22,
                fontWeight: 300,
                cursor: it.muted ? "not-allowed" : "pointer",
                padding: "2px 0",
                textShadow: it.muted ? "none" : "0 0 8px rgba(255,210,74,0.4)",
                width: "100%",
                textAlign: "right",
              }}
              onMouseEnter={(e) => {
                if (!it.muted) e.currentTarget.style.color = "#ffea84";
              }}
              onMouseLeave={(e) => {
                if (!it.muted) e.currentTarget.style.color = "#ffd24a";
              }}
            >
              {it.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface NewsItem {
  icon: string;
  title: string;
  body: string;
}

function RightNews({ date }: { date: string }) {
  const items: ReadonlyArray<NewsItem> = [
    {
      icon: "📚",
      title: "Découverte du jour",
      body: "Ibn al-Haytham démontre que la lumière entre dans l'œil — pas l'inverse.",
    },
    {
      icon: "🌐",
      title: "Encarta en ligne",
      body: "Synchronisation automatique avec encarta.msn.com (modem 56k recommandé).",
    },
    {
      icon: "🌍",
      title: "Voyage avec Ibn Battuta",
      body: "120 000 km en 30 ans — explore son itinéraire dans l'Atlas dynamique.",
    },
    {
      icon: "🎙️",
      title: "Nouveau : Voxtral™",
      body: "Posez vos questions à voix haute. Reconnaissance vocale française intégrée.",
    },
    {
      icon: "⌛",
      title: "Frise chronologique",
      body: "Du 9ème au 14ème siècle — la transmission des savoirs en un coup d'œil.",
    },
  ];

  return (
    <div
      style={{
        padding: "40px 32px 24px",
        borderLeft: "1px solid rgba(255,255,255,0.12)",
        position: "relative",
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 300,
          color: "#fff",
          letterSpacing: 0.5,
        }}
      >
        Encarta News
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
        {date} · Latest <em>Encarta News</em> headlines
      </div>

      <ul style={{ listStyle: "none", margin: "20px 0 0", padding: 0 }}>
        {items.map((n, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              gap: 12,
              padding: "10px 0",
              borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              aria-hidden
              style={{
                width: 32,
                height: 32,
                fontSize: 18,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {n.icon}
            </div>
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#ffd24a",
                  marginBottom: 2,
                }}
              >
                {n.title}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", lineHeight: 1.4 }}>
                {n.body}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
