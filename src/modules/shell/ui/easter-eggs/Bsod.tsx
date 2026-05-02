"use client";
import { useEffect } from "react";

interface BsodProps {
  onDismiss: () => void;
}

/**
 * Authentic Windows XP BSOD recreation. Auto-dismisses after 3.5s, or on
 * any keypress / click (the original asked you to press a key — same here).
 */
export function Bsod({ onDismiss }: BsodProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    const onKey = () => onDismiss();
    window.addEventListener("keydown", onKey, { once: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [onDismiss]);

  return (
    <div
      onClick={onDismiss}
      style={{
        position: "fixed",
        inset: 0,
        background: "#0000aa",
        color: "#fff",
        fontFamily: "'Lucida Console', 'Courier New', monospace",
        fontSize: 16,
        lineHeight: 1.5,
        padding: "60px 80px",
        zIndex: 99999,
        cursor: "pointer",
        whiteSpace: "pre-wrap",
      }}
    >
      <p style={{ margin: 0, marginBottom: 24 }}>
        A problem has been detected and Windows has been shut down to prevent
        damage to your computer.
      </p>
      <p style={{ margin: 0, marginBottom: 24, fontWeight: 700 }}>
        WIN32K_DEFEND_HACK_FAILURE
      </p>
      <p style={{ margin: 0, marginBottom: 24 }}>
        If this is the first time you've seen this Stop error screen, restart
        your computer. If this screen appears again, follow these steps:
      </p>
      <p style={{ margin: 0, marginBottom: 8 }}>
        Check to make sure any new hardware or software is properly installed.
        If this is a new installation, ask your hardware or software
        manufacturer for any Windows updates you might need.
      </p>
      <p style={{ margin: 0, marginBottom: 24 }}>
        If problems continue, disable or remove any newly installed hardware
        or software. Disable BIOS memory options such as caching or shadowing.
        If you need to use Safe Mode to remove or disable components, restart
        your computer, press F8 to select Advanced Startup Options, and then
        select Safe Mode.
      </p>
      <p style={{ margin: 0, marginBottom: 8 }}>Technical information:</p>
      <p style={{ margin: 0, marginBottom: 24 }}>
        *** STOP: 0x000000DE (0xC0000005, 0xFC976DEF, 0x00000000, 0x00000000)
      </p>
      <p style={{ margin: 0, marginBottom: 8 }}>
        Beginning dump of physical memory
      </p>
      <p style={{ margin: 0 }}>
        Physical memory dump complete.{"\n"}Contact your system administrator
        or technical support group for further assistance.
      </p>
      <p
        style={{
          marginTop: 36,
          fontSize: 12,
          color: "#9999ff",
          fontStyle: "italic",
        }}
      >
        (Press any key, click, or wait 3 seconds — DefendHack 2026 easter egg)
      </p>
    </div>
  );
}
