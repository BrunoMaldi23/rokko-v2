import { useState } from "react";
import { exportMockup } from "@/canvas/realisticRenderer";
import type { ExportFormat, MockupSnapshot } from "@/types/mockup.types";

type ExportButtonProps = {
  snapshot: MockupSnapshot | null;
  fileName: string;
};

export default function ExportButton({ snapshot, fileName }: ExportButtonProps) {
  const [format, setFormat] = useState<ExportFormat>("png");
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (!snapshot) return;
    setExporting(true);
    try {
      await exportMockup(snapshot, format, fileName);
    } catch (error) {
      alert(error instanceof Error ? error.message : "No se pudo exportar el mockup.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="grid grid-cols-[0.8fr_1fr] gap-2">
      <select
        value={format}
        onChange={(event) => setFormat(event.target.value as ExportFormat)}
        className="h-10 rounded-xl border border-white/18 bg-white px-2 text-xs font-black text-[#3f5258] outline-none focus:border-[#46b9c8]"
      >
        <option value="png">PNG</option>
        <option value="jpg">JPG</option>
      </select>
      <button
        type="button"
        disabled={!snapshot || exporting}
        onClick={() => void handleExport()}
        className="h-10 rounded-xl bg-[#46b9c8] px-3 text-xs font-black text-white shadow-sm shadow-[#46b9c8]/20 transition hover:bg-[#0b7280] disabled:cursor-not-allowed disabled:opacity-45"
      >
        {exporting ? "Exportando..." : "Exportar 2x"}
      </button>
    </div>
  );
}
