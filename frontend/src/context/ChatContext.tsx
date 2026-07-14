import { createContext, useContext, useState, type ReactNode } from "react";
import { api } from "../api/client";
import type { ChatMessage } from "../types";

interface ChatContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  messages: ChatMessage[];
  sending: boolean;
  available: boolean;
  sendMessage: (text: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [available, setAvailable] = useState(true);

  async function sendMessage(text: string) {
    if (!text.trim()) return;
    const userMessage: ChatMessage = { role: "user", content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setSending(true);
    try {
      const result = await api.chat(nextMessages);
      setAvailable(result.available);
      setMessages([...nextMessages, { role: "assistant", content: result.reply, toolsUsed: result.toolCalls.map((t) => t.tool) }]);
    } catch (err) {
      setMessages([...nextMessages, { role: "assistant", content: err instanceof Error ? err.message : "Something went wrong." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <ChatContext.Provider
      value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false), messages, sending, available, sendMessage }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
