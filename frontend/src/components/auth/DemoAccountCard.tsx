import { ShieldCheck, UserRound } from "lucide-react";
import type { DemoAccount } from "../../types";

interface DemoAccountCardProps {
  account: DemoAccount;
  onSelect: () => void;
  disabled?: boolean;
}

export default function DemoAccountCard({ account, onSelect, disabled }: DemoAccountCardProps) {
  const Icon = account.role === "practice_admin" ? ShieldCheck : UserRound;
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className="w-full flex items-center gap-3 rounded-xl border border-line-axis p-3.5 text-left hover:border-chart-1 hover:bg-plane transition disabled:opacity-60"
    >
      <div className="w-9 h-9 rounded-lg bg-chart-1/10 flex items-center justify-center shrink-0">
        <Icon className="w-4.5 h-4.5 text-chart-1" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink-primary">{account.displayName}</p>
        <p className="text-xs text-ink-muted truncate">{account.description}</p>
      </div>
    </button>
  );
}
