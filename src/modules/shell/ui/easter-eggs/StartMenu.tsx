"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useWindowManager } from "../window-manager/use-window-manager";
import { APP_REGISTRY, type AppId } from "../window-manager/types";

interface StartMenuProps {
  onClose: () => void;
  onRun: () => void;
  onAbout: () => void;
  onShutdown: () => void;
}

/**
 * Authentic Windows XP Start menu.
 *
 *  ┌─────────────────────────────────────┐
 *  │ 👤 Curieux du 21ème siècle          │  ← user bar (gradient blue)
 *  ├──────────────────┬──────────────────┤
 *  │ Pinned apps      │ System shortcuts │
 *  │ (white bg)       │ (lighter blue bg)│
 *  │                  │                  │
 *  │ All Programs ▸   │                  │
 *  ├──────────────────┴──────────────────┤
 *  │ 🚪 Log Off    🔴 Turn Off Computer  │  ← bottom bar
 *  └─────────────────────────────────────┘
 */
export function StartMenu({
  onClose,
  onRun,
  onAbout,
  onShutdown,
}: StartMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const wm = useWindowManager();

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!ref.current?.contains(t) && !t.closest("[data-start-button]")) {
        onClose();
      }
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

  const launch = (appId: AppId) => {
    wm.open(appId);
    onClose();
  };

  return (
    <div
      ref={ref}
      data-start-menu
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        left: 0,
        bottom: 30,
        width: 380,
        background: "#fff",
        border: "1px solid #0846b1",
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        overflow: "hidden",
        boxShadow: "2px -3px 12px rgba(0,0,0,0.45)",
        fontFamily: "Tahoma, 'Segoe UI', sans-serif",
        fontSize: 11,
        zIndex: 9000,
      }}
    >
      <UserBar />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        <LeftColumn launch={launch} onAbout={onAbout} />
        <RightColumn onRun={onRun} onAbout={onAbout} />
      </div>
      <BottomBar onShutdown={onShutdown} onLogOff={onClose} />
    </div>
  );
}

function UserBar() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        background:
          "linear-gradient(180deg, #5b91d1 0%, #2d6cd0 50%, #1f56b6 100%)",
        color: "#fff",
        borderBottom: "2px solid #f6a821",
        textShadow: "1px 1px 1px rgba(0,0,0,0.5)",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          background: "#fff",
          border: "2px solid #f6a821",
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <img
          src="/encarta-2002-icon.webp"
          alt=""
          aria-hidden
          style={{ width: 32, height: 32, objectFit: "contain" }}
        />
      </div>
      <div style={{ fontSize: 14, fontWeight: 700 }}>
        Curieux du 21<sup>ème</sup> siècle
      </div>
    </div>
  );
}

interface MenuItem {
  icon: string | ReactNode;
  label: string;
  sublabel?: string;
  bold?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  arrow?: boolean;
  separator?: boolean;
  size?: "lg" | "sm";
}

function LeftColumn({
  launch,
  onAbout,
}: {
  launch: (appId: AppId) => void;
  onAbout: () => void;
}) {
  const items: MenuItem[] = [
    {
      icon: <img src={APP_REGISTRY.encarta.icon} alt="" style={iconImg} />,
      label: "Encarta",
      sublabel: "Microsoft Encarta 2002",
      bold: true,
      size: "lg",
      onClick: () => launch("encarta"),
    },
    {
      icon: <img src="/kutub-logo.png" alt="" style={iconImg} />,
      label: "Kutub",
      sublabel: "Bibliothèque arabe classique",
      bold: true,
      size: "lg",
      onClick: () => launch("kutub"),
    },
    { icon: "", label: "", separator: true },
    {
      icon: <img src="/hilal-logo.png" alt="" style={iconImg} />,
      label: "Hilal Globe",
      onClick: () => launch("hilalglobe"),
    },
    {
      icon: <img src="/github-icon.svg" alt="" style={iconImg} />,
      label: "NuhaTech",
      onClick: () => launch("nuhatech"),
    },
    {
      icon: <img src={APP_REGISTRY.minesweeper.icon} alt="" style={iconImg} />,
      label: "Démineur — Ormuz",
      onClick: () => launch("minesweeper"),
    },
    {
      icon: <img src={APP_REGISTRY.wmp.icon} alt="" style={iconImg} />,
      label: "Windows Media Player",
      onClick: () => launch("wmp"),
    },
    { icon: "📝", label: "Notepad", disabled: true },
    {
      icon: "🎓",
      label: "Tour Windows XP",
      onClick: onAbout,
    },
  ];

  return (
    <div style={{ background: "#fff", padding: "8px 0" }}>
      {items.map((it, i) =>
        it.separator ? (
          <hr key={i} style={separatorStyle} />
        ) : (
          <Item key={i} item={it} variant="left" />
        ),
      )}
      <hr style={separatorStyle} />
      <Item
        item={{
          icon: "📂",
          label: "All Programs",
          arrow: true,
          disabled: true,
          bold: true,
        }}
        variant="left"
      />
    </div>
  );
}

function RightColumn({
  onRun,
  onAbout,
}: {
  onRun: () => void;
  onAbout: () => void;
}) {
  const items: MenuItem[] = [
    { icon: "📁", label: "Mes documents", disabled: true },
    { icon: "📄", label: "Mes documents récents", arrow: true, disabled: true },
    { icon: "🖼", label: "Mes images", disabled: true },
    { icon: "🎵", label: "Ma musique", disabled: true },
    { icon: "💻", label: "Poste de travail", onClick: onAbout },
    { icon: "", label: "", separator: true },
    { icon: "⚙️", label: "Panneau de configuration", disabled: true },
    { icon: "🖨", label: "Imprimantes et télécopieurs", disabled: true },
    { icon: "", label: "", separator: true },
    { icon: "❓", label: "Aide et support", disabled: true },
    { icon: "🔍", label: "Rechercher", disabled: true },
    { icon: "📂", label: "Exécuter…", onClick: onRun },
  ];

  return (
    <div
      style={{
        background:
          "linear-gradient(180deg, #d6e4fc 0%, #c1d6f7 100%)",
        padding: "8px 0",
      }}
    >
      {items.map((it, i) =>
        it.separator ? (
          <hr key={i} style={separatorStyle} />
        ) : (
          <Item key={i} item={it} variant="right" />
        ),
      )}
    </div>
  );
}

function BottomBar({
  onLogOff,
  onShutdown,
}: {
  onLogOff: () => void;
  onShutdown: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 16,
        padding: "8px 12px",
        background:
          "linear-gradient(180deg, #5b91d1 0%, #2d6cd0 60%, #1f56b6 100%)",
        color: "#fff",
        borderTop: "2px solid #f6a821",
        textShadow: "1px 1px 1px rgba(0,0,0,0.5)",
      }}
    >
      <BottomBtn icon="🚪" label="Fermer la session" onClick={onLogOff} />
      <BottomBtn icon="🔴" label="Arrêter…" onClick={onShutdown} />
    </div>
  );
}

function BottomBtn({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "transparent",
        border: "none",
        color: "#fff",
        fontFamily: "inherit",
        fontSize: 11,
        cursor: "pointer",
        padding: "2px 4px",
        textShadow: "inherit",
      }}
    >
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function Item({ item, variant }: { item: MenuItem; variant: "left" | "right" }) {
  const isLg = item.size === "lg";
  return (
    <button
      onClick={item.disabled ? undefined : item.onClick}
      disabled={item.disabled}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: isLg ? "6px 14px" : "4px 14px",
        border: "none",
        background: "transparent",
        color: item.disabled ? "#888" : "#000",
        fontFamily: "inherit",
        fontSize: 11,
        textAlign: "left",
        cursor: item.disabled ? "default" : "pointer",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (item.disabled) return;
        e.currentTarget.style.background =
          variant === "left" ? "#316ac5" : "#3a78d8";
        e.currentTarget.style.color = "#fff";
        // Override icon img filters for white-on-blue
        const imgs = e.currentTarget.querySelectorAll("img");
        imgs.forEach((img) => {
          (img as HTMLElement).style.filter = "brightness(1.1)";
        });
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = item.disabled ? "#888" : "#000";
        const imgs = e.currentTarget.querySelectorAll("img");
        imgs.forEach((img) => {
          (img as HTMLElement).style.filter = "";
        });
      }}
    >
      <span
        aria-hidden
        style={{
          width: isLg ? 32 : 22,
          height: isLg ? 32 : 22,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: isLg ? 22 : 14,
          flexShrink: 0,
        }}
      >
        {item.icon}
      </span>
      <span style={{ flex: 1, lineHeight: 1.3 }}>
        <span style={{ fontWeight: item.bold ? 700 : 400, fontSize: isLg ? 12 : 11 }}>
          {item.label}
        </span>
        {item.sublabel && (
          <>
            <br />
            <span style={{ fontSize: 10, color: "#666" }}>{item.sublabel}</span>
          </>
        )}
      </span>
      {item.arrow && <span aria-hidden>▸</span>}
    </button>
  );
}

const iconImg: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
};

const separatorStyle: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid #c5c5c5",
  margin: "4px 8px",
};
