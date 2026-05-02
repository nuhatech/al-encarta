export interface Track {
  readonly id: string;
  readonly title: string;
  readonly author: string;
  readonly album?: string;
  readonly src: string; // /audio/...mp3
  readonly durationSec?: number;
  readonly era?: string; // e.g. "9e siècle"
  readonly art?: string; // optional cover image path
}

export interface Skin {
  readonly id: string;
  readonly displayName: string;
  readonly outerStart: string;
  readonly outerEnd: string;
  readonly accent: string;
  readonly accentSoft: string;
  readonly screen: string; // central canvas background
  readonly text: string;
  readonly subtext: string;
}

export type WmpView = "now-playing" | "library" | "radio" | "skin" | "visualizations";

export interface RadioStation {
  readonly id: string;
  readonly name: string;
  readonly tagline: string;
  readonly bitrate: string;
  readonly online: boolean;
}

export interface VisualizationMode {
  readonly id: string;
  readonly name: string;
}
