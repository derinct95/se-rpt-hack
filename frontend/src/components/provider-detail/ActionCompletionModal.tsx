import { Bell, BellOff, Mail, Phone, Users } from "lucide-react";
import Modal from "../common/Modal";
import type { Action } from "../../types";

export type CompletionMethod = "email" | "phone" | "in_person" | "skip";

interface ActionCompletionModalProps {
  action: Action | null;
  onClose: () => void;
  onChoose: (method: CompletionMethod) => void;
}

const OPTIONS: { key: CompletionMethod; label: string; description: string; icon: typeof Mail }[] = [
  { key: "email", label: "Send an email", description: "Draft and send a message to the provider now.", icon: Mail },
  { key: "phone", label: "Phone call", description: "Log that the provider was notified by phone.", icon: Phone },
  { key: "in_person", label: "In-person meeting", description: "Log that this was discussed in person.", icon: Users },
  { key: "skip", label: "No notification needed", description: "Mark complete without contacting the provider.", icon: BellOff },
];

export default function ActionCompletionModal({ action, onClose, onChoose }: ActionCompletionModalProps) {
  if (!action) return null;

  return (
    <Modal open={!!action} onClose={onClose} title="Mark action complete" widthClassName="max-w-md">
      <div className="space-y-3">
        <div className="flex items-start gap-2 text-sm text-ink-secondary bg-plane rounded-lg p-3">
          <Bell className="w-4 h-4 mt-0.5 text-chart-1 shrink-0" />
          <p>
            <span className="font-medium text-ink-primary">{action.title}</span> will be marked complete. How
            should Clearview notify the provider?
          </p>
        </div>
        <div className="space-y-2">
          {OPTIONS.map(({ key, label, description, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onChoose(key)}
              className="w-full flex items-start gap-3 text-left p-3 rounded-xl border border-line-axis hover:border-chart-1/50 hover:bg-plane/60 transition"
            >
              <Icon className="w-4 h-4 mt-0.5 text-chart-1 shrink-0" />
              <div>
                <p className="text-sm font-medium text-ink-primary">{label}</p>
                <p className="text-xs text-ink-muted">{description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
