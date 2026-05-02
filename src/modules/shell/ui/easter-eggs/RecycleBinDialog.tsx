"use client";
import { useEffect, useRef } from "react";
import type { ShortcutId } from "@/src/modules/shell/ui/use-desktop-icons";

interface RecycleBinDialogProps {
  deleted: ReadonlyArray<ShortcutId>;
  resolveLabel: (id: ShortcutId) => string;
  resolveIcon: (id: ShortcutId) => string;
  onRestore: (id: ShortcutId) => void;
  onEmpty: () => void;
  onClose: () => void;
}

export function RecycleBinDialog({
  deleted,
  resolveLabel,
  resolveIcon,
  onRestore,
  onEmpty,
  onClose,
}: RecycleBinDialogProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 5500,
      }}
    >
      <div
        ref={ref}
        className="window"
        onClick={(e) => e.stopPropagation()}
        style={{ width: 480 }}
      >
        <div className="title-bar">
          <div className="title-bar-text">🗑 Corbeille</div>
          <div className="title-bar-controls">
            <button aria-label="Close" onClick={onClose} />
          </div>
        </div>
        <div
          className="window-body"
          style={{
            padding: 14,
            fontFamily: "Tahoma, sans-serif",
            fontSize: 12,
          }}
        >
          {deleted.length === 0 ? (
            <div
              style={{
                padding: "24px 12px",
                textAlign: "center",
                color: "#666",
                fontStyle: "italic",
              }}
            >
              La Corbeille est vide.
              <div style={{ fontSize: 11, marginTop: 6, color: "#888" }}>
                Glissez une icône du bureau sur la Corbeille pour la supprimer.
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 11, marginBottom: 8, color: "#444" }}>
                {deleted.length} élément{deleted.length > 1 ? "s" : ""} supprimé
                {deleted.length > 1 ? "s" : ""}
              </div>
              <div
                style={{
                  border: "1px inset #ccc",
                  background: "#fff",
                  maxHeight: 280,
                  overflowY: "auto",
                }}
              >
                {deleted.map((id, i) => (
                  <div
                    key={id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "6px 10px",
                      borderBottom:
                        i < deleted.length - 1 ? "1px solid #eee" : "none",
                    }}
                  >
                    <img
                      src={resolveIcon(id)}
                      alt=""
                      style={{ width: 24, height: 24, objectFit: "contain" }}
                    />
                    <span style={{ flex: 1 }}>{resolveLabel(id)}</span>
                    <button
                      onClick={() => onRestore(id)}
                      style={{ minWidth: 80 }}
                    >
                      Restaurer
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 6,
              marginTop: 14,
            }}
          >
            <button
              onClick={onEmpty}
              disabled={deleted.length === 0}
              style={{ minWidth: 110 }}
            >
              Vider la Corbeille
            </button>
            <button onClick={onClose} style={{ minWidth: 80 }}>
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
