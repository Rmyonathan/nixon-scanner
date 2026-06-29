"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  formatResiError,
  getRecentResi,
  getResiByNumber,
  deleteResi,
  insertResi,
  insertResiScan,
  touchResi,
  updateResi,
  updateResiStatus,
} from "@/lib/resi";
import { getCourierOptions } from "@/lib/courier-options";
import { defaultCourierOptions } from "@/lib/couriers";
import { filterResiRows, filterRowsByDate, getTodayLocalDate, type ResiFilterCourier, type ResiFilterStatus } from "@/lib/resi-filters";
import { playScanSound } from "@/lib/scan-audio";
import { getSupabaseConfigError } from "@/lib/supabase";
import type { CourierOptionRow, ResiRow, ResiStatus } from "@/lib/database.types";
import { CourierSettingsModal } from "@/components/dashboard/courier-settings-modal";
import { DataViewToggle } from "@/components/dashboard/data-view-toggle";
import { NewResiModal } from "@/components/dashboard/new-resi-modal";
import { ResiTable } from "@/components/dashboard/resi-table";
import { ResiToolbar } from "@/components/dashboard/resi-toolbar";
import { ScanModeToggle } from "@/components/dashboard/scan-mode-toggle";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { Toast } from "@/components/dashboard/toast";
import {
  getStoredScanMode,
  storeScanMode,
  type ScanMode,
} from "@/lib/scan-mode";
import {
  getStoredDataViewMode,
  storeDataViewMode,
  type DataViewMode,
} from "@/lib/data-view-mode";

type ModalState = {
  resi: string;
  mode: "new" | "complete" | "edit";
  existing?: ResiRow;
};

export default function DashboardPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [scanBuffer, setScanBuffer] = useState("");
  const [rows, setRows] = useState<ResiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ResiFilterStatus>("all");
  const [courierFilter, setCourierFilter] = useState<ResiFilterCourier>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [scanFilter, setScanFilter] = useState<string | null>(null);
  const [courierOptions, setCourierOptions] = useState<CourierOptionRow[]>(
    defaultCourierOptions(),
  );
  const [showCourierSettings, setShowCourierSettings] = useState(false);
  const [highlightedResi, setHighlightedResi] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [scanMode, setScanMode] = useState<ScanMode>(
    () => getStoredScanMode(),
  );
  const [dataViewMode, setDataViewMode] = useState<DataViewMode>(
    () => getStoredDataViewMode(),
  );

  const effectiveDateFilter =
    dataViewMode === "today" ? getTodayLocalDate() : dateFilter;

  const viewScopedRows = useMemo(
    () => filterRowsByDate(rows, effectiveDateFilter),
    [rows, effectiveDateFilter],
  );

  const displayedRows = useMemo(
    () =>
      filterResiRows(viewScopedRows, {
        scanFilter,
        searchQuery,
        statusFilter,
        courierFilter,
        dateFilter: "",
      }),
    [viewScopedRows, scanFilter, searchQuery, statusFilter, courierFilter],
  );

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(
        new Date(),
      ),
    [],
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const configError = getSupabaseConfigError();
      if (configError) {
        if (!cancelled) {
          setConnectionError(configError);
          setLoading(false);
        }
        return;
      }

      try {
        const limit = dataViewMode === "all" ? 2000 : 500;
        const [data, couriers] = await Promise.all([
          getRecentResi(limit),
          getCourierOptions().catch(() => defaultCourierOptions()),
        ]);
        if (!cancelled) {
          setRows(data);
          setCourierOptions(
            couriers.length > 0 ? couriers : defaultCourierOptions(),
          );
          setConnectionError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setConnectionError(formatResiError(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [dataViewMode]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  function bumpRowToTop(row: ResiRow) {
    setRows((prev) => [row, ...prev.filter((item) => item.id !== row.id)]);
  }

  function focusScannedResi(resi: string) {
    setScanFilter(resi);
    setHighlightedResi(resi);
    setSearchQuery("");
  }

  function clearFilters() {
    setScanFilter(null);
    setHighlightedResi(null);
    setSearchQuery("");
    setStatusFilter("all");
    setCourierFilter("all");
    setDateFilter("");
  }

  function openInputModal(
    resi: string,
    mode: ModalState["mode"],
    existing?: ResiRow,
  ) {
    setModal({ resi, mode, existing });
  }

  function handleScanModeChange(mode: ScanMode) {
    setScanMode(mode);
    storeScanMode(mode);
    inputRef.current?.focus();
  }

  function handleDataViewModeChange(mode: DataViewMode) {
    setDataViewMode(mode);
    storeDataViewMode(mode);
    if (mode === "today") {
      setDateFilter("");
    }
    setScanFilter(null);
    setHighlightedResi(null);
    inputRef.current?.focus();
  }

  async function handleScanSubmit(rawValue: string) {
    const resi = rawValue.trim();
    if (!resi) return;

    setScanning(true);

    try {
      const existing = await getResiByNumber(resi);
      setConnectionError(null);

      if (scanMode === "sebelum_di_pack") {
        const saved = existing
          ? await touchResi(existing)
          : await insertResiScan(resi);

        bumpRowToTop(saved);
        focusScannedResi(resi);
        playScanSound("success");
        setToast({
          message: existing
            ? `${resi} diperbarui`
            : `${resi} disimpan — Belum di pack`,
          variant: "success",
        });
      } else {
        if (!existing) {
          playScanSound("error");
          setToast({
            message: `${resi} tidak ditemukan. Scan dulu di mode Sebelum di pack.`,
            variant: "error",
          });
          return;
        }

        const updated = await updateResiStatus(existing.id, "dikirim");
        bumpRowToTop(updated);
        focusScannedResi(resi);
        playScanSound("success");
        setToast({
          message:
            existing.status === "dikirim"
              ? `${resi} sudah dikirim`
              : `${resi} ditandai dikirim`,
          variant: "success",
        });
      }
    } catch (err) {
      const message = formatResiError(err);
      setConnectionError(message);
      playScanSound("error");
      setToast({
        message,
        variant: "error",
      });
    } finally {
      setScanning(false);
      setScanBuffer("");
      inputRef.current?.focus();
    }
  }

  function handleScanKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleScanSubmit(scanBuffer);
    }
  }

  async function handleSaveResi(data: {
    name: string;
    status: ResiStatus;
    courier: string;
    alamat: string;
    notes: string;
  }) {
    if (!modal) return;

    const saved = modal.existing?.id
      ? await updateResi(modal.existing.id, data)
      : await insertResi({
          resi: modal.resi,
          name: data.name,
          status: data.status,
          courier: data.courier,
          alamat: data.alamat,
          notes: data.notes,
        });

    bumpRowToTop(saved);
    focusScannedResi(saved.resi);
    setModal(null);
    setConnectionError(null);
    playScanSound("success");
    setToast({
      message: `${saved.resi} berhasil disimpan`,
      variant: "success",
    });
    inputRef.current?.focus();
  }

  async function handleQuickPack(row: ResiRow) {
    try {
      const updated = await updateResiStatus(row.id, "dikirim");
      bumpRowToTop(updated);
      focusScannedResi(updated.resi);
      setToast({
        message: `${updated.resi} ditandai dikirim`,
        variant: "success",
      });
    } catch (err) {
      setToast({
        message: formatResiError(err),
        variant: "error",
      });
    }
  }

  async function handleCopyResi(resi: string) {
    try {
      await navigator.clipboard.writeText(resi);
      setToast({ message: `Resi ${resi} disalin`, variant: "success" });
    } catch {
      setToast({ message: "Gagal menyalin resi", variant: "error" });
    }
  }

  async function handleDeleteResi(row: ResiRow) {
    const confirmed = window.confirm(
      `Hapus resi ${row.resi} dari database? Tindakan ini tidak dapat dibatalkan.`,
    );
    if (!confirmed) return;

    try {
      await deleteResi(row.id);
      setRows((prev) => prev.filter((item) => item.id !== row.id));
      if (scanFilter === row.resi) {
        setScanFilter(null);
        setHighlightedResi(null);
      }
      setToast({
        message: `${row.resi} dihapus`,
        variant: "success",
      });
    } catch (err) {
      setToast({
        message: formatResiError(err),
        variant: "error",
      });
    }
  }

  function refocusScannerIfAllowed() {
    if (modal || showCourierSettings) return;

    const active = document.activeElement;
    if (active?.closest("[data-pause-scanner-focus]")) return;

    inputRef.current?.focus();
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-zinc-100 via-zinc-50 to-zinc-100">
      <header className="border-b border-zinc-200/80 bg-white/90 shadow-sm backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-5 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
                Resi Scanner
              </h1>
              <p className="mt-0.5 text-sm text-zinc-500">
                Pilih mode scan, lalu arahkan barcode ke input
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setShowCourierSettings(true)}
                data-pause-scanner-focus
                className="min-h-11 flex-1 rounded-xl border border-violet-200 bg-violet-50 px-3 text-sm font-medium text-violet-800 shadow-sm transition active:bg-violet-100 sm:flex-none sm:px-3.5"
              >
                Kelola Courier
              </button>
              <button
                type="button"
                onClick={() => void handleLogout()}
                data-pause-scanner-focus
                className="min-h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 shadow-sm transition active:bg-zinc-100 sm:px-3.5"
              >
                Keluar
              </button>
              <div className="flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3">
                <span
                  className={`inline-flex h-2 w-2 rounded-full ${
                    scanning ? "animate-pulse bg-amber-400" : "bg-emerald-500"
                  }`}
                />
                <span className="text-xs font-medium text-zinc-600 sm:text-sm">
                  {scanning ? "..." : "Siap"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 py-4 pb-8 sm:px-6 sm:py-8 lg:px-8">
        {connectionError && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-medium">Koneksi database gagal</p>
            <p className="mt-1">{connectionError}</p>
            <p className="mt-2 text-amber-800">
              Buka Supabase Dashboard → Settings → API, lalu salin{" "}
              <span className="font-mono">Project URL</span> ke{" "}
              <span className="font-mono">NEXT_PUBLIC_SUPABASE_URL</span> di{" "}
              <span className="font-mono">.env.local</span>.
            </p>
          </div>
        )}

        <section className="mb-4 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm ring-1 ring-zinc-950/5 sm:mb-6 sm:p-5">
          <DataViewToggle
            mode={dataViewMode}
            todayLabel={todayLabel}
            onChange={handleDataViewModeChange}
          />
        </section>

        <StatsCards rows={viewScopedRows} />

        <section className="mb-4 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm ring-1 ring-zinc-950/5 sm:mb-6 sm:p-5">
          <div className="mb-4 border-b border-zinc-100 pb-4">
            <ScanModeToggle mode={scanMode} onChange={handleScanModeChange} />
          </div>

          <label
            htmlFor="scanner-input"
            className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500"
          >
            Scanner input
          </label>
          <div className="flex items-stretch gap-2">
            <input
              ref={inputRef}
              id="scanner-input"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              autoFocus
              value={scanBuffer}
              onChange={(e) => setScanBuffer(e.target.value)}
              onKeyDown={handleScanKeyDown}
              onBlur={() => {
                requestAnimationFrame(refocusScannerIfAllowed);
              }}
              placeholder="Arahkan scanner ke sini..."
              className="min-w-0 flex-1 rounded-xl border-2 border-zinc-200 bg-zinc-50 px-3 py-3 font-mono text-base text-zinc-900 shadow-inner outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/15 sm:px-4 sm:py-3.5 sm:text-lg"
            />
            <button
              type="button"
              aria-label="Cari resi"
              data-pause-scanner-focus
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleScanSubmit(scanBuffer)}
              disabled={scanning || !scanBuffer.trim()}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition active:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:h-auto sm:w-auto sm:px-4 sm:py-3.5"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
                />
              </svg>
            </button>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-zinc-500">
            {scanMode === "sebelum_di_pack" ? (
              <>
                Mode <span className="font-medium text-zinc-700">Sebelum di pack</span>
                : resi langsung disimpan. Edit manual lewat tombol Edit di tabel.
              </>
            ) : (
              <>
                Mode <span className="font-medium text-zinc-700">Setelah di pack</span>
                : scan resi yang sudah ada untuk mengubah status menjadi dikirim.
              </>
            )}
          </p>
        </section>

        <section
          className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm ring-1 ring-zinc-950/5"
          data-pause-scanner-focus
        >
          <div className="flex items-center justify-between border-b border-zinc-200/80 bg-zinc-50/80 px-4 py-3 sm:px-5 sm:py-3.5">
            <h2 className="text-sm font-semibold text-zinc-900">
              Daftar Resi
            </h2>
          </div>

          <ResiToolbar
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            courierFilter={courierFilter}
            dateFilter={dateFilter}
            dataViewMode={dataViewMode}
            scanFilter={scanFilter}
            resultCount={displayedRows.length}
            totalCount={viewScopedRows.length}
            displayedRows={displayedRows}
            courierOptions={courierOptions}
            onSearchChange={setSearchQuery}
            onStatusFilterChange={setStatusFilter}
            onCourierFilterChange={setCourierFilter}
            onDateFilterChange={setDateFilter}
            onClearScanFilter={() => {
              setScanFilter(null);
              setHighlightedResi(null);
            }}
            onClearAllFilters={clearFilters}
          />

          <ResiTable
            rows={displayedRows}
            allRowsEmpty={rows.length === 0}
            loading={loading}
            connectionError={connectionError}
            highlightedResi={highlightedResi}
            onQuickPack={handleQuickPack}
            onEdit={(row) => openInputModal(row.resi, "edit", row)}
            onDelete={handleDeleteResi}
            onCopyResi={handleCopyResi}
          />
        </section>
      </main>

      {modal && (
        <NewResiModal
          resi={modal.resi}
          mode={modal.mode}
          existing={modal.existing}
          courierOptions={courierOptions}
          onClose={() => {
            setModal(null);
            inputRef.current?.focus();
          }}
          onSave={handleSaveResi}
        />
      )}

      {showCourierSettings && (
        <CourierSettingsModal
          courierOptions={courierOptions}
          onClose={() => {
            setShowCourierSettings(false);
            inputRef.current?.focus();
          }}
          onUpdated={setCourierOptions}
        />
      )}

      {toast && <Toast message={toast.message} variant={toast.variant} />}
    </div>
  );
}
