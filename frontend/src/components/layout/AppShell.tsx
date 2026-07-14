import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import ChatWidget from "../chat/ChatWidget";
import CompareBar from "../compare/CompareBar";
import CommandPalette from "../common/CommandPalette";
import GuideModal from "../common/GuideModal";
import ProductTour from "../tour/ProductTour";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const TOUR_SEEN_KEY = "ppd_tour_seen";
const TOUR_ANCHOR_SELECTOR = '[data-tour="kpi-row"]';

function waitForElement(selector: string, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const start = Date.now();
    const check = () => {
      if (document.querySelector(selector)) {
        resolve(true);
        return;
      }
      if (Date.now() - start > timeoutMs) {
        resolve(false);
        return;
      }
      setTimeout(check, 150);
    };
    check();
  });
}

export default function AppShell() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [tourRun, setTourRun] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (localStorage.getItem(TOUR_SEEN_KEY)) return;
    let cancelled = false;
    // The tour's first stop lives on the dashboard, which loads its KPIs
    // asynchronously -- starting on a fixed timer would often fire before
    // that data (and its AI insights call) finished, so the tour's target
    // element didn't exist yet and Joyride silently did nothing.
    waitForElement(TOUR_ANCHOR_SELECTOR, 8000).then((found) => {
      if (!cancelled && found) setTourRun(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  function finishTour() {
    setTourRun(false);
    localStorage.setItem(TOUR_SEEN_KEY, "1");
  }

  function startTour() {
    if (location.pathname !== "/dashboard") {
      navigate("/dashboard");
    }
    waitForElement(TOUR_ANCHOR_SELECTOR, 4000).then((found) => {
      if (found) setTourRun(true);
    });
  }

  return (
    <div className="flex min-h-screen bg-plane">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          onOpenPalette={() => setPaletteOpen(true)}
          onStartTour={startTour}
          onOpenGuide={() => setGuideOpen(true)}
        />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <ProductTour run={tourRun} onFinish={finishTour} />
      <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
      <CompareBar />
      <ChatWidget />
    </div>
  );
}
