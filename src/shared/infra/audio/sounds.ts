"use client";

/**
 * Tiny Y2K sound synthesizer using Web Audio API.
 *
 * No external assets — every sound is generated on the fly. Sound design
 * targets the Win98/Encarta era: short, slightly cheap, recognisable.
 *
 * Browser policy: AudioContext can't start until a user gesture happens.
 * We initialise lazily and silently skip if still suspended; once the user
 * clicks anywhere it auto-resumes.
 */

type Sound =
  | "bootChime"
  | "installTick"
  | "installComplete"
  | "encartaOpen"
  | "click"
  | "error";

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  masterGain = ctx.createGain();
  masterGain.gain.value = 0.35;
  masterGain.connect(ctx.destination);
  return ctx;
}

function resumeIfNeeded(): boolean {
  const c = getCtx();
  if (!c) return false;
  const state: AudioContextState = c.state;
  if (state === "suspended") {
    void c.resume();
    // resume() is async; the next play() call will succeed.
    return false;
  }
  return state === "running";
}

export function setMuted(value: boolean) {
  muted = value;
  if (masterGain) masterGain.gain.value = value ? 0 : 0.35;
}

export function isMuted(): boolean {
  return muted;
}

interface NoteOpts {
  freq: number;
  startAt: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  attack?: number;
  release?: number;
}

function tone(c: AudioContext, dest: AudioNode, opts: NoteOpts) {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = opts.type ?? "sine";
  osc.frequency.value = opts.freq;
  const peak = opts.gain ?? 0.6;
  const attack = opts.attack ?? 0.01;
  const release = opts.release ?? 0.05;
  g.gain.setValueAtTime(0, opts.startAt);
  g.gain.linearRampToValueAtTime(peak, opts.startAt + attack);
  g.gain.linearRampToValueAtTime(
    peak,
    opts.startAt + Math.max(opts.duration - release, attack + 0.001),
  );
  g.gain.linearRampToValueAtTime(0, opts.startAt + opts.duration);
  osc.connect(g);
  g.connect(dest);
  osc.start(opts.startAt);
  osc.stop(opts.startAt + opts.duration + 0.05);
}

function noiseBurst(c: AudioContext, dest: AudioNode, startAt: number, duration: number, gain: number) {
  const buffer = c.createBuffer(1, Math.ceil(c.sampleRate * duration), c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
  const src = c.createBufferSource();
  src.buffer = buffer;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, startAt);
  g.gain.linearRampToValueAtTime(0, startAt + duration);
  src.connect(g);
  g.connect(dest);
  src.start(startAt);
  src.stop(startAt + duration + 0.02);
}

export function play(sound: Sound) {
  if (muted) return;
  const c = getCtx();
  if (!c || !masterGain) return;
  if (!resumeIfNeeded()) return;
  const t = c.currentTime;

  switch (sound) {
    case "bootChime": {
      // Quasi Win98 startup: a low pad + 4-note ascending arpeggio.
      const pad = c.createGain();
      pad.gain.value = 0.15;
      pad.connect(masterGain);
      tone(c, pad, { freq: 110, startAt: t, duration: 1.6, type: "sine", gain: 0.4, attack: 0.3, release: 0.6 });
      tone(c, pad, { freq: 220, startAt: t + 0.05, duration: 1.55, type: "sine", gain: 0.25, attack: 0.4, release: 0.6 });
      const notes = [392, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
      notes.forEach((f, i) => {
        tone(c, masterGain!, {
          freq: f,
          startAt: t + 0.25 + i * 0.18,
          duration: 0.4,
          type: "triangle",
          gain: 0.45,
          attack: 0.02,
          release: 0.18,
        });
      });
      break;
    }
    case "installComplete": {
      const notes = [523.25, 659.25, 783.99]; // C5 E5 G5
      notes.forEach((f, i) => {
        tone(c, masterGain!, {
          freq: f,
          startAt: t + i * 0.1,
          duration: 0.22,
          type: "triangle",
          gain: 0.5,
          attack: 0.01,
          release: 0.12,
        });
      });
      break;
    }
    case "encartaOpen": {
      // Crystalline ding — fundamental + 5th harmonic.
      tone(c, masterGain, { freq: 880, startAt: t, duration: 0.45, type: "sine", gain: 0.5, attack: 0.005, release: 0.4 });
      tone(c, masterGain, { freq: 1320, startAt: t, duration: 0.45, type: "sine", gain: 0.2, attack: 0.005, release: 0.4 });
      tone(c, masterGain, { freq: 1760, startAt: t, duration: 0.3, type: "sine", gain: 0.1, attack: 0.005, release: 0.28 });
      break;
    }
    case "installTick": {
      noiseBurst(c, masterGain, t, 0.04, 0.25);
      tone(c, masterGain, { freq: 1200, startAt: t, duration: 0.04, type: "square", gain: 0.15, attack: 0.001, release: 0.03 });
      break;
    }
    case "click": {
      tone(c, masterGain, {
        freq: 1800,
        startAt: t,
        duration: 0.04,
        type: "triangle",
        gain: 0.18,
        attack: 0.001,
        release: 0.03,
      });
      break;
    }
    case "error": {
      // Classic two-beep error.
      tone(c, masterGain, { freq: 200, startAt: t, duration: 0.18, type: "square", gain: 0.4, attack: 0.005, release: 0.04 });
      tone(c, masterGain, { freq: 200, startAt: t + 0.22, duration: 0.18, type: "square", gain: 0.4, attack: 0.005, release: 0.04 });
      break;
    }
  }
}

/**
 * Hook this on first mount somewhere top-level so AudioContext resumes
 * after the first user interaction (browser policy).
 */
export function installAudioUnlock() {
  if (typeof window === "undefined") return;
  let unlocked = false;
  const unlock = () => {
    if (unlocked) return;
    unlocked = true;
    resumeIfNeeded();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock, { once: false });
  window.addEventListener("keydown", unlock, { once: false });
}
