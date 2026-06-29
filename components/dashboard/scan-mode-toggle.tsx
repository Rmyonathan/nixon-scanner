import type { ScanMode } from "@/lib/scan-mode";
import { SCAN_MODE_LABELS } from "@/lib/scan-mode";

type ScanModeToggleProps = {
  mode: ScanMode;
  onChange: (mode: ScanMode) => void;
};

export function ScanModeToggle({ mode, onChange }: ScanModeToggleProps) {
  const isSetelah = mode === "setelah_di_pack";

  return (
    <div
      className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
      data-pause-scanner-focus
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Mode scan
        </p>
        <p className="mt-0.5 text-sm text-zinc-600">
          {isSetelah
            ? "Scan untuk menandai resi sebagai dikirim"
            : "Scan untuk menyimpan resi (data lain opsional)"}
        </p>
      </div>

      <div className="inline-flex min-h-11 shrink-0 rounded-xl border border-zinc-200 bg-zinc-100 p-1 shadow-inner">
        <button
          type="button"
          role="switch"
          aria-checked={!isSetelah}
          onClick={() => onChange("sebelum_di_pack")}
          className={`min-h-9 rounded-lg px-3 text-sm font-medium transition sm:px-4 ${
            !isSetelah
              ? "bg-white text-amber-900 shadow-sm ring-1 ring-amber-200"
              : "text-zinc-600 active:bg-zinc-200/80"
          }`}
        >
          {SCAN_MODE_LABELS.sebelum_di_pack}
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={isSetelah}
          onClick={() => onChange("setelah_di_pack")}
          className={`min-h-9 rounded-lg px-3 text-sm font-medium transition sm:px-4 ${
            isSetelah
              ? "bg-white text-blue-900 shadow-sm ring-1 ring-blue-200"
              : "text-zinc-600 active:bg-zinc-200/80"
          }`}
        >
          {SCAN_MODE_LABELS.setelah_di_pack}
        </button>
      </div>
    </div>
  );
}
