import { Shell } from "@/src/modules/shell/ui/Shell";
import { MobileSplash } from "@/src/modules/shell/ui/MobileSplash";

export default function Home() {
  return (
    <>
      <div className="mobile-only">
        <MobileSplash />
      </div>
      <div className="desktop-only">
        <Shell />
      </div>
    </>
  );
}
