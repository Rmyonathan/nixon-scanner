import type { DataViewMode } from "@/lib/data-view-mode";
import { DATA_VIEW_LABELS } from "@/lib/data-view-mode";

type DataViewToggleProps = {
  mode: DataViewMode;
  todayLabel: string;
  onChange: (mode: DataViewMode) => void;
};

export function DataViewToggle({
  mode,
  todayLabel,
  onChange,
}: DataViewToggleProps) {
  const isToday = mode === "today";

  return (
    <div
      className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
      data-pause-scanner-focus
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Tampilan data
        </p>
        <p className="mt-0.5 text-sm text-zinc-600">
          {isToday
            ? `Menampilkan resi diperbarui hari ini (${todayLabel})`
            : "Menampilkan semua resi yang dimuat"}
        </p>
      </div>

      <div className="inline-flex min-h-11 shrink-0 rounded-xl border border-zinc-200 bg-zinc-100 p-1 shadow-inner">
        <button
          type="button"
          role="switch"
          aria-checked={isToday}
          onClick={() => onChange("today")}
          className={`min-h-9 rounded-lg px-3 text-sm font-medium transition sm:px-4 ${
            isToday
              ? "bg-white text-sky-900 shadow-sm ring-1 ring-sky-200"
              : "text-zinc-600 active:bg-zinc-200/80"
          }`}
        >
          {DATA_VIEW_LABELS.today}
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={!isToday}
          onClick={() => onChange("all")}
          className={`min-h-9 rounded-lg px-3 text-sm font-medium transition sm:px-4 ${
            !isToday
              ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-300"
              : "text-zinc-600 active:bg-zinc-200/80"
          }`}
        >
          {DATA_VIEW_LABELS.all}
        </button>
      </div>
    </div>
  );
}
