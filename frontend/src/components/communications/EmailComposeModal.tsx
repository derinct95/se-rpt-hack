import { CheckCircle2, Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import { api } from "../../api/client";
import Modal from "../common/Modal";

interface EmailComposeModalProps {
  open: boolean;
  onClose: () => void;
  providerIds: string[];
  providerNames: string[];
  defaultTopic?: string;
}

export default function EmailComposeModal({ open, onClose, providerIds, providerNames, defaultTopic = "" }: EmailComposeModalProps) {
  const [topic, setTopic] = useState(defaultTopic);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDraft() {
    setDrafting(true);
    setError(null);
    try {
      const result = await api.draftEmail(providerIds, topic || "Performance discussion");
      setSubject(result.subject);
      setBody(result.body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Draft failed");
    } finally {
      setDrafting(false);
    }
  }

  async function handleSend() {
    setSending(true);
    setError(null);
    try {
      await api.sendEmail(providerIds, subject, body);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  function handleClose() {
    setTopic(defaultTopic);
    setSubject("");
    setBody("");
    setSent(false);
    setError(null);
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Email Provider" widthClassName="max-w-lg">
      {sent ? (
        <div className="flex flex-col items-center text-center gap-3 py-6">
          <CheckCircle2 className="w-10 h-10 text-risk-low" />
          <p className="text-sm text-ink-primary font-medium">Email sent (logged to outbox)</p>
          <p className="text-xs text-ink-muted">To: {providerNames.join(", ")}</p>
          <button onClick={handleClose} className="text-sm px-4 py-2 rounded-lg bg-ink-primary text-white hover:bg-ink-primary/90 transition">
            Done
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-ink-muted">To: {providerNames.join(", ") || "No recipients"}</p>
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">Topic</label>
            <div className="flex gap-2">
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Rising denial rate this quarter"
                className="flex-1 text-sm border border-line-axis rounded-lg px-3 py-2"
              />
              <button
                onClick={handleDraft}
                disabled={drafting}
                className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-chart-5/10 text-chart-5 hover:bg-chart-5/20 transition disabled:opacity-50 shrink-0"
              >
                <Sparkles className="w-4 h-4" /> {drafting ? "Drafting..." : "AI Draft"}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full text-sm border border-line-axis rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="w-full text-sm border border-line-axis rounded-lg px-3 py-2 font-sans"
            />
          </div>
          {error && <p className="text-sm text-risk-critical">{error}</p>}
          <div className="flex justify-end gap-2">
            <button onClick={handleClose} className="text-sm px-4 py-2 rounded-lg border border-line-axis hover:bg-plane transition">
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !subject || !body}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-ink-primary text-white hover:bg-ink-primary/90 transition disabled:opacity-60"
            >
              <Mail className="w-4 h-4" /> {sending ? "Sending..." : "Send Email"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
