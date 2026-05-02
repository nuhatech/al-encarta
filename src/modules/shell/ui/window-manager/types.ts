export type AppId =
  | "encarta"
  | "kutub"
  | "hilalglobe"
  | "nuhatech"
  | "minesweeper"
  | "wmp";

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
    title: "Internet Explorer — Kutub.io",
    icon: "/IE6-icon.webp",
    defaultW: 1000,
    defaultH: 680,
    bare: true,
  },
  hilalglobe: {
    id: "hilalglobe",
    title: "Internet Explorer — Hilal Globe",
    icon: "/IE6-icon.webp",
    defaultW: 1000,
    defaultH: 680,
    bare: true,
  },
  nuhatech: {
    id: "nuhatech",
    title: "Internet Explorer — NuhaTech",
    icon: "/IE6-icon.webp",
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
  wmp: {
    id: "wmp",
    title: "Windows Media Player",
    icon: "/wmp-icon.webp",
    defaultW: 980,
    defaultH: 680,
    bare: true,
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
