import { Command } from "cmdk";
import { ClipboardList, Flag, GitCompareArrows, LayoutDashboard, ListChecks, Sparkles, Table2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useChat } from "../../context/ChatContext";
import type { ProviderSummary } from "../../types";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SECTIONS = [
  { id: "overview", label: "Overview / KPIs", icon: LayoutDashboard },
  { id: "ai-insights", label: "AI Proactive Insights", icon: Sparkles },
  { id: "provider-table", label: "Provider Table", icon: Table2 },
  { id: "flagged", label: "Flagged for Review", icon: Flag },
];

export default function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [providers, setProviders] = useState<ProviderSummary[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { open: openChat } = useChat();

  useEffect(() => {
    if (open && providers.length === 0) {
      api.listProviders().then(setProviders).catch(() => {});
    }
  }, [open, providers.length]);

  function goToSection(id: string) {
    onOpenChange(false);
    navigate("/dashboard");
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function goToProvider(id: string, tab?: string) {
    onOpenChange(false);
    navigate(`/providers/${id}${tab ? `?tab=${tab}` : ""}`, { state: { backgroundLocation: location } });
  }

  function goCompare() {
    onOpenChange(false);
    goToSection("provider-table");
  }

  function goPracticeReview() {
    onOpenChange(false);
    navigate("/practice-review");
  }

  function goChat() {
    onOpenChange(false);
    openChat();
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Quick navigation"
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]"
    >
      <div className="fixed inset-0 bg-ink-primary/30" onClick={() => onOpenChange(false)} />
      <div className="relative w-full max-w-lg bg-surface rounded-xl shadow-2xl border border-ink-primary/10 overflow-hidden">
        <Command.Input
          autoFocus
          placeholder="Jump to a provider, action, or section..."
          className="w-full px-4 py-3 text-sm border-b border-line-grid outline-none"
        />
        <Command.List className="max-h-96 overflow-y-auto p-2">
          <Command.Empty className="text-sm text-ink-muted px-3 py-4">No results found.</Command.Empty>

          <Command.Group heading="Quick Commands" className="text-xs font-medium text-ink-muted px-2 py-1">
            <Command.Item
              onSelect={goCompare}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer data-[selected=true]:bg-plane"
            >
              <GitCompareArrows className="w-4 h-4 text-ink-muted" /> Compare providers
            </Command.Item>
            <Command.Item
              onSelect={goChat}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer data-[selected=true]:bg-plane"
            >
              <Sparkles className="w-4 h-4 text-ink-muted" /> Open AI assistant
            </Command.Item>
            <Command.Item
              onSelect={goPracticeReview}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer data-[selected=true]:bg-plane"
            >
              <ClipboardList className="w-4 h-4 text-ink-muted" /> Generate practice review
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Sections" className="text-xs font-medium text-ink-muted px-2 py-1 mt-2">
            {SECTIONS.map((s) => (
              <Command.Item
                key={s.id}
                onSelect={() => goToSection(s.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer data-[selected=true]:bg-plane"
              >
                <s.icon className="w-4 h-4 text-ink-muted" />
                {s.label}
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Providers" className="text-xs font-medium text-ink-muted px-2 py-1 mt-2">
            {providers.map((p) => (
              <Command.Item
                key={p.id}
                value={`${p.name} ${p.specialty}`}
                onSelect={() => goToProvider(p.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer data-[selected=true]:bg-plane"
              >
                <User className="w-4 h-4 text-ink-muted" />
                <span>{p.name}</span>
                <span className="text-ink-muted text-xs ml-auto">{p.specialty}</span>
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Actions" className="text-xs font-medium text-ink-muted px-2 py-1 mt-2">
            {providers.map((p) => (
              <Command.Item
                key={`actions-${p.id}`}
                value={`${p.name} actions`}
                onSelect={() => goToProvider(p.id, "actions")}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer data-[selected=true]:bg-plane"
              >
                <ListChecks className="w-4 h-4 text-ink-muted" />
                <span>{p.name} — Actions</span>
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </div>
    </Command.Dialog>
  );
}
