import { Send, Sparkles, Wrench } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SlidePanel from "../common/SlidePanel";
import { useChat } from "../../context/ChatContext";

export default function ChatDrawer() {
  const { close, messages, sending, available, sendMessage } = useChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    await sendMessage(text);
  }

  return (
    <SlidePanel
      onClose={close}
      resizable={false}
      defaultWidth={420}
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-chart-5" />
          <h2 className="text-sm font-semibold text-ink-primary">Clearview AI Assistant</h2>
        </div>
      }
    >
      <div className="flex flex-col h-full">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-sm text-ink-muted">
              Ask me to search providers, pull claims, compare providers, summarize a department, or explain a denial
              reason against synthetic payer policy.
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  m.role === "user" ? "bg-chart-1 text-white" : "bg-plane border border-line-grid text-ink-primary"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.toolsUsed && m.toolsUsed.length > 0 && (
                  <p className="text-xs text-ink-muted mt-1.5 flex items-center gap-1">
                    <Wrench className="w-3 h-3" /> Used: {m.toolsUsed.join(", ")}
                  </p>
                )}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-plane border border-line-grid rounded-xl px-3 py-2 text-sm text-ink-muted animate-pulse">
                Thinking...
              </div>
            </div>
          )}
          {!available && (
            <p className="text-xs text-risk-high">AI chat requires an ANTHROPIC_API_KEY on the server.</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-line-grid p-3 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about providers, claims, or denials..."
            className="flex-1 text-sm border border-line-axis rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-chart-1/40"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-ink-primary text-white disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </SlidePanel>
  );
}
