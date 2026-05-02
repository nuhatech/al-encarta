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
 * WMP-era visualizations:
 *  - Battery — multi-colored Lissajous swirls with additive blending
 *  - Plenoptic — concentric pulsing hue rings
 *  - Particle — outward radial dot streams
 *  - Bars — classic spectrum bars
 *  - Wave — single oscilloscope line
 *  - Alchemy — radial petals shifting hue
 */
export const VISUALIZATION_MODES: ReadonlyArray<VisualizationMode> = [
  { id: "battery", name: "Battery" },
  { id: "plenoptic", name: "Plenoptic" },
  { id: "particle", name: "Particle" },
  { id: "alchemy", name: "Alchemy" },
  { id: "bars", name: "Bars" },
  { id: "wave", name: "Scope" },
];

export function Visualizer({
  skin,
  mode,
  isPlaying,
  getFrequencyData,
  getTimeDomainData,
}: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const phaseRef = useRef(0);

  useEffect(() => {
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
      phaseRef.current += 0.018;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      // Trail effect: don't fully clear, paint over with low-alpha black
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, 0, w, h);

      if (mode === "bars") {
        getFrequencyData(freq);
        drawBars(ctx, freq, w, h, skin, isPlaying);
      } else if (mode === "wave") {
        getTimeDomainData(time);
        drawWave(ctx, time, w, h, skin);
      } else if (mode === "battery") {
        getFrequencyData(freq);
        drawBattery(ctx, freq, w, h, isPlaying, phaseRef.current);
      } else if (mode === "plenoptic") {
        getFrequencyData(freq);
        drawPlenoptic(ctx, freq, w, h, isPlaying, phaseRef.current);
      } else if (mode === "particle") {
        getFrequencyData(freq);
        drawParticle(ctx, freq, w, h, isPlaying, phaseRef.current);
      } else if (mode === "alchemy") {
        getFrequencyData(freq);
        drawAlchemy(ctx, freq, w, h, isPlaying, phaseRef.current);
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

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        borderRadius: 4,
      }}
    />
  );
}

// --- Battery: multi-colored Lissajous swirls (the iconic WMP psychedelic look) ---
function drawBattery(
  ctx: CanvasRenderingContext2D,
  freq: Uint8Array,
  w: number,
  h: number,
  isPlaying: boolean,
  phase: number,
) {
  const cx = w / 2;
  const cy = h / 2;
  const baseR = Math.min(w, h) * 0.18;
  const numCurves = 7;
  ctx.globalCompositeOperation = "lighter";
  for (let c = 0; c < numCurves; c++) {
    const bandIdx = Math.floor(((c + 1) / (numCurves + 1)) * freq.length * 0.55);
    const v = isPlaying ? (freq[bandIdx] ?? 0) / 255 : 0.18;
    const r = baseR * (0.6 + v * 1.6);
    const hue = (phase * 22 + c * 47) % 360;
    ctx.strokeStyle = `hsla(${hue}, 85%, 60%, 0.55)`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    const turns = 3 + (c % 4);
    const pts = 360;
    for (let i = 0; i <= pts; i++) {
      const t = i / pts;
      const angle =
        t * Math.PI * 2 * turns +
        phase * (0.35 + c * 0.06) +
        c * 0.18;
      const radius =
        r + Math.sin(t * Math.PI * (4 + c) + phase * 1.3) * (24 + v * 50);
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";
}

// --- Plenoptic: concentric pulsing hue rings ---
function drawPlenoptic(
  ctx: CanvasRenderingContext2D,
  freq: Uint8Array,
  w: number,
  h: number,
  isPlaying: boolean,
  phase: number,
) {
  const cx = w / 2;
  const cy = h / 2;
  const maxR = Math.min(w, h) * 0.5;
  const rings = 28;
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < rings; i++) {
    const t = i / rings;
    const bandIdx = Math.floor(t * freq.length * 0.7);
    const v = isPlaying ? (freq[bandIdx] ?? 0) / 255 : 0;
    const r = t * maxR + Math.sin(phase * 1.2 + i * 0.3) * 6 + v * 28;
    const hue = (phase * 36 + i * 14) % 360;
    ctx.strokeStyle = `hsla(${hue}, 75%, ${50 + v * 20}%, ${0.25 + v * 0.5})`;
    ctx.lineWidth = 1 + v * 5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";
}

// --- Particle: radial emanating dots ---
function drawParticle(
  ctx: CanvasRenderingContext2D,
  freq: Uint8Array,
  w: number,
  h: number,
  isPlaying: boolean,
  phase: number,
) {
  const cx = w / 2;
  const cy = h / 2;
  const maxR = Math.min(w, h) * 0.48;
  const dots = 180;
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < dots; i++) {
    const angle = (i / dots) * Math.PI * 2 + phase * 0.18;
    const bandIdx = Math.floor((i / dots) * freq.length * 0.5);
    const v = isPlaying ? (freq[bandIdx] ?? 0) / 255 : 0.05;
    const noise = (Math.sin(phase * 2 + i * 0.4) * 0.5 + 0.5) * 0.6;
    const dist = (noise + v) * maxR;
    const x = cx + Math.cos(angle) * dist;
    const y = cy + Math.sin(angle) * dist;
    const hue = (phase * 60 + i * 2) % 360;
    const size = 1.5 + v * 3.5;
    ctx.fillStyle = `hsla(${hue}, 90%, 65%, ${0.3 + v * 0.6})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
}

// --- Alchemy: petal-like radial lines with hue shift ---
function drawAlchemy(
  ctx: CanvasRenderingContext2D,
  freq: Uint8Array,
  w: number,
  h: number,
  isPlaying: boolean,
  phase: number,
) {
  const cx = w / 2;
  const cy = h / 2;
  const baseR = Math.min(w, h) * 0.12;
  const petals = 96;
  ctx.globalCompositeOperation = "lighter";
  ctx.translate(cx, cy);
  ctx.rotate(phase * 0.12);
  for (let i = 0; i < petals; i++) {
    const t = i / petals;
    const bandIdx = Math.floor(t * freq.length * 0.6);
    const v = isPlaying ? (freq[bandIdx] ?? 0) / 255 : 0.08;
    const len = baseR + v * Math.min(w, h) * 0.42;
    const angle = (i / petals) * Math.PI * 2;
    const x = Math.cos(angle) * len;
    const y = Math.sin(angle) * len;
    const hue = (phase * 18 + i * 4) % 360;
    ctx.strokeStyle = `hsla(${hue}, 85%, ${55 + v * 15}%, ${0.5 + v * 0.5})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = "source-over";
}

// --- Bars: classic spectrum (skin-themed) ---
function drawBars(
  ctx: CanvasRenderingContext2D,
  freq: Uint8Array,
  w: number,
  h: number,
  skin: Skin,
  isPlaying: boolean,
) {
  // Solid black under bars so the trail effect doesn't leak
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
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

// --- Wave: oscilloscope ---
function drawWave(
  ctx: CanvasRenderingContext2D,
  time: Uint8Array,
  w: number,
  h: number,
  skin: Skin,
) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
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
