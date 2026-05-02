export type AppId = "encarta" | "kutub" | "hilalglobe" | "minesweeper";

export interface AppMeta {
  id: AppId;
  title: string;
  icon: string; // path to icon image (small, ~16x16 in taskbar)
  defaultW: number;
  defaultH: number;
  /** Whether the app body should fill the frame without padding (e.g. iframes). */
  bare?: boolean;
}

export const APP_REGISTRY: Record<AppId, AppMeta> = {
  encarta: {
    id: "encarta",
    title: "Microsoft Encarta — Reference Library 2002",
    icon: "/encarta-2002-icon.webp",
    defaultW: 1100,
    defaultH: 720,
    bare: true,
  },
  kutub: {
    id: "kutub",
    title: "Kutub — Bibliothèque arabe classique",
    icon: "/kutub-logo.png",
    defaultW: 1000,
    defaultH: 680,
    bare: true,
  },
  hilalglobe: {
    id: "hilalglobe",
    title: "Hilal Globe — Carte de visibilité du croissant",
    icon: "/hilal-logo.png",
    defaultW: 1000,
    defaultH: 680,
    bare: true,
  },
  minesweeper: {
    id: "minesweeper",
    title: "Démineur — Détroit d'Ormuz",
    icon: "/minesweeper.png",
    defaultW: 540,
    defaultH: 600,
    bare: false,
  },
};

export interface ManagedWindow {
  appId: AppId;
  x: number;
  y: number;
  w: number;
  h: number;
  minimized: boolean;
}
