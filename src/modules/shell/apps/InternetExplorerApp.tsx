"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { NuhaTechProfile } from "./ie/NuhaTechProfile";

interface InternetExplorerAppProps {
  /** URL the IE window should load on first open. */
  startUrl: string;
  /** Optional fallback rendered when the target site refuses iframing
   *  (e.g. github.com sets X-Frame-Options: DENY). When omitted the
   *  generic "page cannot be displayed" placeholder is used, except for
   *  github.com/nuhatech which auto-renders our custom profile page. */
  fallback?: React.ReactNode;
}

interface Bookmark {
  readonly label: string;
  readonly url: string;
  readonly icon?: string;
}

const FAVORITES: ReadonlyArray<Bookmark> = [
  { label: "Kutub.io", url: "https://kutub.io", icon: "/kutub-logo.png" },
  { label: "Hilal Globe", url: "https://hilalglobe.com", icon: "/hilal-logo.png" },
  { label: "NuhaTech", url: "https://github.com/nuhatech", icon: "/github-icon.svg" },
];

const FRAME_BLOCKED_HOSTS = new Set([
  "github.com",
  "www.github.com",
  "twitter.com",
  "x.com",
  "facebook.com",
  "www.facebook.com",
  "linkedin.com",
  "www.linkedin.com",
]);

function isFrameBlocked(url: string): boolean {
  try {
    const u = new URL(url);
    return FRAME_BLOCKED_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}

function isNuhaTechProfileUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (!FRAME_BLOCKED_HOSTS.has(u.hostname)) return false;
    return /^\/nuhatech\/?$/i.test(u.pathname);
  } catch {
    return false;
  }
}

/**
 * Authentic Internet Explorer 6 chrome — menu bar, toolbar with Back/Forward
 * history, animated `e` globe, address bar, Links/Favorites bar, and a
 * status bar with a fake progress trickle. The content area iframes the
 * current URL; for sites that block framing (GitHub, etc.) we render a
 * graceful "Cannot display the webpage" fallback.
 */
export function InternetExplorerApp({ startUrl, fallback }: InternetExplorerAppProps) {
  const [history, setHistory] = useState<string[]>([startUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [addressInput, setAddressInput] = useState(startUrl);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentUrl = history[historyIndex] ?? startUrl;
  const blocked = isFrameBlocked(currentUrl);

  // Sync the address input with the actual URL (e.g. after back/forward).
  useEffect(() => {
    setAddressInput(currentUrl);
  }, [currentUrl]);

  // Fake loading progress (~1.5s trickle to 100%, like 56k modem).
  useEffect(() => {
    setIsLoading(true);
    setProgress(0);
    const start = performance.now();
    let raf: number;
    const tick = () => {
      const elapsed = performance.now() - start;
      const pct = Math.min(100, (elapsed / 1500) * 100);
      setProgress(pct);
      if (pct >= 100) {
        setIsLoading(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [currentUrl]);

  const navigate = useCallback(
    (url: string) => {
      const trimmed = url.trim();
      if (!trimmed) return;
      const finalUrl = /^https?:\/\//.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;
      setHistory((h) => [...h.slice(0, historyIndex + 1), finalUrl]);
      setHistoryIndex((i) => i + 1);
    },
    [historyIndex],
  );

  const back = useCallback(() => {
    setHistoryIndex((i) => Math.max(0, i - 1));
  }, []);

  const forward = useCallback(() => {
    setHistoryIndex((i) => Math.min(history.length - 1, i + 1));
  }, [history.length]);

  const refresh = useCallback(() => {
    if (iframeRef.current) iframeRef.current.src = currentUrl;
    setIsLoading(true);
    setProgress(0);
  }, [currentUrl]);

  const stop = useCallback(() => {
    setIsLoading(false);
    setProgress(100);
  }, []);

  const goHome = useCallback(() => {
    navigate(startUrl);
  }, [navigate, startUrl]);

  const submit = useCallback(() => {
    navigate(addressInput);
  }, [navigate, addressInput]);

  const canBack = historyIndex > 0;
  const canForward = historyIndex < history.length - 1;

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#ece9d8",
        fontFamily: "Tahoma, sans-serif",
        fontSize: 11,
        overflow: "hidden",
      }}
    >
      <MenuBar />
      <Toolbar
        onBack={back}
        onForward={forward}
        onStop={stop}
        onRefresh={refresh}
        onHome={goHome}
        canBack={canBack}
        canForward={canForward}
        isLoading={isLoading}
      />
      <AddressBar
        value={addressInput}
        onChange={setAddressInput}
        onSubmit={submit}
        isLoading={isLoading}
      />
      <LinksBar onNavigate={navigate} />

      <div
        style={{
          flex: 1,
          minHeight: 0,
          background: "#fff",
          position: "relative",
          borderTop: "1px solid #bfbfbf",
        }}
      >
        {blocked ? (
          fallback ??
          (isNuhaTechProfileUrl(currentUrl) ? (
            <NuhaTechProfile />
          ) : (
            <FrameBlockedFallback url={currentUrl} />
          ))
        ) : (
          <iframe
            ref={iframeRef}
            src={currentUrl}
            title={`Internet Explorer — ${currentUrl}`}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              display: "block",
            }}
          />
        )}
      </div>

      <StatusBar
        url={currentUrl}
        progress={progress}
        isLoading={isLoading}
      />
    </div>
  );
}

function MenuBar() {
  const items = ["File", "Edit", "View", "Favorites", "Tools", "Help"];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "1px 4px",
        background: "#ece9d8",
        borderBottom: "1px solid #bfbfbf",
        fontSize: 11,
        color: "#000",
        gap: 4,
      }}
    >
      <img
        src="/IE6-icon.webp"
        alt=""
        aria-hidden
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
        style={{ width: 16, height: 16, marginRight: 2 }}
      />
      {items.map((label) => (
        <button
          key={label}
          style={{
            background: "transparent",
            border: "none",
            color: "#000",
            padding: "2px 8px",
            fontFamily: "inherit",
            fontSize: "inherit",
            cursor: "default",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#3169c6";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#000";
          }}
        >
          <u>{label[0]}</u>
          {label.slice(1)}
        </button>
      ))}
    </div>
  );
}

function Toolbar({
  onBack,
  onForward,
  onStop,
  onRefresh,
  onHome,
  canBack,
  canForward,
  isLoading,
}: {
  onBack: () => void;
  onForward: () => void;
  onStop: () => void;
  onRefresh: () => void;
  onHome: () => void;
  canBack: boolean;
  canForward: boolean;
  isLoading: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        padding: "3px 6px",
        background:
          "linear-gradient(180deg, #f6f5ed 0%, #ece9d8 50%, #d6d2bb 100%)",
        borderBottom: "1px solid #a8a89a",
      }}
    >
      <TbButton onClick={onBack} disabled={!canBack} icon="⬅" label="Back" />
      <TbButton
        onClick={onForward}
        disabled={!canForward}
        icon="➡"
        label="Forward"
        textOnHover
      />
      <TbButton onClick={onStop} disabled={!isLoading} icon="⏹" label="Stop" />
      <TbButton onClick={onRefresh} icon="🔄" label="Refresh" />
      <TbButton onClick={onHome} icon="🏠" label="Home" />
      <Separator />
      <TbButton onClick={() => {}} icon="🔍" label="Search" disabled />
      <TbButton onClick={() => {}} icon="⭐" label="Favorites" disabled />
      <TbButton onClick={() => {}} icon="📜" label="History" disabled />
      <Separator />
      <TbButton onClick={() => {}} icon="✉" label="Mail" disabled />
      <TbButton onClick={() => {}} icon="🖨" label="Print" disabled />

      <div style={{ flex: 1 }} />

      <SpinningGlobe spinning={isLoading} />
    </div>
  );
}

function TbButton({
  onClick,
  icon,
  label,
  disabled,
}: {
  onClick: () => void;
  icon: string;
  label: string;
  disabled?: boolean;
  textOnHover?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
        background: "transparent",
        border: "1px solid transparent",
        padding: "2px 4px 0",
        cursor: disabled ? "default" : "pointer",
        color: disabled ? "#a8a8a8" : "#000",
        fontFamily: "inherit",
        fontSize: 10,
        minWidth: 44,
        opacity: disabled ? 0.55 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = "#dfdfff";
          e.currentTarget.style.borderColor = "#316ac5";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.borderColor = "transparent";
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: 10, lineHeight: 1.4 }}>{label}</span>
    </button>
  );
}

function Separator() {
  return (
    <div
      style={{
        width: 1,
        alignSelf: "stretch",
        background: "#a8a89a",
        margin: "4px 4px",
      }}
    />
  );
}

function AddressBar({
  value,
  onChange,
  onSubmit,
  isLoading,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 8px",
        background: "#ece9d8",
        borderBottom: "1px solid #a8a89a",
      }}
    >
      <span style={{ fontSize: 11, color: "#000" }}>Address</span>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          background: "#fff",
          border: "1px inset #ccc",
          padding: "1px 4px",
          gap: 4,
          minWidth: 0,
        }}
      >
        <span style={{ fontSize: 12, color: "#316ac5", flexShrink: 0 }}>🌐</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit();
          }}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontFamily: "Tahoma, sans-serif",
            fontSize: 11,
            minWidth: 0,
          }}
        />
      </div>
      <button
        onClick={onSubmit}
        disabled={isLoading}
        style={{
          fontFamily: "Tahoma, sans-serif",
          fontSize: 11,
          padding: "1px 8px",
          minWidth: 40,
          display: "flex",
          alignItems: "center",
          gap: 3,
          cursor: "pointer",
        }}
      >
        <span style={{ color: "#005f00" }}>➤</span>
        Go
      </button>
      <span style={{ fontSize: 11, color: "#000", marginLeft: 6 }}>Links</span>
    </div>
  );
}

function LinksBar({ onNavigate }: { onNavigate: (url: string) => void }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        padding: "1px 6px",
        background: "#ece9d8",
        borderBottom: "1px solid #a8a89a",
        fontSize: 11,
      }}
    >
      <span style={{ color: "#5a5a5a", marginRight: 6 }}>Links</span>
      {FAVORITES.map((f) => (
        <button
          key={f.url}
          onClick={() => onNavigate(f.url)}
          title={f.url}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "transparent",
            border: "1px solid transparent",
            color: "#000",
            padding: "1px 6px",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 11,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#dfdfff";
            e.currentTarget.style.borderColor = "#316ac5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "transparent";
          }}
        >
          {f.icon && (
            <img
              src={f.icon}
              alt=""
              aria-hidden
              style={{
                width: 14,
                height: 14,
                objectFit: "contain",
                flexShrink: 0,
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          {f.label}
        </button>
      ))}
    </div>
  );
}

function StatusBar({
  url,
  progress,
  isLoading,
}: {
  url: string;
  progress: number;
  isLoading: boolean;
}) {
  let zone = "Internet";
  try {
    const u = new URL(url);
    if (u.hostname.endsWith(".onion")) zone = "Restricted sites";
    else if (u.hostname === "localhost" || u.hostname.startsWith("192.168.")) zone = "Local intranet";
  } catch {
    /* ignore */
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "1px 4px",
        background: "#ece9d8",
        borderTop: "1px solid #a8a89a",
        fontFamily: "Tahoma, sans-serif",
        fontSize: 11,
      }}
    >
      <div
        style={{
          flex: 1,
          padding: "1px 6px",
          border: "1px inset #ccc",
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {isLoading ? `Opening page ${url}...` : "Done"}
      </div>
      <div
        style={{
          width: 140,
          height: 14,
          border: "1px inset #ccc",
          background: "#fff",
          padding: 1,
          flexShrink: 0,
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
      <div
        style={{
          padding: "1px 8px",
          border: "1px inset #ccc",
          minWidth: 100,
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        🌐 {zone}
      </div>
    </div>
  );
}

function SpinningGlobe({ spinning }: { spinning: boolean }) {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        marginLeft: 6,
        marginRight: 6,
        position: "relative",
        animation: spinning ? "ie-globe-spin 1.4s linear infinite" : "none",
        background:
          "radial-gradient(circle at 30% 30%, #ffe9a8 0%, #f6b923 25%, #c87a00 70%, #5a3300 100%)",
        borderRadius: "50%",
        boxShadow: "inset 1px 1px 2px rgba(255,255,255,0.6), 0 1px 2px rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <style>{`
        @keyframes ie-globe-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <span
        style={{
          fontFamily: "'Times New Roman', serif",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 18,
          color: "#1c4eaa",
          textShadow: "1px 1px 0 rgba(255,255,255,0.5)",
          lineHeight: 1,
        }}
      >
        e
      </span>
    </div>
  );
}

function FrameBlockedFallback({ url }: { url: string }) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        padding: 40,
        background: "#fff",
        fontFamily: "Tahoma, sans-serif",
        color: "#000",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 48,
          color: "#c8800a",
        }}
      >
        ⚠
      </div>
      <h1 style={{ fontSize: 18, margin: 0, color: "#222" }}>
        The page cannot be displayed in this frame
      </h1>
      <p style={{ fontSize: 12, color: "#444", maxWidth: 480, lineHeight: 1.5 }}>
        Le serveur <strong>{(() => { try { return new URL(url).hostname; } catch { return url; } })()}</strong>{" "}
        refuse l&apos;affichage en cadre par mesure de sécurité (X-Frame-Options:&nbsp;DENY).
        C&apos;est normal pour 2026 — IE6 ne savait pas faire ça en 2002.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        style={{
          padding: "6px 14px",
          background: "#316ac5",
          color: "#fff",
          textDecoration: "none",
          fontSize: 12,
          borderRadius: 2,
          border: "1px solid #1f4ea0",
        }}
      >
        Ouvrir dans un nouvel onglet
      </a>
      <code
        style={{
          fontSize: 11,
          color: "#888",
          padding: "4px 8px",
          background: "#f4f3ec",
          border: "1px solid #d5d3c4",
        }}
      >
        {url}
      </code>
    </div>
  );
}
