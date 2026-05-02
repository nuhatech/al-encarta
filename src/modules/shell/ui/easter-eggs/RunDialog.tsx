"use client";
import { useEffect, useRef, useState } from "react";

interface RunDialogProps {
  onClose: () => void;
  onAbout: () => void;
}

interface CommandResult {
  title: string;
  body: string;
}

const COMMANDS: Record<string, CommandResult> = {
  defendhack: {
    title: "DefendHack 2026",
    body:
      "Hackathon communautaire DefendHack 2026 — thème : Site année 2000.\nBuilt with Next.js 16, Claude Sonnet 4.6, Voxtral Mini Transcribe.\nCD-ROM 1/2 — encarta.msn.com",
  },
  "1258": {
    title: "13 février 1258",
    body:
      "Hulagu Khan prend Bagdad. Le sac dure 17 jours. La Maison de la Sagesse — bibliothèque de plus de 400 000 manuscrits — est brûlée. Les chroniqueurs rapportent que le Tigre fut noir d'encre des livres et rouge du sang des sages.\nIbn Khaldoun, né soixante-quatorze ans plus tard, en tirera dans la Muqaddima sa thèse sur le déclin des civilisations urbaines installées dans le luxe.",
  },
  "1453": {
    title: "29 mai 1453",
    body:
      "Mehmed II le Conquérant prend Constantinople après 53 jours de siège. À 21 ans, il met fin à 1100 ans d'Empire byzantin. Il entre dans Sainte-Sophie à cheval, ordonne sa transformation en mosquée, mais protège les Grecs et les Juifs qui restent.\nPour ouvrir la fenêtre Encarta sur Mehmed II, double-cliquez sur l'icône Encarta du bureau.",
  },
  bayt: {
    title: "Bayt al-Hikma",
    body:
      "Maison de la Sagesse, Bagdad, ~ 825 — 1258.\nFondée par le calife al-Ma'mun, elle accueillit al-Khawarizmi (algèbre), al-Kindi (philosophie), les Banu Musa (mécanique), Hunayn ibn Ishaq (traductions). Pendant 80 ans, ce fut la concentration intellectuelle la plus dense au monde.\nLa majorité des œuvres conservées d'Aristote, Galien et Euclide nous sont parvenues par les copies arabes qui y furent produites.",
  },
  nuhatech: {
    title: "NuhaTech",
    body:
      "Outils à l'intersection du patrimoine arabo-musulman et de l'IA.\nProduits : Kutub.io (bibliothèque de 9 000+ livres classiques), Hilal Globe (visibilité du croissant lunaire selon la méthode Odeh).\nDouble-cliquez sur les icônes Kutub ou Hilal Globe du bureau pour les ouvrir directement.",
  },
  hormuz: {
    title: "Détroit d'Ormuz",
    body:
      "32 km de large à son point le plus étroit. 21% du pétrole mondial y transite chaque jour.\nIbn Battuta y est passé en 1330. Ahmad ibn Majid en cartographia les passages au 15ème siècle. L'Imam Nasir bin Murshid Al Ya'rubi en chassa les Portugais en 1624.\nDouble-cliquez sur Démineur — Ormuz pour défendre le détroit.",
  },
  konami: {
    title: "↑↑↓↓←→←→BA",
    body:
      "Indice : sur le bureau (pas dans une fenêtre), tapez la séquence du Konami code.\nCertains savants persans du 11ème siècle savaient déjà qu'on peut prédire les mouvements en mesurant les angles.",
  },
  bismillah: {
    title: "—",
    body:
      "(Cette commande n'est pas reconnue par le système. Essayez 'help'.)",
  },
  help: {
    title: "Commandes disponibles",
    body:
      "Commandes spéciales DefendHack 2026 :\n  defendhack    — À propos du projet\n  about         — À propos de Windows\n  1258, 1453    — Dates pivots de l'histoire arabo-musulmane\n  bayt          — Maison de la Sagesse\n  hormuz        — Détroit d'Ormuz\n  nuhatech      — NuhaTech\n  konami        — Indice\n  cmd, calc     — Non implémentés (déco Y2K)",
  },
};

export function RunDialog({ onClose, onAbout }: RunDialogProps) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<CommandResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = () => {
    const cmd = value.trim().toLowerCase();
    setError(null);
    if (!cmd) return;
    if (cmd === "about") {
      onAbout();
      onClose();
      return;
    }
    const found = COMMANDS[cmd];
    if (found) {
      setResult(found);
    } else {
      setError(
        `Windows ne peut pas trouver « ${value} ». Vérifiez l'orthographe et réessayez. (Tapez « help » pour la liste.)`,
      );
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 5500,
      }}
      onClick={onClose}
    >
      <div
        className="window"
        onClick={(e) => e.stopPropagation()}
        style={{ width: 460 }}
      >
        <div className="title-bar">
          <div className="title-bar-text">Exécuter</div>
          <div className="title-bar-controls">
            <button aria-label="Close" onClick={onClose} />
          </div>
        </div>
        <div
          className="window-body"
          style={{
            padding: 16,
            fontFamily: "Tahoma, sans-serif",
            fontSize: 12,
          }}
        >
          {!result && (
            <>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
                <span style={{ fontSize: 30 }}>📂</span>
                <p style={{ margin: 0, lineHeight: 1.5 }}>
                  Tapez le nom d&apos;un programme, d&apos;un dossier, d&apos;un
                  document ou d&apos;une ressource Internet et Windows
                  l&apos;ouvrira pour vous.
                </p>
              </div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <span>Ouvrir :</span>
                <input
                  ref={inputRef}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submit();
                    if (e.key === "Escape") onClose();
                  }}
                  style={{ flex: 1 }}
                  placeholder="ex. defendhack, 1258, bayt, hormuz, help"
                />
              </label>
              {error && (
                <div
                  role="alert"
                  style={{
                    background: "#fff3cd",
                    border: "1px solid #d4a800",
                    padding: "6px 10px",
                    fontSize: 11,
                    marginTop: 8,
                  }}
                >
                  ⚠ {error}
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 6,
                  marginTop: 14,
                }}
              >
                <button onClick={submit} style={{ minWidth: 80 }}>
                  OK
                </button>
                <button onClick={onClose} style={{ minWidth: 80 }}>
                  Annuler
                </button>
                <button disabled style={{ minWidth: 80 }}>
                  Parcourir…
                </button>
              </div>
            </>
          )}
          {result && (
            <>
              <h2
                style={{
                  margin: 0,
                  marginBottom: 8,
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
                  fontSize: 12,
                  lineHeight: 1.5,
                  color: "#222",
                }}
              >
                {result.body}
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 6,
                  marginTop: 14,
                }}
              >
                <button
                  onClick={() => {
                    setResult(null);
                    setValue("");
                    setTimeout(() => inputRef.current?.focus(), 0);
                  }}
                >
                  Autre commande
                </button>
                <button onClick={onClose} style={{ minWidth: 80 }}>
                  Fermer
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
