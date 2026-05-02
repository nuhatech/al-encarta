"use client";
import { useState } from "react";
import { useAudioRecorder } from "./hooks/use-audio-recorder";

interface MicButtonProps {
  disabled?: boolean;
  onTranscribed: (text: string) => void;
}

export function MicButton({ disabled, onTranscribed }: MicButtonProps) {
  const recorder = useAudioRecorder();
  const [transcribing, setTranscribing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  if (!recorder.supported) return null;

  const isRecording = recorder.state === "recording";
  const isPermission = recorder.state === "permission";
  const busy = disabled || isPermission || transcribing;

  const handleClick = async () => {
    setLastError(null);
    if (isRecording) {
      const blob = await recorder.stop();
      if (!blob) {
        if (recorder.error) setLastError(recorder.error);
        return;
      }
      setTranscribing(true);
      try {
        const form = new FormData();
        form.append("audio", blob, `clip.${extFromMime(blob.type)}`);
        form.append("language", "fr");
        const res = await fetch("/api/transcribe", { method: "POST", body: form });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? `http_${res.status}`);
        }
        const json = (await res.json()) as { text: string };
        if (json.text.trim()) onTranscribed(json.text.trim());
        else setLastError("Aucun texte détecté");
      } catch (e) {
        setLastError(e instanceof Error ? e.message : "transcription_failed");
      } finally {
        setTranscribing(false);
      }
    } else {
      await recorder.start();
    }
  };

  const label = transcribing ? "⌛" : isRecording ? "⏹" : isPermission ? "…" : "🎤";
  const title = transcribing
    ? "Transcription en cours…"
    : isRecording
      ? "Arrêter l'enregistrement"
      : isPermission
        ? "Demande d'accès au micro…"
        : "Parler au lieu de taper (Voxtral)";

  const errMsg = recorder.error ?? lastError;

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy && !isRecording}
        title={errMsg ? `${title}\n⚠ ${humanizeMicError(errMsg)}` : title}
        style={{
          minWidth: 36,
          fontWeight: isRecording ? 700 : 400,
          background: isRecording ? "#fff0f0" : errMsg ? "#fff3cd" : undefined,
          borderColor: errMsg ? "#d4a800" : undefined,
          cursor: transcribing ? "progress" : undefined,
          animation: isRecording ? "mic-pulse 1s ease-in-out infinite" : undefined,
        }}
      >
        {label}
      </button>
      <style>{`
        @keyframes mic-pulse {
          0%, 100% { box-shadow: inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px #808080, inset 2px 2px #dfdfdf; }
          50% { box-shadow: inset 0 0 0 2px #c00, inset -1px -1px #0a0a0a, inset 1px 1px #fff; }
        }
      `}</style>
    </>
  );
}

function humanizeMicError(raw: string): string {
  if (/permission|notallowed|denied/i.test(raw))
    return "Permission micro refusée. Autorisez-le dans les paramètres du navigateur.";
  if (/not.found|nodevice|no.audio/i.test(raw))
    return "Aucun micro détecté. Branchez un micro USB ou jack 3,5 mm.";
  if (/network|fetch|http_/i.test(raw))
    return "Connexion réseau perdue ou serveur indisponible. Réessayez.";
  if (/audio:empty|too_large|unsupported/i.test(raw))
    return "Enregistrement invalide (trop court, trop long, ou format non pris en charge).";
  if (/voxtral|mistral|429|rate/i.test(raw))
    return "Voxtral est saturé. Réessayez dans quelques instants.";
  return raw;
}

function extFromMime(mime: string): string {
  const m = mime.toLowerCase();
  if (m.includes("webm")) return "webm";
  if (m.includes("ogg")) return "ogg";
  if (m.includes("mp4")) return "m4a";
  if (m.includes("wav")) return "wav";
  return "bin";
}
