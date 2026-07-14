import { X } from "lucide-react";
import { useEffect } from "react";
import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  widthClassName?: string;
}

export default function Modal({ open, onClose, title, children, widthClassName = "max-w-lg" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-ink-primary/30" onClick={onClose} />
      <div className={`relative w-full ${widthClassName} bg-surface rounded-2xl shadow-2xl border border-ink-primary/10 max-h-[85vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-line-grid sticky top-0 bg-surface">
          <h2 className="text-sm font-semibold text-ink-primary">{title}</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink-primary transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
