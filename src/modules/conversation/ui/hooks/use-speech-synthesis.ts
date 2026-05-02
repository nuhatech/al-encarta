"use client";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseSpeechSynthesisOpts {
  lang?: string;
  rate?: number;
  pitch?: number;
  /** Bias the picker toward a male/female voice when available. */
  gender?: "male" | "female";
}

interface UseSpeechSynthesisReturn {
  enabled: boolean;
  speaking: boolean;
  supported: boolean;
  voiceName: string | null;
  toggle: () => void;
  feed: (chunk: string) => void;
  flush: () => void;
  stop: () => void;
  reset: () => void;
}

const SENTENCE_TERMINATORS = /[.!?:;…]+(\s|$)/;

// Heuristics for guessing voice gender from name. Web Speech API doesn't
// expose gender reliably across browsers; names work surprisingly well
// for Microsoft / Apple / Google voices in French and English.
const MALE_HINTS = [
  "paul",
  "claude",
  "thomas",
  "henri",
  "pierre",
  "antoine",
  "daniel",
  "alex",
  "fred",
  "ralph",
  "luca",
  "mathieu",
  "nicolas",
  "guillaume",
  "homme",
  "male",
  "(m)",
  "michael",
  "david",
  "john",
];
const FEMALE_HINTS = [
  "hortense",
  "julie",
  "audrey",
  "amelie",
  "amélie",
  "caroline",
  "sophie",
  "marie",
  "celine",
  "céline",
  "virginie",
  "helena",
  "samantha",
  "victoria",
  "karen",
  "tessa",
  "fiona",
  "moira",
  "femme",
  "female",
  "(f)",
  "anna",
  "elsa",
  "zira",
];

function classifyVoice(name: string): "male" | "female" | "unknown" {
  const n = name.toLowerCase();
  if (MALE_HINTS.some((h) => n.includes(h))) return "male";
  if (FEMALE_HINTS.some((h) => n.includes(h))) return "female";
  return "unknown";
}

/**
 * Web Speech API wrapper tuned for Y2K kitsch + per-personality gender hint.
 *
 * Picks the first French voice matching the requested gender; falls back
 * to any French voice, then any voice. Prefers Microsoft voices for the
 * extra robotic Y2K vibe.
 */
export function useSpeechSynthesis({
  lang = "fr-FR",
  rate = 1,
  pitch = 1,
  gender,
}: UseSpeechSynthesisOpts = {}): UseSpeechSynthesisReturn {
  const [enabled, setEnabled] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const bufferRef = useRef("");

  const supported =
    typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined";

  useEffect(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;

    function pickVoice() {
      const voices = synth.getVoices();
      if (voices.length === 0) return;

      const french = voices.filter((v) => v.lang.startsWith("fr"));
      const pool = french.length > 0 ? french : voices;

      const wantedGender = gender;
      const matchesGender = (v: SpeechSynthesisVoice): boolean => {
        if (!wantedGender) return true;
        const g = classifyVoice(v.name);
        return g === wantedGender;
      };

      // Priority order:
      //   1. French + matches gender + Microsoft (Y2K kitsch)
      //   2. French + matches gender (any vendor)
      //   3. French (any gender)
      //   4. First voice
      const score = (v: SpeechSynthesisVoice) => {
        let s = 0;
        if (v.lang.startsWith("fr")) s += 4;
        if (matchesGender(v)) s += 8;
        if (/microsoft/i.test(v.name)) s += 2;
        if (!v.localService) s += 1; // remote voices often clearer
        return s;
      };

      const sorted = [...pool].sort((a, b) => score(b) - score(a));
      const chosen = sorted[0] ?? voices[0] ?? null;
      setVoice(chosen);
    }

    pickVoice();
    synth.addEventListener("voiceschanged", pickVoice);
    return () => synth.removeEventListener("voiceschanged", pickVoice);
  }, [supported, gender]);

  const speakSentence = useCallback(
    (text: string) => {
      if (!supported) return;
      const trimmed = text.trim();
      if (!trimmed) return;
      const utt = new SpeechSynthesisUtterance(trimmed);
      utt.lang = lang;
      utt.rate = rate;
      utt.pitch = pitch;
      if (voice) utt.voice = voice;
      utt.onstart = () => setSpeaking(true);
      utt.onend = () => {
        if (!window.speechSynthesis.pending && !window.speechSynthesis.speaking) {
          setSpeaking(false);
        }
      };
      utt.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utt);
    },
    [supported, lang, rate, pitch, voice],
  );

  const feed = useCallback(
    (chunk: string) => {
      if (!enabled || !supported) return;
      bufferRef.current += chunk;
      while (true) {
        const buf = bufferRef.current;
        const m = SENTENCE_TERMINATORS.exec(buf);
        if (!m) break;
        const cut = m.index + m[0].length;
        const sentence = buf.slice(0, cut);
        bufferRef.current = buf.slice(cut);
        speakSentence(sentence);
      }
    },
    [enabled, supported, speakSentence],
  );

  const flush = useCallback(() => {
    if (!enabled || !supported) return;
    const remaining = bufferRef.current;
    bufferRef.current = "";
    if (remaining.trim()) speakSentence(remaining);
  }, [enabled, supported, speakSentence]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    bufferRef.current = "";
    setSpeaking(false);
  }, [supported]);

  const reset = useCallback(() => {
    bufferRef.current = "";
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      if (!next && supported) {
        window.speechSynthesis.cancel();
        bufferRef.current = "";
        setSpeaking(false);
      }
      return next;
    });
  }, [supported]);

  return {
    enabled,
    speaking,
    supported,
    voiceName: voice?.name ?? null,
    toggle,
    feed,
    flush,
    stop,
    reset,
  };
}
