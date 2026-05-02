"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export const EQ_FREQUENCIES = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000] as const;

export interface AudioEngineState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  volume: number; // 0..1
  eqGains: number[]; // 10 bands, gain in dB roughly -12..+12
}

export interface AudioEngineApi {
  state: AudioEngineState;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  load(src: string): void;
  play(): void;
  pause(): void;
  toggle(): void;
  seek(seconds: number): void;
  setVolume(v: number): void;
  setEqGain(bandIndex: number, gainDb: number): void;
  /** Returns the analyser frequency data — call from a requestAnimationFrame loop. */
  getFrequencyData(buffer: Uint8Array): void;
  /** Returns the analyser time-domain data (for waveform-style visualizations). */
  getTimeDomainData(buffer: Uint8Array): void;
}

/**
 * Builds a Web Audio graph: HTMLAudioElement → MediaElementSource →
 * 10×BiquadFilterNode (EQ bands) → AnalyserNode → Destination.
 *
 * The graph is constructed lazily on first play() so we don't ask the user
 * for audio permission before they interact with the player.
 */
export function useAudioEngine(): AudioEngineApi {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const [state, setState] = useState<AudioEngineState>({
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    isLoading: false,
    error: null,
    volume: 0.8,
    eqGains: new Array(EQ_FREQUENCIES.length).fill(0),
  });

  // Subscribe to events on the <audio> element rendered by the parent
  // component (audioRef is populated by React after mount).
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = 0.8;

    const onTime = () => setState((s) => ({ ...s, currentTime: el.currentTime }));
    const onMeta = () => setState((s) => ({ ...s, duration: el.duration || 0, isLoading: false }));
    const onPlay = () => setState((s) => ({ ...s, isPlaying: true }));
    const onPause = () => setState((s) => ({ ...s, isPlaying: false }));
    const onError = () =>
      setState((s) => ({
        ...s,
        isLoading: false,
        error: "Source introuvable",
        isPlaying: false,
      }));
    const onLoading = () => setState((s) => ({ ...s, isLoading: true, error: null }));
    const onEnded = () => setState((s) => ({ ...s, isPlaying: false }));

    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("error", onError);
    el.addEventListener("loadstart", onLoading);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("error", onError);
      el.removeEventListener("loadstart", onLoading);
      el.removeEventListener("ended", onEnded);
    };
  }, []);

  const ensureGraph = useCallback(() => {
    const el = audioRef.current;
    if (!el || ctxRef.current) return;
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    ctxRef.current = ctx;

    let prev: AudioNode;
    try {
      const src = ctx.createMediaElementSource(el);
      sourceRef.current = src;
      prev = src;
    } catch {
      // Already connected to a graph — bail out.
      return;
    }

    const filters: BiquadFilterNode[] = EQ_FREQUENCIES.map((freq, i) => {
      const f = ctx.createBiquadFilter();
      // Endpoints use shelf filters, mid bands use peaking.
      if (i === 0) {
        f.type = "lowshelf";
      } else if (i === EQ_FREQUENCIES.length - 1) {
        f.type = "highshelf";
      } else {
        f.type = "peaking";
        f.Q.value = 1;
      }
      f.frequency.value = freq;
      f.gain.value = 0;
      return f;
    });
    filtersRef.current = filters;
    for (const f of filters) {
      prev.connect(f);
      prev = f;
    }

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.78;
    analyserRef.current = analyser;
    prev.connect(analyser);
    analyser.connect(ctx.destination);
  }, []);

  const load = useCallback((src: string) => {
    const el = audioRef.current;
    if (!el) return;
    if (el.src.endsWith(src)) return;
    setState((s) => ({ ...s, isLoading: true, error: null, currentTime: 0, duration: 0 }));
    el.src = src;
    el.load();
  }, []);

  const play = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    ensureGraph();
    void ctxRef.current?.resume();
    void el.play().catch((e: unknown) => {
      const msg = e instanceof Error ? e.message : "playback_failed";
      setState((s) => ({ ...s, error: msg, isPlaying: false }));
    });
  }, [ensureGraph]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) play();
    else pause();
  }, [play, pause]);

  const seek = useCallback((seconds: number) => {
    const el = audioRef.current;
    if (!el) return;
    if (Number.isFinite(seconds)) el.currentTime = Math.max(0, seconds);
  }, []);

  const setVolume = useCallback((v: number) => {
    const el = audioRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(1, v));
    el.volume = clamped;
    setState((s) => ({ ...s, volume: clamped }));
  }, []);

  const setEqGain = useCallback((bandIndex: number, gainDb: number) => {
    const f = filtersRef.current[bandIndex];
    if (!f) return;
    const clamped = Math.max(-12, Math.min(12, gainDb));
    f.gain.value = clamped;
    setState((s) => {
      const next = [...s.eqGains];
      next[bandIndex] = clamped;
      return { ...s, eqGains: next };
    });
  }, []);

  const getFrequencyData = useCallback((buffer: Uint8Array) => {
    const a = analyserRef.current;
    if (!a) {
      buffer.fill(0);
      return;
    }
    // Cast: AnalyserNode types want Uint8Array<ArrayBuffer> but our buffer is
    // typed as Uint8Array<ArrayBufferLike> (the safer common shape). The
    // runtime API works on any ArrayBuffer-backed Uint8Array.
    a.getByteFrequencyData(buffer as Uint8Array<ArrayBuffer>);
  }, []);

  const getTimeDomainData = useCallback((buffer: Uint8Array) => {
    const a = analyserRef.current;
    if (!a) {
      buffer.fill(128);
      return;
    }
    a.getByteTimeDomainData(buffer as Uint8Array<ArrayBuffer>);
  }, []);

  return {
    state,
    audioRef,
    load,
    play,
    pause,
    toggle,
    seek,
    setVolume,
    setEqGain,
    getFrequencyData,
    getTimeDomainData,
  };
}
