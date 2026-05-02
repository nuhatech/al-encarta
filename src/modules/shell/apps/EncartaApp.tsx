"use client";
import { useEffect, useState } from "react";
import { PersonalityList } from "@/src/modules/catalog/ui/PersonalityList";
import { ArticleView } from "@/src/modules/catalog/ui/ArticleView";
import { EncartaHomePanel } from "@/src/modules/catalog/ui/EncartaHomePanel";
import { TimelineView } from "@/src/modules/catalog/ui/TimelineView";
import { ChatTab } from "@/src/modules/conversation/ui/ChatTab";
import { personalityIndex } from "@/src/modules/catalog/infrastructure/personality-index";
import { isMuted, play, setMuted } from "@/src/shared/infra/audio/sounds";
import { PrintDialog } from "@/src/modules/shell/ui/easter-eggs/PrintDialog";

type Mode = "home" | "article" | "chat" | "timeline";

/**
 * Encarta 2002 application content.
 * Chrome (title bar, drag, close) is provided by the WindowFrame wrapper.
 */
export function EncartaApp() {
  const [selectedSlug, setSelectedSlug] = useState<string>("al-khawarizmi");
  const [mode, setMode] = useState<Mode>("home");
  const [printOpen, setPrintOpen] = useState(false);
  const personality =
    personalityIndex.find((p) => p.slug === selectedSlug) ?? personalityIndex[0];

  if (!personality) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <MenuBar />
      <Toolbar
        mode={mode}
        onMode={(m) => {
          play("click");
          setMode(m);
        }}
        onPrint={() => {
          play("click");
          setPrintOpen(true);
        }}
      />
      {printOpen && (
        <PrintDialog
          personalitySlug={selectedSlug}
          personalityName={personality.displayName}
          onClose={() => setPrintOpen(false)}
        />
      )}

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <div style={{ width: 240, flexShrink: 0 }}>
          <PersonalityList
            selectedSlug={selectedSlug}
            onSelect={(slug) => {
              play("click");
              setSelectedSlug(slug);
              setMode("article");
            }}
            onHome={() => {
              play("click");
              setMode("home");
            }}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0, background: "#fff" }}>
          {mode === "home" && (
            <EncartaHomePanel
              onPickArticle={() => {
                play("click");
                setMode("article");
              }}
              onPickChat={() => {
                play("click");
                setMode("chat");
              }}
              onPickTimeline={() => {
                play("click");
                setMode("timeline");
              }}
            />
          )}
          {mode === "article" && (
            <ArticleView
              slug={selectedSlug}
              onTalk={() => {
                play("click");
                setMode("chat");
              }}
            />
          )}
          {mode === "chat" && (
            <ChatTab
              personalityId={selectedSlug}
              personalityName={personality.displayName}
            />
          )}
          {mode === "timeline" && (
            <TimelineView
              onPickArticle={(slug) => {
                play("click");
                setSelectedSlug(slug);
                setMode("article");
              }}
            />
          )}
        </div>
      </div>

      <StatusBar mode={mode} personalityName={personality.displayName} />
    </div>
  );
}

function MenuBar() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        padding: "2px 4px",
        background:
          "linear-gradient(180deg, #2d6cd0 0%, #1f56b6 50%, #1a4ea8 100%)",
        color: "#fff",
        fontFamily: "Tahoma, sans-serif",
        fontSize: 11,
        borderBottom: "1px solid #103e7a",
      }}
    >
      {["File", "Edit", "View", "Favourites", "Features", "Tools", "Help"].map((m) => (
        <button
          key={m}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            padding: "2px 8px",
            fontFamily: "inherit",
            fontSize: "inherit",
            cursor: "default",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          {m}
        </button>
      ))}
    </div>
  );
}

interface SearchResult {
  title: string;
  body: string;
}

const SEARCH_EASTER_EGGS: ReadonlyArray<{ keys: ReadonlyArray<string>; result: SearchResult }> = [
  {
    keys: ["lost manuscripts", "manuscrits perdus", "bagdad 1258", "1258"],
    result: {
      title: "Manuscrits perdus — index complémentaire",
      body:
        "Cet index recense les bibliothèques majeures détruites du monde arabo-musulman :\n\n• Bayt al-Hikma (Bagdad, 1258) — Sac mongol d'Hulagu, 400 000 manuscrits jetés au Tigre selon les chroniqueurs.\n• Bibliothèque d'al-Hakam II (Cordoue, 1011) — 400 000 volumes brûlés pendant la fitna berbère.\n• Bibliothèque de Tripoli (1109) — Brûlée pendant le siège croisé.\n• Bibliothèque ya'rubie de Mascate (1717) — Pillée durant la guerre civile omanaise.\n\n« Ce qui ne disparaît pas par le feu disparaît par l'oubli. » — al-Mas'udi.",
    },
  },
  {
    keys: ["tamerlane", "tamerlan", "timur", "damas 1401"],
    result: {
      title: "Ibn Khaldoun & Tamerlan — Damas, hiver 1401",
      body:
        "Pendant le siège de Damas en hiver 1401, Ibn Khaldoun (alors âgé de 69 ans) fut descendu par-dessus la muraille au moyen d'une corde pour aller négocier avec Tamerlan en personne. Pendant plusieurs entretiens, le savant tunisien et le conquérant turco-mongol discutèrent géographie, philosophie et politique.\n\nTamerlan, fasciné, lui demanda d'écrire pour lui une description du Maghreb pour ses futures campagnes. Ibn Khaldoun s'exécuta — mais Tamerlan mourut en 1405 sans avoir mené ces campagnes.\n\nIbn Khaldoun a consigné ces rencontres dans son autobiographie, le Ta'rif.",
    },
  },
  {
    keys: ["konami", "↑↑↓↓"],
    result: {
      title: "Indice — séquence Konami",
      body:
        "Sur le bureau (pas dans une fenêtre Encarta), tapez :\n\n   ↑ ↑ ↓ ↓ ← → ← → B A\n\nLes savants persans du 11ème siècle savaient déjà qu'on peut prédire les mouvements en mesurant les angles. Tu auras besoin d'un astrolabe.",
    },
  },
  {
    keys: ["nuhatech", "kutub", "hilal globe"],
    result: {
      title: "NuhaTech — l'écosystème complet",
      body:
        "NuhaTech construit des outils à l'intersection du patrimoine arabo-musulman et de l'IA :\n\n• Kutub.io — moteur de recherche sur 9 000+ livres classiques\n• Hilal Globe — carte de visibilité du croissant lunaire (méthode Odeh)\n\nDouble-cliquez sur les icônes Kutub ou Hilal Globe sur le bureau pour les ouvrir directement dans Encarta.",
    },
  },
  {
    keys: ["hormuz", "ormuz", "détroit"],
    result: {
      title: "Détroit d'Ormuz — fiche stratégique",
      body:
        "32 km au point le plus étroit. ~21% du pétrole mondial transite par ce passage chaque jour.\n\nVisité par Ibn Battuta en 1330. Cartographié par Ahmad ibn Majid au 15ème siècle. Libéré des Portugais par l'Imam Nasir bin Murshid Al Ya'rubi à partir de 1624.\n\n→ Ouvrez l'application « Démineur — Ormuz » sur le bureau pour défendre le détroit.",
    },
  },
];

function searchEncarta(query: string): SearchResult | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  for (const egg of SEARCH_EASTER_EGGS) {
    if (egg.keys.some((k) => q === k.toLowerCase() || q.includes(k.toLowerCase()))) {
      return egg.result;
    }
  }
  return {
    title: "Aucun résultat",
    body: `La recherche pour « ${query} » n'a renvoyé aucun résultat.\n\nEssayez l'index alphabétique à gauche, ou tapez un mot-clé spécial : « 1258 », « tamerlan », « hormuz », « konami », « nuhatech ».`,
  };
}

function Toolbar({
  mode,
  onMode,
  onPrint,
}: {
  mode: Mode;
  onMode: (m: Mode) => void;
  onPrint: () => void;
}) {
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

  const Btn = ({ id, glyph, label }: { id: Mode; glyph: string; label: string }) => (
    <button
      onClick={() => onMode(id)}
      style={{
        fontWeight: mode === id ? 700 : 400,
        display: "flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      <span>{glyph}</span>
      <span>{label}</span>
    </button>
  );

  // Render timeline button only when relevant (not when viewing the home).
  // Keeps the toolbar tight for the common Article/Conversation flow.

  const submit = () => {
    setSearchResult(searchEncarta(query));
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 6px",
        borderBottom: "1px solid #888",
        background: "var(--y2k-window)",
        fontFamily: "Tahoma, sans-serif",
        fontSize: 11,
      }}
    >
      <input
        type="text"
        placeholder="Find"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        style={{ width: 180 }}
      />
      <button onClick={submit}>Go</button>
      <span style={{ color: "#888" }}>|</span>
      <Btn id="home" glyph="🏠" label="Accueil" />
      <Btn id="article" glyph="📖" label="Article" />
      <Btn id="chat" glyph="🎙" label="Conversation" />
      <Btn id="timeline" glyph="📅" label="Frise" />
      {mode === "chat" && (
        <button
          onClick={onPrint}
          title="Imprimer la conversation"
          style={{ display: "flex", alignItems: "center", gap: 4 }}
        >
          <span>🖨</span>
          <span>Imprimer</span>
        </button>
      )}
      <div style={{ flex: 1 }} />
      <span style={{ color: "#555" }}>encarta.msn.com</span>

      {searchResult && (
        <SearchResultModal
          result={searchResult}
          onClose={() => {
            setSearchResult(null);
            setQuery("");
          }}
        />
      )}
    </div>
  );
}

function SearchResultModal({
  result,
  onClose,
}: {
  result: SearchResult;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 4000,
      }}
    >
      <div
        className="window"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "min(560px, 90%)", maxHeight: "80%" }}
      >
        <div className="title-bar">
          <div className="title-bar-text">🔍 Résultat de recherche</div>
          <div className="title-bar-controls">
            <button aria-label="Close" onClick={onClose} />
          </div>
        </div>
        <div
          className="window-body"
          style={{
            padding: 18,
            fontFamily: "Tahoma, sans-serif",
            fontSize: 12,
            overflowY: "auto",
            maxHeight: "60vh",
          }}
        >
          <h2
            style={{
              margin: 0,
              marginBottom: 10,
              fontFamily: "Georgia, serif",
              fontSize: 16,
              color: "#000080",
            }}
          >
            {result.title}
          </h2>
          <p
            style={{
              margin: 0,
              whiteSpace: "pre-wrap",
              lineHeight: 1.55,
              color: "#222",
            }}
          >
            {result.body}
          </p>
          <div style={{ marginTop: 14, textAlign: "right" }}>
            <button onClick={onClose} style={{ minWidth: 80 }}>
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBar({ mode, personalityName }: { mode: Mode; personalityName: string }) {
  const [muted, setMutedState] = useState(false);

  useEffect(() => {
    setMutedState(isMuted());
  }, []);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  };

  const status =
    mode === "home"
      ? "Prêt — choisissez un article dans la liste"
      : mode === "article"
        ? `Article : ${personalityName}`
        : mode === "timeline"
          ? "Frise chronologique — 7ᵉ–16ᵉ siècle"
          : `Conversation interactive avec ${personalityName}`;

  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        padding: "2px 4px",
        borderTop: "1px solid #fff",
        background: "var(--y2k-window)",
        fontFamily: "Tahoma, sans-serif",
        fontSize: 11,
      }}
    >
      <div style={{ flex: 1, border: "inset 1px", padding: "1px 6px" }}>{status}</div>
      <div
        style={{
          border: "inset 1px",
          padding: "1px 6px",
          minWidth: 80,
          textAlign: "center",
        }}
      >
        CD-ROM 1/2
      </div>
      <button
        onClick={toggleMute}
        title={muted ? "Réactiver les sons système" : "Couper les sons système"}
        style={{ minWidth: 36, padding: "0 6px", fontSize: 11 }}
      >
        {muted ? "🔇" : "🔊"}
      </button>
    </div>
  );
}
