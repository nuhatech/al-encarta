"use client";
import { useEffect, useRef } from "react";

interface DesktopContextMenuProps {
  x: number;
  y: number;
  onAbout: () => void;
  onClose: () => void;
}

interface MenuItem {
  label: string;
  icon?: string;
  disabled?: boolean;
  onClick?: () => void;
  separator?: boolean;
  arrow?: boolean;
}

export function DesktopContextMenu({ x, y, onAbout, onClose }: DesktopContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    setTimeout(() => {
      window.addEventListener("mousedown", onDoc);
      window.addEventListener("keydown", onKey);
    }, 0);
    return () => {
      window.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const items: MenuItem[] = [
    { label: "Affichage", arrow: true, disabled: true },
    { label: "Trier les icônes par", arrow: true, disabled: true },
    { label: "Actualiser", onClick: () => onClose() },
    { separator: true, label: "" },
    { label: "Coller", disabled: true },
    { label: "Coller le raccourci", disabled: true },
    { separator: true, label: "" },
    { label: "Nouveau", arrow: true, disabled: true },
    { separator: true, label: "" },
    { label: "Propriétés", icon: "🖥", onClick: onAbout },
  ];

  // Clamp to viewport so the menu doesn't overflow.
  const W = 240;
  const H = 280;
  const px = Math.min(window.innerWidth - W - 4, x);
  const py = Math.min(window.innerHeight - H - 4, y);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        left: px,
        top: py,
        width: W,
        background: "var(--y2k-window)",
        border: "1px solid #404040",
        boxShadow: "2px 2px 6px rgba(0, 0, 0, 0.35)",
        fontFamily: "Tahoma, sans-serif",
        fontSize: 11,
        padding: 2,
        zIndex: 6000,
      }}
    >
      {items.map((item, i) =>
        item.separator ? (
          <hr
            key={i}
            style={{
              border: "none",
              borderTop: "1px solid #888",
              borderBottom: "1px solid #fff",
              margin: "3px 4px",
            }}
          />
        ) : (
          <button
            key={i}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              if (item.disabled) return;
              item.onClick?.();
              if (!item.arrow) onClose();
            }}
            disabled={item.disabled}
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              padding: "4px 8px 4px 24px",
              border: "none",
              background: "transparent",
              color: item.disabled ? "#999" : "#000",
              fontFamily: "inherit",
              fontSize: "inherit",
              textAlign: "left",
              cursor: item.disabled ? "default" : "pointer",
              gap: 6,
              position: "relative",
            }}
            onMouseEnter={(e) => {
              if (!item.disabled) {
                e.currentTarget.style.background = "#316ac5";
                e.currentTarget.style.color = "#fff";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = item.disabled ? "#999" : "#000";
            }}
          >
            {item.icon && (
              <span style={{ position: "absolute", left: 6, fontSize: 12 }}>
                {item.icon}
              </span>
            )}
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.arrow && <span aria-hidden>▸</span>}
          </button>
        ),
      )}
    </div>
  );
}
