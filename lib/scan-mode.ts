export type ScanMode = "sebelum_di_pack" | "setelah_di_pack";

const STORAGE_KEY = "scanner_scan_mode";

export function getStoredScanMode(): ScanMode {
  if (typeof window === "undefined") return "sebelum_di_pack";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "setelah_di_pack") return "setelah_di_pack";
  return "sebelum_di_pack";
}

export function storeScanMode(mode: ScanMode) {
  localStorage.setItem(STORAGE_KEY, mode);
}

export const SCAN_MODE_LABELS: Record<ScanMode, string> = {
  sebelum_di_pack: "Sebelum di pack",
  setelah_di_pack: "Setelah di pack",
};
