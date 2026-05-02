"use client";
import { useEffect, useState } from "react";

interface BootScreenProps {
  onDone: () => void;
}

const LINES: ReadonlyArray<{ text: string; delayMs: number }> = [
  { text: "Award Modular BIOS v6.00PG, An Energy Star Ally", delayMs: 200 },
  { text: "Copyright (C) 1984-2001, Award Software, Inc.", delayMs: 80 },
  { text: "", delayMs: 60 },
  { text: "ASUS P3B-F ACPI BIOS Revision 1014.005", delayMs: 250 },
  { text: "", delayMs: 60 },
  { text: "Main Processor : Intel Pentium III 866MHz", delayMs: 220 },
  { text: "Memory Testing : 524288K OK", delayMs: 600 },
  { text: "Memory Frequency For DDR : 133MHz (PC133)", delayMs: 80 },
  { text: "", delayMs: 80 },
  { text: "Detecting IDE Primary Master  ... ST320423A", delayMs: 250 },
  { text: "Detecting IDE Primary Slave   ... LITE-ON CD-ROM LTN-302L", delayMs: 380 },
  { text: "Detecting IDE Secondary Master... None", delayMs: 220 },
  { text: "", delayMs: 100 },
  { text: "Press DEL to enter SETUP", delayMs: 200 },
  { text: "", delayMs: 300 },
  { text: "Starting Windows XP...", delayMs: 700 },
];

export function BootScreen({ onDone }: BootScreenProps) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (shown >= LINES.length) {
      const t = setTimeout(onDone, 800);
      return () => clearTimeout(t);
    }
    const line = LINES[shown];
    if (!line) return;
    const t = setTimeout(() => setShown(shown + 1), line.delayMs);
    return () => clearTimeout(t);
  }, [shown, onDone]);

  return (
    <div
      onClick={() => setShown(LINES.length)}
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        color: "#c0c0c0",
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
        fontSize: 14,
        lineHeight: "18px",
        padding: 24,
        whiteSpace: "pre",
        cursor: "pointer",
        overflow: "hidden",
      }}
      title="Cliquer pour passer"
    >
      {LINES.slice(0, shown).map((l, i) => (
        <div key={i}>{l.text || " "}</div>
      ))}
      <span style={{ opacity: shown < LINES.length ? 1 : 0 }}>_</span>
    </div>
  );
}
