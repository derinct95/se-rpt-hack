import { BookOpen, HelpCircle, LogOut, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SyntheticDataBadge from "../common/SyntheticDataBadge";

interface TopbarProps {
  onOpenPalette: () => void;
  onStartTour: () => void;
  onOpenGuide: () => void;
}

export default function Topbar({ onOpenPalette, onStartTour, onOpenGuide }: TopbarProps) {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [helpOpen, setHelpOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="h-16 border-b border-line-grid bg-surface flex items-center gap-4 px-6 sticky top-0 z-40">
      <h1 className="text-sm font-semibold text-ink-primary">Clearview Medical Group</h1>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          data-tour="quick-nav"
          onClick={onOpenPalette}
          title="Quick nav (Ctrl K)"
          className="w-9 h-9 flex items-center justify-center rounded-full text-ink-secondary hover:bg-plane transition"
        >
          <kbd className="text-[10px] font-semibold text-ink-muted">⌘K</kbd>
        </button>
        <div className="md:hidden">
          <SyntheticDataBadge variant="compact" />
        </div>
        <div className="relative" data-tour="help-menu">
          <button
            type="button"
            onClick={() => setHelpOpen((v) => !v)}
            className="w-9 h-9 flex items-center justify-center rounded-full text-ink-secondary hover:bg-plane transition"
            title="Help & guide"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          {helpOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-surface border border-line-grid rounded-xl shadow-lg p-2 z-50">
              <button
                type="button"
                onClick={() => {
                  setHelpOpen(false);
                  onOpenGuide();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-ink-secondary hover:bg-plane transition text-left"
              >
                <BookOpen className="w-4 h-4" /> View full guide
              </button>
              <button
                type="button"
                onClick={() => {
                  setHelpOpen(false);
                  onStartTour();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-ink-secondary hover:bg-plane transition text-left"
              >
                <Sparkles className="w-4 h-4" /> Take a tour
              </button>
              <p className="px-3 py-2 text-xs text-ink-muted">
                Press <kbd className="bg-plane border border-line-grid rounded px-1">Ctrl K</kbd> to
                quickly jump to any provider or section.
              </p>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-plane transition"
          >
            <div className="w-8 h-8 rounded-full bg-chart-5 text-white flex items-center justify-center text-sm font-medium">
              {session?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <span className="text-sm text-ink-primary">{session?.name ?? "User"}</span>
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-surface border border-line-grid rounded-xl shadow-lg p-2 z-50">
              <div className="px-3 py-2 text-xs text-ink-muted truncate">{session?.email}</div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-risk-critical hover:bg-plane transition text-left"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
