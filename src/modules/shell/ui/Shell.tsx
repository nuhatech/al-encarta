"use client";
import { useEffect, useState } from "react";
import { useBootSequence } from "./use-boot-sequence";
import { BootScreen } from "./BootScreen";
import { XpSplash } from "./XpSplash";
import { InstallerWizard } from "./InstallerWizard";
import { UserSelectScreen } from "./UserSelectScreen";
import { Desktop } from "./Desktop";
import {
  WindowManagerProvider,
  useWindowManagerState,
} from "./window-manager/use-window-manager";
import { WindowsLayer } from "./window-manager/WindowFrame";
import { EncartaApp } from "@/src/modules/shell/apps/EncartaApp";
import { KutubApp } from "@/src/modules/shell/apps/KutubApp";
import { HilalGlobeApp } from "@/src/modules/shell/apps/HilalGlobeApp";
import { MinesweeperApp } from "@/src/modules/shell/apps/MinesweeperApp";
import { WmpApp } from "@/src/modules/shell/apps/WmpApp";
import { Bsod } from "./easter-eggs/Bsod";
import { AboutDialog } from "./easter-eggs/AboutDialog";
import { RunDialog } from "./easter-eggs/RunDialog";
import { Astrolabe } from "./easter-eggs/Astrolabe";
import { Clippy } from "./easter-eggs/Clippy";
import { useKonami } from "./easter-eggs/use-konami";
import { installAudioUnlock, play } from "@/src/shared/infra/audio/sounds";

export function Shell() {
  const { phase, biosDone, xpSplashDone, installDone, userSelected, skipToDesktop } =
    useBootSequence("bios");

  // Audio unlock once on mount.
  useEffect(() => {
    installAudioUnlock();
  }, []);

  const wmApi = useWindowManagerState();

  // ── Easter egg state ──
  const [bsodOpen, setBsodOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [runOpen, setRunOpen] = useState(false);
  const [astrolabeOpen, setAstrolabeOpen] = useState(false);

  // Konami code → astrolabe
  useKonami(() => {
    play("encartaOpen");
    setAstrolabeOpen(true);
  });

  // Win+R / Ctrl+R → Run dialog (only on desktop phase)
  useEffect(() => {
    if (phase !== "desktop") return;
    const onKey = (e: KeyboardEvent) => {
      // Avoid hijacking native browser refresh — only when no modifier *or*
      // when it's the Windows key combo.
      if ((e.metaKey || e.altKey) && e.key.toLowerCase() === "r") {
        e.preventDefault();
        setRunOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  // ?skip=desktop|encarta|user dev shortcut.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const skip = params.get("skip");
    if (skip === "desktop" || skip === "1" || skip === "encarta") {
      skipToDesktop();
      if (skip === "encarta") {
        setTimeout(() => wmApi.open("encarta"), 0);
      }
    } else if (skip === "user" || skip === "user-select") {
      // Walk the state machine through to user-select.
      biosDone();
      xpSplashDone();
      installDone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onBiosDone = () => {
    play("bootChime");
    biosDone();
  };

  return (
    <WindowManagerProvider value={wmApi}>
      {phase === "bios" && <BootScreen onDone={onBiosDone} />}
      {phase === "xp-splash" && <XpSplash onDone={xpSplashDone} />}
      {phase === "installer" && <InstallerWizard onDone={installDone} />}
      {phase === "user-select" && <UserSelectScreen onUserSelected={userSelected} />}
      {phase === "desktop" && (
        <>
          <Desktop
            onTripleClickWallpaper={() => setBsodOpen(true)}
            onAbout={() => setAboutOpen(true)}
            onRun={() => setRunOpen(true)}
            onShutdown={() => setBsodOpen(true)}
          />
          <WindowsLayer
            renderers={{
              encarta: <EncartaApp />,
              kutub: <KutubApp />,
              hilalglobe: <HilalGlobeApp />,
              minesweeper: <MinesweeperApp />,
              wmp: <WmpApp />,
            }}
          />
          <Clippy onAbout={() => setAboutOpen(true)} />
          {astrolabeOpen && <Astrolabe onClose={() => setAstrolabeOpen(false)} />}
          {aboutOpen && <AboutDialog onClose={() => setAboutOpen(false)} />}
          {runOpen && (
            <RunDialog
              onClose={() => setRunOpen(false)}
              onAbout={() => setAboutOpen(true)}
            />
          )}
          {bsodOpen && <Bsod onDismiss={() => setBsodOpen(false)} />}
        </>
      )}
    </WindowManagerProvider>
  );
}
