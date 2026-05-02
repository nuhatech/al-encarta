"use client";
import { useEffect, useRef } from "react";
import type { Skin, VisualizationMode } from "./types";

interface VisualizerProps {
  skin: Skin;
  mode: VisualizationMode["id"];
  isPlaying: boolean;
  getFrequencyData: (buffer: Uint8Array) => void;
  getTimeDomainData: (buffer: Uint8Array) => void;
}

/**
 * Authentic WMP visualizations.
 *
 * The "Battery" mode plays a recording of the genuine 2002 Windows Media
 * Player visualization (a WebM loop) and modulates its playbackRate by the
 * bass envelope of the audio — same technique used by the rmellis WMP8
 * WebApp Clone (https://github.com/rmellis/Windows-Media-Player-8-WebApp-Clone-Public,
 * GPL-2.0). The video URL is the same one their app uses.
 *
 * Other modes (Bars, Scope) are pure canvas drawings.
 */
export const VISUALIZATION_MODES: ReadonlyArray<VisualizationMode> = [
  { id: "battery", name: "Battery" },
  { id: "bars", name: "Bars" },
  { id: "wave", name: "Scope" },
];

const VIS_VIDEO_URL = "https://saw.floydcraft.co.uk/1080p.webm";

export function Visualizer({
  skin,
  mode,
  isPlaying,
  getFrequencyData,
  getTimeDomainData,
}: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const currentRateRef = useRef(1.0);

  // Canvas-based visualizations (bars + wave)
  useEffect(() => {
    if (mode !== "bars" && mode !== "wave") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const FFT_BINS = 256;
    const freq = new Uint8Array(FFT_BINS);
    const time = new Uint8Array(FFT_BINS);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let stopped = false;
    const tick = () => {
      if (stopped) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);

      if (mode === "bars") {
        getFrequencyData(freq);
        drawBars(ctx, freq, w, h, skin, isPlaying);
      } else if (mode === "wave") {
        getTimeDomainData(time);
        drawWave(ctx, time, w, h, skin);
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      stopped = true;
      ro.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [skin, mode, isPlaying, getFrequencyData, getTimeDomainData]);

  // Battery mode: real WMP video footage with bass-driven playbackRate.
  useEffect(() => {
    if (mode !== "battery") return;
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => {
        /* autoplay blocked until user interacts */
      });
    } else {
      video.pause();
    }

    const FFT_BINS = 256;
    const freq = new Uint8Array(FFT_BINS);

    let stopped = false;
    const tick = () => {
      if (stopped) return;
      if (!isPlaying) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      getFrequencyData(freq);

      // Average the lowest 10% of bins (bass band)
      const bassBins = Math.max(1, Math.floor(freq.length * 0.1));
      let bassSum = 0;
      for (let i = 0; i < bassBins; i++) bassSum += freq[i] ?? 0;
      const bassAvg = bassSum / bassBins;

      // Map bass [0..255] → playbackRate [0.8..2.5], smoothed.
      const target = 0.8 + (bassAvg / 255) * 1.7;
      currentRateRef.current += (target - currentRateRef.current) * 0.1;
      const rate = Math.max(0.5, Math.min(currentRateRef.current, 2.5));
      try {
        video.playbackRate = rate;
      } catch {
        // ignore — some browsers throw before metadata loads
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      stopped = true;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [mode, isPlaying, getFrequencyData]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {mode === "battery" ? (
        <video
          ref={videoRef}
          src={VIS_VIDEO_URL}
          loop
          muted
          playsInline
          autoPlay
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            borderRadius: 4,
            background: "#000",
          }}
        />
      ) : (
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            borderRadius: 4,
            background: "#000",
          }}
        />
      )}
    </div>
  );
}

function drawBars(
  ctx: CanvasRenderingContext2D,
  freq: Uint8Array,
  w: number,
  h: number,
  skin: Skin,
  isPlaying: boolean,
) {
  const bars = 48;
  const gap = 2;
  const barW = (w - gap * (bars - 1)) / bars;
  for (let i = 0; i < bars; i++) {
    const t = i / bars;
    const idx = Math.floor(Math.pow(t, 1.6) * freq.length * 0.85);
    const v = isPlaying ? (freq[idx] ?? 0) / 255 : 0;
    const bh = Math.max(2, v * h * 0.95);
    const x = i * (barW + gap);
    const y = h - bh;
    const grad = ctx.createLinearGradient(0, y, 0, h);
    grad.addColorStop(0, skin.accent);
    grad.addColorStop(0.55, skin.accentSoft);
    grad.addColorStop(1, skin.outerEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, barW, bh);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillRect(x, y - 1, barW, 2);
  }
}

function drawWave(
  ctx: CanvasRenderingContext2D,
  time: Uint8Array,
  w: number,
  h: number,
  skin: Skin,
) {
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = skin.accent;
  ctx.shadowColor = skin.accent;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  const step = w / time.length;
  for (let i = 0; i < time.length; i++) {
    const v = ((time[i] ?? 128) - 128) / 128;
    const x = i * step;
    const y = h / 2 + v * (h * 0.42);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
}
