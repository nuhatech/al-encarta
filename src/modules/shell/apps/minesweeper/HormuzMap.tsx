"use client";

/**
 * Stylised Strait of Hormuz background, rendered behind the minesweeper grid.
 *
 *  ┌─ Iran ───────────────────────────────────────────────────┐
 *  │                                                          │
 *  │                       Strait of Hormuz                   │
 *  │                                                          │
 *  └────────── UAE / Oman ────────────────────────────────────┘
 *
 * Cells overlay this map with semi-transparent tiles so the geography
 * remains readable without competing with gameplay.
 */
export function HormuzMap() {
  return (
    <svg
      viewBox="0 0 600 500"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
      aria-hidden
    >
      <defs>
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5fa8d6" />
          <stop offset="100%" stopColor="#2a6da8" />
        </linearGradient>
        <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d6c79a" />
          <stop offset="100%" stopColor="#b09c68" />
        </linearGradient>
      </defs>

      {/* Water */}
      <rect x="0" y="0" width="600" height="500" fill="url(#water)" />

      {/* Iran (north) */}
      <path
        d="M 0,0 L 600,0 L 600,180 Q 540,165 480,175 Q 420,185 380,170 Q 320,155 260,165 Q 200,178 140,170 Q 80,160 0,170 Z"
        fill="url(#land)"
        stroke="#7a6940"
        strokeWidth="1.5"
      />

      {/* UAE / Oman (south) — Musandam peninsula in the middle pinches the strait */}
      <path
        d="M 0,500 L 600,500 L 600,360 Q 540,355 500,345 Q 470,335 440,330 Q 400,320 380,290 Q 360,265 340,275 Q 320,290 300,295 Q 280,305 260,310 Q 220,320 180,335 Q 120,350 60,355 Q 30,360 0,365 Z"
        fill="url(#land)"
        stroke="#7a6940"
        strokeWidth="1.5"
      />

      {/* Labels — tiny, only readable when looking carefully */}
      <text
        x="20"
        y="45"
        fill="#fff"
        fontSize="14"
        fontFamily="Tahoma, sans-serif"
        fontWeight="700"
        opacity="0.6"
        style={{ letterSpacing: 2 }}
      >
        IRAN
      </text>
      <text
        x="20"
        y="490"
        fill="#fff"
        fontSize="14"
        fontFamily="Tahoma, sans-serif"
        fontWeight="700"
        opacity="0.6"
        style={{ letterSpacing: 2 }}
      >
        OMAN
      </text>
      <text
        x="540"
        y="490"
        fill="#fff"
        fontSize="14"
        fontFamily="Tahoma, sans-serif"
        fontWeight="700"
        opacity="0.6"
        style={{ letterSpacing: 2 }}
      >
        ÉAU
      </text>
      <text
        x="240"
        y="270"
        fill="#fff"
        fontSize="11"
        fontFamily="Georgia, serif"
        fontStyle="italic"
        opacity="0.55"
      >
        Détroit d&apos;Ormuz
      </text>

      {/* Tiny ship icon to suggest commerce */}
      <text x="100" y="240" fontSize="14" opacity="0.5" aria-hidden>
        🚢
      </text>
      <text x="450" y="265" fontSize="14" opacity="0.5" aria-hidden>
        🛢
      </text>
    </svg>
  );
}
