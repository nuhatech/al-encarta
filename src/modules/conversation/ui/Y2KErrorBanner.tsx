"use client";
import type { ChatError, ChatErrorKind } from "./hooks/use-chat-stream";

interface Y2KErrorBannerProps {
  error: ChatError;
  onRetry?: () => void;
  onDismiss?: () => void;
}

interface ErrorPresentation {
  icon: string;
  title: string;
  body: string;
  showRetry: boolean;
}

function present(error: ChatError): ErrorPresentation {
  const kind: ChatErrorKind = error.kind;
  switch (kind) {
    case "rate-limit": {
      const wait = error.retryAfterSec
        ? `Réessayez dans ${error.retryAfterSec} seconde${error.retryAfterSec > 1 ? "s" : ""}.`
        : "Réessayez dans quelques instants.";
      return {
        icon: "⏳",
        title: "Quota Anthropic atteint",
        body: `Trop de requêtes envoyées à Claude. ${wait} (Le prompt caching réduit ces situations — vérifiez que VoiceComposer reste byte-stable.)`,
        showRetry: true,
      };
    }
    case "network":
      return {
        icon: "🔌",
        title: "Connexion réseau perdue",
        body:
          "Impossible de joindre le serveur Encarta. Vérifiez votre câble Ethernet RJ-45, votre modem 56k, ou le hub réseau le plus proche.",
        showRetry: true,
      };
    case "auth":
      return {
        icon: "🔐",
        title: "Clé API manquante ou invalide",
        body:
          "Le serveur Anthropic refuse l'authentification. Vérifiez que ANTHROPIC_API_KEY est posée dans .env.local (ou côté Cloudflare via wrangler secret put).",
        showRetry: false,
      };
    case "server":
      return {
        icon: "💥",
        title: "Erreur serveur",
        body: `Le service Encarta a rencontré une erreur interne. ${error.message}`,
        showRetry: true,
      };
    case "validation":
      return {
        icon: "⚠️",
        title: "Requête invalide",
        body: `Le serveur a refusé la requête : ${error.message}`,
        showRetry: false,
      };
    default:
      return {
        icon: "❗",
        title: "Erreur inattendue",
        body: error.message,
        showRetry: true,
      };
  }
}

export function Y2KErrorBanner({ error, onRetry, onDismiss }: Y2KErrorBannerProps) {
  const p = present(error);
  return (
    <div
      role="alert"
      style={{
        margin: "10px 0",
        padding: "10px 12px",
        background: "#fff3cd",
        border: "1px solid #d4a800",
        borderLeft: "4px solid #d4a800",
        fontFamily: "Tahoma, sans-serif",
        fontSize: 12,
        color: "#202020",
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
      }}
    >
      <div
        aria-hidden
        style={{
          fontSize: 22,
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        {p.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, marginBottom: 2 }}>{p.title}</div>
        <div style={{ lineHeight: 1.4, color: "#333" }}>{p.body}</div>
        <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
          {p.showRetry && onRetry && (
            <button onClick={onRetry} style={{ minWidth: 70 }}>
              ↻ Recommencer
            </button>
          )}
          {onDismiss && (
            <button onClick={onDismiss} style={{ minWidth: 70 }}>
              Fermer
            </button>
          )}
          <small
            style={{
              marginLeft: "auto",
              alignSelf: "center",
              color: "#777",
              fontFamily: "monospace",
              fontSize: 10,
            }}
          >
            code: {error.kind}
          </small>
        </div>
      </div>
    </div>
  );
}
