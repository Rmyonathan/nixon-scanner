export type DataViewMode = "today" | "all";

const STORAGE_KEY = "scanner_data_view_mode";

export function getStoredDataViewMode(): DataViewMode {
  if (typeof window === "undefined") return "today";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "all") return "all";
  return "today";
}

export function storeDataViewMode(mode: DataViewMode) {
  localStorage.setItem(STORAGE_KEY, mode);
}

export const DATA_VIEW_LABELS: Record<DataViewMode, string> = {
  today: "Hari ini",
  all: "Semua data",
};
