"use client";
import type { PersistedMessage } from "@/src/modules/conversation/infrastructure/dexie-conversation-repo";

interface PrintLayoutProps {
  personalityName: string;
  messages: ReadonlyArray<PersistedMessage>;
}

export function PrintLayout({ personalityName, messages }: PrintLayoutProps) {
  const date = new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const turnCount = messages.length;

  return (
    <div
      className="print-only"
      style={{
        fontFamily: "Tahoma, 'MS Sans Serif', sans-serif",
        fontSize: 11,
        color: "#000",
        background: "#fff",
        padding: 0,
        lineHeight: 1.5,
      }}
    >
      <header
        style={{
          borderBottom: "2px solid #000",
          paddingBottom: 8,
          marginBottom: 16,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 0.3,
            }}
          >
            Microsoft<sup style={{ fontSize: 9 }}>®</sup> Encarta
          </div>
          <div style={{ fontSize: 10, color: "#444" }}>
            Reference Library 2002 — édition arabo-musulmane
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: 10 }}>
          <div>
            <strong>{personalityName}</strong>
          </div>
          <div style={{ color: "#444" }}>{date}</div>
          <div style={{ color: "#444" }}>{turnCount} message{turnCount > 1 ? "s" : ""}</div>
        </div>
      </header>

      <h1
        style={{
          fontFamily: "Georgia, serif",
          fontSize: 14,
          margin: "0 0 12px",
          color: "#000080",
        }}
      >
        Conversation interactive avec {personalityName}
      </h1>

      <main>
        {messages.length === 0 ? (
          <p style={{ fontStyle: "italic", color: "#666" }}>
            (aucun message — la conversation est vide)
          </p>
        ) : (
          messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 12, pageBreakInside: "avoid" }}>
              <div
                style={{
                  fontWeight: 700,
                  color: m.role === "user" ? "#000" : "#000080",
                  marginBottom: 2,
                }}
              >
                {m.role === "user" ? "Vous" : personalityName} :
              </div>
              <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{m.content}</p>
            </div>
          ))
        )}
      </main>

      <footer
        style={{
          marginTop: 32,
          borderTop: "1px solid #888",
          paddingTop: 6,
          fontSize: 9,
          color: "#666",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>encarta.msn.com</span>
        <span>CD-ROM 1/2</span>
        <span>© 2002 Microsoft Corporation</span>
      </footer>
    </div>
  );
}
