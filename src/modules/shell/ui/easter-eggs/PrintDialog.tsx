"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  conversationRepo,
  type PersistedMessage,
} from "@/src/modules/conversation/infrastructure/dexie-conversation-repo";
import { PrintLayout } from "@/src/modules/conversation/ui/PrintLayout";

interface PrintDialogProps {
  personalitySlug: string;
  personalityName: string;
  onClose: () => void;
}

export function PrintDialog({
  personalitySlug,
  personalityName,
  onClose,
}: PrintDialogProps) {
  const [messages, setMessages] = useState<ReadonlyArray<PersistedMessage>>([]);
  const [progress, setProgress] = useState(0);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void conversationRepo.listForPersonality(personalitySlug).then((m) => {
      if (!cancelled) setMessages(m);
    });
    return () => {
      cancelled = true;
    };
  }, [personalitySlug]);

  const handlePrint = () => {
    if (messages.length === 0 || printing) return;
    setPrinting(true);
    const start = performance.now();
    const total = 2400; // 2.4s of fake printer warmup
    const tick = () => {
      const elapsed = performance.now() - start;
      const pct = Math.min(100, (elapsed / total) * 100);
      setProgress(pct);
      if (pct < 100) {
        requestAnimationFrame(tick);
      } else {
        // Tiny delay so the bar visually hits 100% before the print dialog steals focus.
        setTimeout(() => {
          window.print();
          onClose();
        }, 250);
      }
    };
    requestAnimationFrame(tick);
  };

  const portalTarget = typeof document !== "undefined" ? document.body : null;

  return (
    <>
      <div onClick={printing ? undefined : onClose} style={overlayStyle}>
        <div
          className="window"
          onClick={(e) => e.stopPropagation()}
          style={{ width: 460 }}
        >
          <div className="title-bar">
            <div className="title-bar-text">🖨 Imprimer</div>
            <div className="title-bar-controls">
              <button
                aria-label="Close"
                onClick={onClose}
                disabled={printing}
              />
            </div>
          </div>
          <div
            className="window-body"
            style={{ padding: 14, fontFamily: "Tahoma, sans-serif", fontSize: 12 }}
          >
            <fieldset style={{ marginBottom: 10, padding: "6px 10px" }}>
              <legend>Imprimante</legend>
              <table style={{ borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={cellLabel}>Nom :</td>
                    <td style={cellValue}>
                      <strong>HP DeskJet 5500 Series (LPT1)</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style={cellLabel}>État :</td>
                    <td style={cellValue}>Prête</td>
                  </tr>
                  <tr>
                    <td style={cellLabel}>Type :</td>
                    <td style={cellValue}>Inkjet color · 4800 × 1200 dpi</td>
                  </tr>
                  <tr>
                    <td style={cellLabel}>Emplacement :</td>
                    <td style={cellValue}>Bureau local</td>
                  </tr>
                </tbody>
              </table>
            </fieldset>

            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <fieldset style={{ flex: 1, padding: "6px 10px" }}>
                <legend>Étendue</legend>
                <label style={radioRow}>
                  <input type="radio" defaultChecked readOnly />
                  Tout
                </label>
                <label style={{ ...radioRow, color: "#888" }}>
                  <input type="radio" disabled />
                  Pages : 1 à 1
                </label>
                <label style={{ ...radioRow, color: "#888" }}>
                  <input type="radio" disabled />
                  Sélection
                </label>
              </fieldset>
              <fieldset style={{ flex: 1, padding: "6px 10px" }}>
                <legend>Copies</legend>
                <div style={{ marginTop: 4 }}>
                  Nombre : <strong>1</strong>
                </div>
                <div style={{ marginTop: 4, color: "#888" }}>☐ Assemblées</div>
              </fieldset>
            </div>

            {messages.length === 0 && (
              <div
                role="alert"
                style={{
                  background: "#fff3cd",
                  border: "1px solid #d4a800",
                  padding: "6px 10px",
                  fontSize: 11,
                  marginBottom: 10,
                }}
              >
                ⚠ Aucun message dans la conversation. Démarre un échange avec{" "}
                {personalityName} avant d&apos;imprimer.
              </div>
            )}

            {printing && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, marginBottom: 4 }}>
                  Impression en cours… {Math.floor(progress)}%
                </div>
                <div
                  style={{
                    height: 16,
                    border: "1px inset #ccc",
                    background: "#fff",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${progress}%`,
                      background:
                        "linear-gradient(180deg, #5dadec 0%, #316ac5 50%, #1f4ea0 100%)",
                      transition: "width 60ms linear",
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
              <button
                onClick={handlePrint}
                disabled={messages.length === 0 || printing}
                style={{ minWidth: 80 }}
              >
                Imprimer
              </button>
              <button
                onClick={onClose}
                disabled={printing}
                style={{ minWidth: 80 }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Portal print layout to <body> so @media print rules can target it
          without competing with the modal & windows DOM. */}
      {portalTarget &&
        createPortal(
          <PrintLayout personalityName={personalityName} messages={messages} />,
          portalTarget,
        )}
    </>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 5500,
};

const cellLabel: React.CSSProperties = {
  padding: "1px 8px 1px 0",
  color: "#444",
  whiteSpace: "nowrap",
};

const cellValue: React.CSSProperties = {
  padding: "1px 0",
};

const radioRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  marginTop: 2,
};
