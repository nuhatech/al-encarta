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

/**
 * Iconic Windows XP "Welcome" / user select screen.
 * Click any avatar tile → boot continues to desktop.
 */
export function UserSelectScreen({ onUserSelected }: UserSelectScreenProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  // Pre-select the NuhaTech user briefly to draw the eye there.
  useEffect(() => {
    setHovered("NuhaTech");
    const t = setTimeout(() => setHovered(null), 1400);
    return () => clearTimeout(t);
  }, []);

  const select = (u: UserAccount) => {
    play("click");
    onUserSelected();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background:
          "linear-gradient(180deg, #5b8ad0 0%, #3a6cba 50%, #234a96 100%)",
        color: "#fff",
        fontFamily: "Tahoma, 'Segoe UI', sans-serif",
        display: "flex",
        flexDirection: "column",
        zIndex: 9999,
      }}
    >
      {/* Top horizontal divider with the welcome strip */}
      <div
        style={{
          height: 90,
          background:
            "linear-gradient(180deg, #2a59ad 0%, #214f9c 35%, #f7c34d 36%, #d99a16 38%, #c8800a 100%)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.25), 0 -1px 0 rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          padding: "0 36px",
          position: "relative",
        }}
      >
        <div
          style={{
            fontFamily: "'Trebuchet MS', 'Segoe UI', Tahoma, sans-serif",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 28,
            color: "#fff",
            textShadow: "1px 1px 1px rgba(0,0,0,0.5)",
          }}
        >
          Welcome
        </div>
      </div>

      {/* Main split */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1px 1fr",
          padding: "40px 60px",
          gap: 0,
          alignItems: "center",
        }}
      >
        {/* Left side: logo + instruction */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", paddingRight: 60 }}>
          <img
            src="/windows-xp-logo.png"
            alt="Microsoft Windows XP"
            style={{
              width: 200,
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
              marginBottom: 18,
            }}
          />
          <div
            style={{
              fontSize: 16,
              color: "#fff",
              textShadow: "1px 1px 1px rgba(0,0,0,0.4)",
              textAlign: "right",
              maxWidth: 280,
            }}
          >
            To begin, click your user name
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.7)",
              marginTop: 10,
              textAlign: "right",
              maxWidth: 280,
            }}
          >
            (clic n&apos;importe quel utilisateur — la session est commune)
          </div>
        </div>

        {/* Vertical divider */}
        <div
          aria-hidden
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.4) 20%, rgba(255,255,255,0.4) 80%, transparent 100%)",
            width: 1,
            height: "70%",
            justifySelf: "center",
            alignSelf: "center",
          }}
        />

        {/* Right side: user list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingLeft: 60 }}>
          {USERS.map((u) => (
            <UserTile
              key={u.username}
              user={u}
              hovered={hovered === u.username}
              onHover={(in_) => setHovered(in_ ? u.username : null)}
              onClick={() => select(u)}
            />
          ))}
        </div>
      </div>

      {/* Bottom strip with help links + power button */}
      <div
        style={{
          height: 56,
          background:
            "linear-gradient(180deg, #c8800a 0%, #d99a16 2%, #f7c34d 4%, #214f9c 5%, #2a59ad 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 36px",
          fontSize: 11,
          color: "#fff",
          textShadow: "1px 1px 1px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 35% 30%, #ffe9a8 0%, #f6b923 35%, #a06a04 100%)",
              boxShadow: "inset 1px 1px 2px rgba(255,255,255,0.6), 0 1px 2px rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 16,
              color: "#7a4d00",
            }}
          >
            ⏻
          </span>
          <span>Arrêter l&apos;ordinateur</span>
        </div>
        <div style={{ opacity: 0.75 }}>
          Après avoir ouvert une session, vous pouvez la fermer ou la verrouiller.
        </div>
      </div>
    </div>
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
        background: "transparent",
        border: "none",
        padding: "6px 10px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 14,
        color: "#fff",
        textShadow: "1px 1px 1px rgba(0,0,0,0.5)",
        textAlign: "left",
        borderRadius: 4,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          background: "#fff",
          padding: 2,
          border: hovered ? "2px solid #fff" : "2px solid rgba(255,255,255,0.55)",
          boxShadow: hovered
            ? "0 0 0 3px rgba(255,255,255,0.3), 0 2px 6px rgba(0,0,0,0.35)"
            : "0 1px 3px rgba(0,0,0,0.35)",
          transition: "all 120ms ease-out",
          flexShrink: 0,
        }}
      >
        <img
          src={user.icon}
          alt={user.username}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>
      <div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 400,
            color: hovered ? "#ffea7d" : "#fff",
            transition: "color 120ms ease-out",
          }}
        >
          {user.username}
        </div>
        {user.subtitle && (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>
            {user.subtitle}
          </div>
        )}
      </div>
    </button>
  );
}
