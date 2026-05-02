"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderState = "idle" | "permission" | "recording" | "stopping";

interface UseAudioRecorderReturn {
  state: RecorderState;
  supported: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => Promise<Blob | null>;
  cancel: () => void;
}

const PREFERRED_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4",
];

function pickSupportedMime(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  for (const m of PREFERRED_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(m)) return m;
  }
  return ""; // browser will use default
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [state, setState] = useState<RecorderState>("idle");
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const stopResolveRef = useRef<((blob: Blob | null) => void) | null>(null);

  const supported =
    typeof navigator !== "undefined" &&
    typeof navigator.mediaDevices !== "undefined" &&
    typeof MediaRecorder !== "undefined";

  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    recorderRef.current = null;
    chunksRef.current = [];
    stopResolveRef.current = null;
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const start = useCallback(async () => {
    if (!supported) {
      setError("Navigateur sans support MediaRecorder");
      return;
    }
    if (state !== "idle") return;
    setError(null);
    setState("permission");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mime = pickSupportedMime();
      const rec =
        mime && mime.length > 0
          ? new MediaRecorder(stream, { mimeType: mime })
          : new MediaRecorder(stream);
      recorderRef.current = rec;
      chunksRef.current = [];

      rec.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      rec.onstop = () => {
        const type = rec.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        const resolve = stopResolveRef.current;
        cleanup();
        setState("idle");
        if (resolve) resolve(blob.size > 0 ? blob : null);
      };
      rec.onerror = () => {
        setError("Erreur d'enregistrement");
        const resolve = stopResolveRef.current;
        cleanup();
        setState("idle");
        if (resolve) resolve(null);
      };

      rec.start(250); // 250ms chunks for low-latency feedback
      setState("recording");
    } catch (e) {
      setError(
        e instanceof Error && e.name === "NotAllowedError"
          ? "Permission micro refusée"
          : e instanceof Error
            ? e.message
            : "Erreur inconnue",
      );
      cleanup();
      setState("idle");
    }
  }, [supported, state, cleanup]);

  const stop = useCallback((): Promise<Blob | null> => {
    if (state !== "recording" || !recorderRef.current) {
      return Promise.resolve(null);
    }
    setState("stopping");
    return new Promise<Blob | null>((resolve) => {
      stopResolveRef.current = resolve;
      recorderRef.current?.stop();
    });
  }, [state]);

  const cancel = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      try {
        recorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    cleanup();
    setState("idle");
  }, [cleanup]);

  return { state, supported, error, start, stop, cancel };
}
