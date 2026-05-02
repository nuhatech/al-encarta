"use client";
import { useEffect, useRef, useState } from "react";
import { play } from "@/src/shared/infra/audio/sounds";

interface InstallerWizardProps {
  onDone: () => void;
}

const STEPS: ReadonlyArray<{
  title: string;
  files: ReadonlyArray<string>;
  durationMs: number;
}> = [
  {
    title: "Étape 1 sur 3 — Préparation de l'installation",
    files: [
      "Vérification de l'espace disque...",
      "Initialisation de InstallShield Wizard 6.0...",
      "Détection de Microsoft Internet Explorer 5.5... OK",
      "Vérification de DirectX 7.0a... OK",
    ],
    durationMs: 4500,
  },
  {
    title: "Étape 2 sur 3 — Copie des fichiers Encarta",
    files: [
      "Copie de encarta.exe...",
      "Décompression de pioneers_arabo_muslim.cab (243 MB)...",
      "Copie de al-khawarizmi.dll...",
      "Copie de ibn-battuta.atlas...",
      "Copie de ibn-al-haytham.optics...",
      "Copie de fatima-al-fihri.idx...",
      "Copie de ibn-khaldoun.muqaddima...",
      "Copie de ibn-al-nafis.cardio...",
      "Copie de bayt_al_hikma.ttf...",
      "Décompression des polices Tahoma et Georgia...",
    ],
    durationMs: 7500,
  },
  {
    title: "Étape 3 sur 3 — Configuration finale",
    files: [
      "Création des entrées de registre...",
      "Configuration de l'antivirus Norton 2001...",
      "Création des raccourcis bureau...",
      "Enregistrement auprès de Microsoft...",
      "Optimisation du défragmenteur...",
    ],
    durationMs: 3500,
  },
];

export function InstallerWizard({ onDone }: InstallerWizardProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);
  const startedAt = useRef<number>(performance.now());

  const step = STEPS[stepIndex];

  useEffect(() => {
    if (!step) {
      play("installComplete");
      const t = setTimeout(onDone, 700);
      return () => clearTimeout(t);
    }
    startedAt.current = performance.now();
    setProgress(0);
    setLogIndex(0);
    let lastTickIdx = 0;

    const tick = setInterval(() => {
      const elapsed = performance.now() - startedAt.current;
      const pct = Math.min(100, (elapsed / step.durationMs) * 100);
      setProgress(pct);
      const nextLog = Math.min(step.files.length, Math.floor((pct / 100) * step.files.length));
      if (nextLog > lastTickIdx) {
        play("installTick");
        lastTickIdx = nextLog;
      }
      setLogIndex(nextLog);
      if (pct >= 100) {
        clearInterval(tick);
        setTimeout(() => setStepIndex(stepIndex + 1), 400);
      }
    }, 80);

    return () => clearInterval(tick);
  }, [stepIndex, step, onDone]);

  if (!step) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="window" style={{ width: 520 }}>
        <div className="title-bar">
          <div className="title-bar-text">Microsoft Encarta Reference Library 2002 — Installation</div>
          <div className="title-bar-controls">
            <button aria-label="Minimize" />
            <button aria-label="Maximize" />
            <button aria-label="Close" onClick={onDone} />
          </div>
        </div>
        <div className="window-body" style={{ padding: 18 }}>
          <p style={{ margin: 0, marginBottom: 8, fontWeight: 700 }}>{step.title}</p>
          <p style={{ margin: 0, marginBottom: 12, fontSize: 12 }}>
            Veuillez patienter pendant que InstallShield Wizard configure Encarta…
          </p>

          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            className="progress-indicator segmented"
            style={{ marginBottom: 12 }}
          >
            <span className="progress-indicator-bar" style={{ width: `${progress}%` }} />
          </div>

          <div
            style={{
              background: "#fff",
              border: "inset 2px",
              padding: 8,
              fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
              fontSize: 11,
              height: 110,
              overflow: "hidden",
              color: "#000",
            }}
          >
            {step.files.slice(0, logIndex).map((f, i) => (
              <div key={i}>&gt; {f}</div>
            ))}
            {logIndex < step.files.length && (
              <div style={{ opacity: 0.7 }}>&gt; {step.files[logIndex]}</div>
            )}
          </div>

          <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 6 }}>
            <button disabled>&lt; Précédent</button>
            <button disabled>Suivant &gt;</button>
            <button onClick={onDone}>Annuler</button>
          </div>
        </div>
      </div>
    </div>
  );
}
