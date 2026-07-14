import { Sparkles } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import ChatDrawer from "./ChatDrawer";

export default function ChatWidget() {
  const { isOpen, open } = useChat();

  return (
    <>
      {!isOpen && (
        <button
          onClick={open}
          className="fixed bottom-6 right-6 z-[9989] w-16 h-16 rounded-full text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
          style={{ background: "linear-gradient(135deg, #4a3aa7, #e87ba4)" }}
          title="Ask the Clearview AI assistant"
        >
          <span className="absolute inset-0 rounded-full animate-ping opacity-40" style={{ background: "linear-gradient(135deg, #4a3aa7, #e87ba4)" }} />
          <Sparkles className="w-7 h-7 relative z-10" />
        </button>
      )}
      {isOpen && <ChatDrawer />}
    </>
  );
}
