import { CheckCircle2, Download, Upload, XCircle } from "lucide-react";
import { useRef, useState } from "react";
import { api } from "../../api/client";
import type { ImportPreviewResult, Provider } from "../../types";
import ImportWizardModal from "./ImportWizardModal";

interface ExportImportBarProps {
  onImported: (count: number) => void;
}

export default function ExportImportBar({ onImported }: ExportImportBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewing(true);
    setStatus(null);
    try {
      const result = await api.previewImport(file);
      setPreview(result);
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Import preview failed" });
    } finally {
      setPreviewing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleImported(created: Provider[]) {
    setStatus({ type: "success", message: `Imported ${created.length} provider(s) successfully.` });
    onImported(created.length);
  }

  return (
    <div data-tour="export-import" className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex gap-2">
        <a
          href={api.exportUrl("all")}
          download
          className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-line-axis text-ink-secondary hover:bg-plane transition"
        >
          <Download className="w-4 h-4" /> Export CSV
        </a>
        <a
          href={api.exportUrl("flagged")}
          download
          className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-line-axis text-ink-secondary hover:bg-plane transition"
        >
          <Download className="w-4 h-4" /> Export Flagged
        </a>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={previewing}
          className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-ink-primary text-white hover:bg-ink-primary/90 transition disabled:opacity-60"
        >
          <Upload className="w-4 h-4" /> {previewing ? "Analyzing..." : "Import (FHIR/HL7/CSV)"}
        </button>
        <input ref={fileInputRef} type="file" accept=".csv,.json,.hl7,.txt" className="hidden" onChange={handleFileChange} />
      </div>

      {status && (
        <div
          className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg ${
            status.type === "success" ? "bg-risk-low/10 text-risk-low" : "bg-risk-critical/10 text-risk-critical"
          }`}
        >
          {status.type === "success" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          {status.message}
        </div>
      )}

      <ImportWizardModal preview={preview} onClose={() => setPreview(null)} onImported={handleImported} />
    </div>
  );
}
