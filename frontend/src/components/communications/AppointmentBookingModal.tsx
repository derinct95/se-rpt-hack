import { CalendarPlus, CheckCircle2, Sparkles } from "lucide-react";
import { useState } from "react";
import { api } from "../../api/client";
import Modal from "../common/Modal";

interface AppointmentBookingModalProps {
  open: boolean;
  onClose: () => void;
  providerIds: string[];
  providerNames: string[];
  defaultTopic?: string;
}

export default function AppointmentBookingModal({ open, onClose, providerIds, providerNames, defaultTopic = "" }: AppointmentBookingModalProps) {
  const [topic, setTopic] = useState(defaultTopic);
  const [agenda, setAgenda] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSuggestAgenda() {
    setSuggesting(true);
    setError(null);
    try {
      const result = await api.suggestAgenda(providerIds, topic || "Performance review");
      setAgenda(result.body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suggestion failed");
    } finally {
      setSuggesting(false);
    }
  }

  async function handleBook() {
    if (!topic || !scheduledAt) return;
    setBooking(true);
    setError(null);
    try {
      await api.createAppointment(providerIds, topic, agenda, scheduledAt);
      setBooked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setBooking(false);
    }
  }

  function handleClose() {
    setTopic(defaultTopic);
    setAgenda("");
    setScheduledAt("");
    setBooked(false);
    setError(null);
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Schedule a Meeting" widthClassName="max-w-lg">
      {booked ? (
        <div className="flex flex-col items-center text-center gap-3 py-6">
          <CheckCircle2 className="w-10 h-10 text-risk-low" />
          <p className="text-sm text-ink-primary font-medium">Appointment booked</p>
          <p className="text-xs text-ink-muted">With: {providerNames.join(", ")} — a confirmation email has been sent.</p>
          <button onClick={handleClose} className="text-sm px-4 py-2 rounded-lg bg-ink-primary text-white hover:bg-ink-primary/90 transition">
            Done
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-ink-muted">With: {providerNames.join(", ") || "No attendees"}</p>
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">Topic</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Quarterly performance review"
              className="w-full text-sm border border-line-axis rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">Date &amp; Time</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full text-sm border border-line-axis rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-ink-secondary">Agenda</label>
              <button
                onClick={handleSuggestAgenda}
                disabled={suggesting}
                className="flex items-center gap-1 text-xs text-chart-5 hover:underline disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" /> {suggesting ? "Suggesting..." : "AI Suggest"}
              </button>
            </div>
            <textarea
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              rows={6}
              className="w-full text-sm border border-line-axis rounded-lg px-3 py-2 font-sans"
            />
          </div>
          {error && <p className="text-sm text-risk-critical">{error}</p>}
          <div className="flex justify-end gap-2">
            <button onClick={handleClose} className="text-sm px-4 py-2 rounded-lg border border-line-axis hover:bg-plane transition">
              Cancel
            </button>
            <button
              onClick={handleBook}
              disabled={booking || !topic || !scheduledAt}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-ink-primary text-white hover:bg-ink-primary/90 transition disabled:opacity-60"
            >
              <CalendarPlus className="w-4 h-4" /> {booking ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
