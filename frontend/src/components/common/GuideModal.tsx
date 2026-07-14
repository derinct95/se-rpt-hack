import {
  BarChart3, Bot, Calendar, ClipboardList, FileText, Filter, GitCompareArrows,
  History, Mail, ShieldAlert, Sparkles, Upload,
} from "lucide-react";
import Modal from "./Modal";

const SECTIONS: { icon: typeof Bot; title: string; description: string }[] = [
  {
    icon: BarChart3,
    title: "Dashboard overview",
    description: "The top KPI tiles summarize total providers, average performance score, providers at critical/high risk, and the current top performer. Recently Viewed and Recent Activity rails below the header give quick access to what you've been working on.",
  },
  {
    icon: Sparkles,
    title: "AI Proactive Insights",
    description: "Claude reasons over every provider's live metrics to surface the 4-8 most important, actionable findings -- revenue risks, compliance concerns, and standout performers -- not just min/max lookups. Falls back to rule-based analysis if AI is unavailable.",
  },
  {
    icon: Filter,
    title: "Provider table & filters",
    description: "Filter the roster by Department, Risk Level, and Quality Score band, or switch to the Flagged for Review tab. A stuck-at-risk badge flags providers who've stayed at high/critical risk for 2+ consecutive quarters.",
  },
  {
    icon: GitCompareArrows,
    title: "Compare mode",
    description: "Select up to 4 providers via the compare toggle in the table to open a side-by-side view: scores, a full metrics table, and an overlaid radar chart. Shareable as a URL.",
  },
  {
    icon: ClipboardList,
    title: "Provider detail panel",
    description: "Click any provider for a resizable, maximizable panel with four tabs: Overview (score, trend, AI insights), Metrics (weekly/monthly/quarterly/yearly period picker with per-metric drilldown charts), Claims History (split by outcome with a full claim detail popup), and Actions (recommendations you can move to review and mark complete).",
  },
  {
    icon: Mail,
    title: "Email & scheduling",
    description: "Email a provider (or a whole compare group) with an AI-drafted message, or book a performance-review meeting with an AI-suggested agenda -- both logged to an in-app outbox, never sent to a real address.",
  },
  {
    icon: Bot,
    title: "AI chat assistant",
    description: "The floating assistant (bottom-right) is a real Claude Agent SDK agent with tool access: it can look up providers, pull claims, compare providers, summarize a department, and search a payer-policy knowledge base.",
  },
  {
    icon: FileText,
    title: "Practice review & reports",
    description: "Generate a weekly/monthly/quarterly AI practice review, or download a per-provider PDF/CSV report -- both include a Claims Summary and handle missing data with a placeholder, never a blank cell.",
  },
  {
    icon: Upload,
    title: "Data import & export",
    description: "Import providers from CSV, FHIR, or HL7v2 -- the wizard auto-detects the format and previews what it parsed before you commit. Export the full roster or just the flagged list as CSV.",
  },
  {
    icon: History,
    title: "Command palette",
    description: "Press Ctrl K (or the ⌘K icon in the top bar) to jump straight to any provider or section without scrolling.",
  },
  {
    icon: ShieldAlert,
    title: "Synthetic data only",
    description: "Every provider, claim, and metric in this application is 100% synthetically generated. No real patient or provider PHI is used anywhere -- see the banner on the login screen and sidebar.",
  },
  {
    icon: Calendar,
    title: "\"Trend\" explained",
    description: "The up/down/flat trend badge shows whether a provider's score moved meaningfully over the recent period -- it's a leading indicator of direction, separate from the risk-level badge which is a point-in-time snapshot. A provider can be \"medium risk\" but trending down, which is exactly the kind of provider worth checking in on before they become high risk.",
  },
];

interface GuideModalProps {
  open: boolean;
  onClose: () => void;
}

export default function GuideModal({ open, onClose }: GuideModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Clearview Medical Group — Dashboard Guide" widthClassName="max-w-2xl">
      <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
        {SECTIONS.map((s) => (
          <div key={s.title} className="flex gap-3">
            <div className="w-9 h-9 rounded-lg bg-chart-1/10 text-chart-1 flex items-center justify-center shrink-0">
              <s.icon className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink-primary">{s.title}</h3>
              <p className="text-xs text-ink-secondary leading-relaxed mt-0.5">{s.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
