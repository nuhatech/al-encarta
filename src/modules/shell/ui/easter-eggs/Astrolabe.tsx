"use client";
import { useEffect, useRef, useState } from "react";

interface AstrolabeProps {
  onClose: () => void;
}

const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

function toArabicDigits(n: number): string {
  return String(n).replace(/\d/g, (d) => ARABIC_DIGITS[parseInt(d, 10)] ?? d);
}

/**
 * Floating Arabic astrolabe widget — appears after Konami code.
 * Draggable, with an alidade that rotates based on the current time.
 * Pure decoration but instantly evocative for anyone who knows what an
 * astrolabe meant to medieval Arab astronomers.
 */
export function Astrolabe({ onClose }: AstrolabeProps) {
  const [position, setPosition] = useState({ x: 80, y: 80 });
  const [angle, setAngle] = useState(0);
  const dragging = useRef<{ ox: number; oy: number; sx: number; sy: number } | null>(null);

  // Rotate alidade smoothly
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const now = Date.now() / 50;
      setAngle((now / 60) % 360);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    e.preventDefault();
    dragging.current = {
      ox: e.clientX,
      oy: e.clientY,
      sx: position.x,
      sy: position.y,
    };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragging.current;
      if (!d) return;
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 280, d.sx + e.clientX - d.ox)),
        y: Math.max(0, Math.min(window.innerHeight - 280, d.sy + e.clientY - d.oy)),
      });
    };
    const onUp = () => {
      dragging.current = null;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        width: 280,
        zIndex: 4500,
        cursor: "grab",
        userSelect: "none",
      }}
    >
      <div
        className="window"
        style={{
          background: "#1a1a2e",
          color: "#ffd24a",
        }}
      >
        <div className="title-bar">
          <div className="title-bar-text">⌖ Astrolabe — al-asturlab</div>
          <div className="title-bar-controls">
            <button aria-label="Close" onClick={onClose} />
          </div>
        </div>
        <div
          className="window-body"
          style={{
            padding: 8,
            background:
              "radial-gradient(circle at 50% 35%, #1f2950 0%, #0a0e2a 70%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <svg width="240" height="240" viewBox="-130 -130 260 260">
            <defs>
              <radialGradient id="brass" cx="0.5" cy="0.5" r="0.6">
                <stop offset="0%" stopColor="#ffe7a3" />
                <stop offset="60%" stopColor="#c89238" />
                <stop offset="100%" stopColor="#7a5318" />
              </radialGradient>
            </defs>

            {/* Outer disc */}
            <circle r="120" fill="url(#brass)" stroke="#3a2a10" strokeWidth="2" />

            {/* Inner ring */}
            <circle r="100" fill="none" stroke="#3a2a10" strokeWidth="1" />
            <circle r="80" fill="none" stroke="#3a2a10" strokeWidth="0.5" opacity="0.6" />
            <circle r="60" fill="none" stroke="#3a2a10" strokeWidth="0.5" opacity="0.6" />
            <circle r="40" fill="none" stroke="#3a2a10" strokeWidth="0.5" opacity="0.6" />

            {/* 12 zodiac/hour markers with Arabic numerals */}
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
              const xOuter = Math.cos(a) * 110;
              const yOuter = Math.sin(a) * 110;
              const xInner = Math.cos(a) * 100;
              const yInner = Math.sin(a) * 100;
              const xLabel = Math.cos(a) * 90;
              const yLabel = Math.sin(a) * 90;
              const num = toArabicDigits(i === 0 ? 12 : i);
              return (
                <g key={i}>
                  <line
                    x1={xOuter}
                    y1={yOuter}
                    x2={xInner}
                    y2={yInner}
                    stroke="#3a2a10"
                    strokeWidth="1.5"
                  />
                  <text
                    x={xLabel}
                    y={yLabel + 4}
                    textAnchor="middle"
                    fill="#3a2a10"
                    fontSize="11"
                    fontFamily="Georgia, serif"
                    fontWeight="700"
                  >
                    {num}
                  </text>
                </g>
              );
            })}

            {/* 60 minute ticks */}
            {Array.from({ length: 60 }).map((_, i) => {
              const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
              const xOuter = Math.cos(a) * 120;
              const yOuter = Math.sin(a) * 120;
              const xInner = Math.cos(a) * 116;
              const yInner = Math.sin(a) * 116;
              return (
                <line
                  key={i}
                  x1={xOuter}
                  y1={yOuter}
                  x2={xInner}
                  y2={yInner}
                  stroke="#3a2a10"
                  strokeWidth={i % 5 === 0 ? 1.5 : 0.5}
                />
              );
            })}

            {/* Decorative star pattern */}
            {[0, 60, 120, 180, 240, 300].map((deg) => {
              const a = (deg / 360) * Math.PI * 2 - Math.PI / 2;
              return (
                <circle
                  key={deg}
                  cx={Math.cos(a) * 50}
                  cy={Math.sin(a) * 50}
                  r="2.5"
                  fill="#ffd24a"
                  stroke="#3a2a10"
                  strokeWidth="0.5"
                />
              );
            })}

            {/* Alidade (rotating arm) */}
            <g transform={`rotate(${angle})`}>
              <rect x="-3" y="-110" width="6" height="220" fill="#3a2a10" />
              <polygon points="0,-115 -8,-100 8,-100" fill="#3a2a10" />
              <polygon points="0,115 -8,100 8,100" fill="#3a2a10" />
              <circle r="6" fill="#ffd24a" stroke="#3a2a10" strokeWidth="1.5" />
            </g>

            {/* Center pin */}
            <circle r="3" fill="#3a2a10" />
          </svg>

          <div
            style={{
              fontSize: 10,
              color: "#ffd24a",
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              opacity: 0.85,
              textAlign: "center",
            }}
          >
            « L&apos;astrolabe est l&apos;œil ouvert du voyageur sur le ciel. »
            <br />
            <span style={{ fontSize: 9, opacity: 0.7 }}>
              attribué à al-Biruni · al-Qanun al-Mas&apos;udi
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
