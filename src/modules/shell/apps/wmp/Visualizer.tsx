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

export const VISUALIZATION_MODES: ReadonlyArray<VisualizationMode> = [
  { id: "bars", name: "Barres" },
  { id: "wave", name: "Forme d'onde" },
  { id: "ambient", name: "Ambient nuit" },
  { id: "rosette", name: "Rosette polaire" },
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
      ctx.clearRect(0, 0, w, h);

      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, skin.screen);
      bg.addColorStop(1, "#000");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      if (mode === "bars") {
        getFrequencyData(freq);
        drawBars(ctx, freq, w, h, skin, isPlaying);
      } else if (mode === "wave") {
        getTimeDomainData(time);
        drawWave(ctx, time, w, h, skin);
      } else if (mode === "ambient") {
        getFrequencyData(freq);
        drawAmbient(ctx, freq, w, h, skin, phaseRef.current);
      } else if (mode === "rosette") {
        getFrequencyData(freq);
        drawRosette(ctx, freq, w, h, skin, phaseRef.current);
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

    // Top "ledger" tick — classic WMP look
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

function drawAmbient(
  ctx: CanvasRenderingContext2D,
  freq: Uint8Array,
  w: number,
  h: number,
  skin: Skin,
  phase: number,
) {
  // Average bands then draw soft circles like a lava lamp.
  const slices = 6;
  const seg = Math.floor(freq.length / slices);
  for (let i = 0; i < slices; i++) {
    let sum = 0;
    for (let j = 0; j < seg; j++) sum += freq[i * seg + j] ?? 0;
    const avg = sum / seg / 255;
    const r = 30 + avg * 90;
    const cx = (Math.sin(phase * (0.4 + i * 0.13)) * 0.5 + 0.5) * w;
    const cy = (Math.cos(phase * (0.3 + i * 0.17)) * 0.5 + 0.5) * h;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, hexA(skin.accent, 0.45));
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawRosette(
  ctx: CanvasRenderingContext2D,
  freq: Uint8Array,
  w: number,
  h: number,
  skin: Skin,
  phase: number,
) {
  const cx = w / 2;
  const cy = h / 2;
  const baseR = Math.min(w, h) * 0.18;
  const petals = 64;
  ctx.translate(cx, cy);
  ctx.rotate(phase * 0.18);
  for (let i = 0; i < petals; i++) {
    const t = i / petals;
    const idx = Math.floor(t * freq.length * 0.7);
    const v = (freq[idx] ?? 0) / 255;
    const len = baseR + v * Math.min(w, h) * 0.32;
    const angle = (i / petals) * Math.PI * 2;
    const x = Math.cos(angle) * len;
    const y = Math.sin(angle) * len;
    ctx.strokeStyle = i % 2 === 0 ? skin.accent : skin.accentSoft;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function hexA(hex: string, alpha: number): string {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
