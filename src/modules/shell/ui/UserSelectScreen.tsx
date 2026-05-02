"use client";
import { useEffect, useState } from "react";
import { play } from "@/src/shared/infra/audio/sounds";

interface UserSelectScreenProps {
  onUserSelected: () => void;
}

interface UserAccount {
  readonly username: string;
  readonly icon: string;
  readonly subtitle?: string;
}

const USERS: ReadonlyArray<UserAccount> = [
  {
    username: "Administrator",
    icon: "/user-icons/Chess_Pieces.png",
    subtitle: "Compte administrateur",
  },
  {
    username: "NuhaTech",
    icon: "/user-icons/Rubber_Ducky.png",
    subtitle: "Curieux du 21ème siècle",
  },
  {
    username: "Encarta",
    icon: "/user-icons/Ball_(Windows_XP).png",
  },
  {
    username: "Invité",
    icon: "/user-icons/Beach_Chairs.png",
  },
];

// Authentic XP welcome screen colors (cf. lucasgmelo/xp reference).
const COLOR_BLUE_DARK = "#084DA3";
const COLOR_BLUE_MID = "#508FD9";
const COLOR_BLUE_LIGHT = "#9CC0E9";
const COLOR_ORANGE_LINE = "#FF9933";
const COLOR_YELLOW_BORDER = "#FFCC00";
const COLOR_POWER_RED = "#E55022";
const COLOR_POWER_RED_DARK = "#AA2300";

/**
 * Iconic Windows XP "Welcome" / user select screen.
 * Authentic styling: dark blue header & footer with thin gradient accent
 * lines, radial blue main, 445px-wide gradient tiles with yellow-bordered
 * avatars. Click any tile → boot continues to the desktop.
 */
export function UserSelectScreen({ onUserSelected }: UserSelectScreenProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  // Pre-highlight NuhaTech briefly to draw the eye there.
  useEffect(() => {
    setHovered("NuhaTech");
    const t = setTimeout(() => setHovered(null), 1400);
    return () => clearTimeout(t);
  }, []);

  const select = () => {
    play("click");
    onUserSelected();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Source Sans Pro', 'Segoe UI', Tahoma, sans-serif",
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      <Header />

      <main
        style={{
          flex: 1,
          background: `radial-gradient(35% 50% at 18% 30%, ${COLOR_BLUE_LIGHT} 0%, ${COLOR_BLUE_MID} 100%)`,
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          padding: "0 60px",
        }}
      >
        <LeftPanel />
        <Divider />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 4,
            paddingLeft: 42,
          }}
        >
          {USERS.map((u) => (
            <UserTile
              key={u.username}
              user={u}
              hovered={hovered === u.username}
              onHover={(in_) => setHovered(in_ ? u.username : null)}
              onClick={select}
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header
      style={{
        minHeight: 112,
        background: COLOR_BLUE_DARK,
        position: "relative",
        flexShrink: 0,
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 7,
          background: `linear-gradient(270deg, ${COLOR_BLUE_DARK} -33.4%, ${COLOR_BLUE_DARK} 6%, #fff 50%, ${COLOR_BLUE_DARK} 83%, ${COLOR_BLUE_DARK} 121%)`,
        }}
      />
    </header>
  );
}

function Footer() {
  return (
    <footer
      style={{
        minHeight: 92,
        background: COLOR_BLUE_DARK,
        position: "relative",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 50px",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 7,
          background: `linear-gradient(270deg, ${COLOR_BLUE_DARK} -33.4%, ${COLOR_BLUE_DARK} 6%, ${COLOR_ORANGE_LINE} 50%, ${COLOR_BLUE_DARK} 83%, ${COLOR_BLUE_DARK} 121%)`,
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 18, paddingTop: 14 }}>
        <button
          type="button"
          aria-label="Arrêter l'ordinateur"
          style={{
            width: 40,
            height: 40,
            background: COLOR_POWER_RED,
            border: "1px solid #fff",
            borderRadius: 4,
            outline: "none",
            cursor: "pointer",
            boxShadow: `inset 4px 2px 8px rgba(255,255,255,0.6), inset -2px -3px 5px ${COLOR_POWER_RED_DARK}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 20,
          }}
        >
          ⏻
        </button>
        <span style={{ color: "#fff", fontSize: 16, fontWeight: 400 }}>
          Arrêter l&apos;ordinateur
        </span>
      </div>
      <div
        style={{
          color: "#fff",
          fontSize: 13,
          textAlign: "right",
          letterSpacing: 0.4,
          paddingTop: 14,
          opacity: 0.95,
        }}
      >
        <div>Après avoir ouvert une session, vous pouvez ajouter ou modifier des comptes.</div>
        <div>Allez dans le Panneau de configuration et cliquez sur Comptes d&apos;utilisateurs.</div>
      </div>
    </footer>
  );
}

function LeftPanel() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        position: "relative",
        top: -40,
      }}
    >
      <img
        src="/windows-xp-logo.png"
        alt="Microsoft Windows XP"
        style={{
          width: 220,
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
        }}
      />
      <h1
        style={{
          color: "#fff",
          fontWeight: 500,
          fontSize: 22,
          marginTop: 30,
          marginRight: 40,
          letterSpacing: 0.2,
          textShadow: "1px 1px 1px rgba(0,0,0,0.35)",
        }}
      >
        To begin, click your user name
      </h1>
    </div>
  );
}

function Divider() {
  return (
    <div
      aria-hidden
      style={{
        width: 2,
        height: "80%",
        margin: "0 42px",
        background: `linear-gradient(180deg, ${COLOR_BLUE_MID} 0%, #fff 47%, ${COLOR_BLUE_MID} 99%)`,
      }}
    />
  );
}

interface UserTileProps {
  user: UserAccount;
  hovered: boolean;
  onHover: (inside: boolean) => void;
  onClick: () => void;
}

function UserTile({ user, hovered, onHover, onClick }: UserTileProps) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      style={{
        width: 445,
        minHeight: 112,
        padding: "15px 20px",
        background: hovered
          ? `linear-gradient(90deg, ${COLOR_BLUE_DARK} 0%, ${COLOR_BLUE_MID} 100%)`
          : "transparent",
        border: "none",
        borderRadius: "4px 0 0 4px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 20,
        textAlign: "left",
        color: "#fff",
        textShadow: "1px 1px 1px rgba(0,0,0,0.35)",
        transition: "background 100ms ease-out",
      }}
    >
      <div
        style={{
          width: 81,
          height: 81,
          flexShrink: 0,
          border: `2px solid ${COLOR_YELLOW_BORDER}`,
          borderRadius: 4,
          overflow: "hidden",
          background: "#fff",
          boxShadow: hovered
            ? "0 0 0 1px rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.5)"
            : "0 1px 3px rgba(0,0,0,0.3)",
          transition: "box-shadow 100ms ease-out",
        }}
      >
        <img
          src={user.icon}
          alt={user.username}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
      <div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 400,
            lineHeight: 1.1,
            color: "#fff",
          }}
        >
          {user.username}
        </div>
        {user.subtitle && (
          <div
            style={{
              fontFamily: "Verdana, sans-serif",
              fontSize: 12,
              marginTop: 8,
              color: "#fff",
              opacity: 0.9,
            }}
          >
            {user.subtitle}
          </div>
        )}
      </div>
    </button>
  );
}
