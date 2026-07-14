import { Activity, ClipboardList, Flag, LayoutDashboard, Smile, Sparkles, Stethoscope, Table2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import SyntheticDataBadge from "../common/SyntheticDataBadge";
import type { PracticeType } from "../../types";

const SECTION_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "ai-insights", label: "AI Insights", icon: Sparkles },
  { id: "provider-table", label: "Providers", icon: Table2 },
  { id: "flagged", label: "Flagged", icon: Flag },
];

const VERTICALS: { path: string; label: string; icon: typeof Stethoscope; practiceType: PracticeType }[] = [
  { path: "/dashboard", label: "Medical", icon: Stethoscope, practiceType: "medical" },
  { path: "/dashboard/dental", label: "Dental", icon: Smile, practiceType: "dental" },
];

const DASHBOARD_PATHS = VERTICALS.map((v) => v.path);

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const onDashboard = DASHBOARD_PATHS.includes(location.pathname);

  function goTo(id: string) {
    if (!onDashboard) {
      navigate("/dashboard");
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 80);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-line-grid bg-surface h-screen sticky top-0">
      <div className="h-16 flex items-center gap-2 px-5 border-b border-line-grid">
        <div className="w-8 h-8 rounded-lg bg-chart-1 flex items-center justify-center shrink-0">
          <Activity className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-sm text-ink-primary leading-tight">
          Clearview
          <br />
          Practice Group
        </span>
      </div>

      <div className="px-3 pt-4">
        <p className="px-3 text-xs font-medium text-ink-muted uppercase tracking-wide mb-2">
          Practice
        </p>
        <div className="space-y-1">
          {VERTICALS.map((v) => {
            const active = location.pathname === v.path;
            return (
              <button
                type="button"
                key={v.path}
                onClick={() => navigate(v.path)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition text-left ${
                  active ? "bg-chart-1/10 text-chart-1 font-medium" : "text-ink-secondary hover:bg-plane hover:text-ink-primary"
                }`}
              >
                <v.icon className="w-4 h-4" />
                {v.label}
              </button>
            );
          })}
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 text-xs font-medium text-ink-muted uppercase tracking-wide mb-2">
          Quick nav
        </p>
        {SECTION_ITEMS.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => goTo(item.id)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-ink-secondary hover:bg-plane hover:text-ink-primary transition text-left"
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}

        <button
          type="button"
          onClick={() => navigate("/practice-review")}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-ink-secondary hover:bg-plane hover:text-ink-primary transition text-left"
        >
          <ClipboardList className="w-4 h-4" />
          Practice Review
        </button>
      </nav>

      <div className="px-5 py-4 border-t border-line-grid">
        <SyntheticDataBadge variant="compact" />
      </div>
    </aside>
  );
}
