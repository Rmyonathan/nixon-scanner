"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  formatResiError,
  getRecentResi,
  getResiByNumber,
  insertResi,
  resiHasDetails,
  updateResi,
  updateResiStatus,
} from "@/lib/resi";
import { filterResiRows, type ResiFilterStatus } from "@/lib/resi-filters";
import { getSupabaseConfigError } from "@/lib/supabase";
import type { ResiRow, ResiStatus } from "@/lib/database.types";
import { NewResiModal } from "@/components/dashboard/new-resi-modal";
import { ResiTable } from "@/components/dashboard/resi-table";
import { ResiToolbar } from "@/components/dashboard/resi-toolbar";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { Toast } from "@/components/dashboard/toast";

const STATUS_LABELS: Record<ResiStatus, string> = {
  pengiriman: "Pengiriman",
  "belum di pack": "Belum di pack",
};

type ModalState = {
  resi: string;
  mode: "new" | "complete" | "edit";
  existing?: ResiRow;
};

export default function DashboardPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [scanBuffer, setScanBuffer] = useState("");
  const [rows, setRows] = useState<ResiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ResiFilterStatus>("all");
  const [scanFilter, setScanFilter] = useState<string | null>(null);
  const [highlightedResi, setHighlightedResi] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);

  const displayedRows = useMemo(
    () =>
      filterResiRows(rows, {
        scanFilter,
        searchQuery,
        statusFilter,
      }),
    [rows, scanFilter, searchQuery, statusFilter],
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const configError = getSupabaseConfigError();
    if (configError) {
      setConnectionError(configError);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const data = await getRecentResi();
        if (!cancelled) {
          setRows(data);
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
  }, []);

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
  }

  function openInputModal(
    resi: string,
    mode: ModalState["mode"],
    existing?: ResiRow,
  ) {
    setModal({ resi, mode, existing });
  }

  async function handleScanSubmit(rawValue: string) {
    const resi = rawValue.trim();
    if (!resi) return;

    setScanning(true);
    let openModal = false;

    try {
      const existing = await getResiByNumber(resi);
      setConnectionError(null);

      if (existing && resiHasDetails(existing)) {
        bumpRowToTop(existing);
        focusScannedResi(resi);
        setToast({
          message: `${resi} ditemukan — ${STATUS_LABELS[existing.status]}`,
          variant: "success",
        });
      } else {
        openModal = true;
        openInputModal(resi, existing ? "complete" : "new", existing ?? undefined);
        setToast({
          message: existing
            ? `${resi} belum ada datanya. Silakan isi form.`
            : `${resi} tidak ditemukan. Silakan input data.`,
          variant: "error",
        });
      }
    } catch (err) {
      const message = formatResiError(err);
      setConnectionError(message);
      openModal = true;
      openInputModal(resi, "new");
      setToast({
        message: "Tidak dapat cek database. Silakan input data resi.",
        variant: "error",
      });
    } finally {
      setScanning(false);
      setScanBuffer("");
      if (!openModal) {
        inputRef.current?.focus();
      }
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
          alamat: data.alamat,
          notes: data.notes,
        });

    bumpRowToTop(saved);
    focusScannedResi(saved.resi);
    setModal(null);
    setConnectionError(null);
    setToast({
      message: `${saved.resi} berhasil disimpan`,
      variant: "success",
    });
    inputRef.current?.focus();
  }

  async function handleQuickPack(row: ResiRow) {
    try {
      const updated = await updateResiStatus(row.id, "pengiriman");
      bumpRowToTop(updated);
      focusScannedResi(updated.resi);
      setToast({
        message: `${updated.resi} ditandai pengiriman`,
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

  function refocusScannerIfAllowed() {
    if (modal) return;

    const active = document.activeElement;
    if (active?.closest("[data-pause-scanner-focus]")) return;

    inputRef.current?.focus();
  }

  return (
    <div className="min-h-full bg-zinc-100">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
              Resi Scanner
            </h1>
            <p className="mt-0.5 text-sm text-zinc-500">
              Scan barcode untuk cek atau tambah resi
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex h-2 w-2 rounded-full ${
                scanning ? "animate-pulse bg-amber-400" : "bg-emerald-500"
              }`}
            />
            <span className="text-sm text-zinc-600">
              {scanning ? "Memproses..." : "Siap scan"}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
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

        <StatsCards rows={rows} />

        <section className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <label
            htmlFor="scanner-input"
            className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-500"
          >
            Scanner input
          </label>
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
            className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-3 font-mono text-lg text-zinc-900 outline-none ring-emerald-500 transition focus:border-emerald-500 focus:bg-white focus:ring-2"
          />
          <p className="mt-2 text-xs text-zinc-400">
            Scan + Enter menampilkan hanya resi yang cocok. Klik{" "}
            <span className="font-medium">Tampilkan semua</span> untuk melihat
            seluruh daftar.
          </p>
        </section>

        <section
          className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
          data-pause-scanner-focus
        >
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-zinc-900">
              Daftar Resi
            </h2>
          </div>

          <ResiToolbar
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            scanFilter={scanFilter}
            resultCount={displayedRows.length}
            totalCount={rows.length}
            onSearchChange={setSearchQuery}
            onStatusFilterChange={setStatusFilter}
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
            onCopyResi={handleCopyResi}
          />
        </section>
      </main>

      {modal && (
        <NewResiModal
          resi={modal.resi}
          mode={modal.mode}
          existing={modal.existing}
          onClose={() => {
            setModal(null);
            inputRef.current?.focus();
          }}
          onSave={handleSaveResi}
        />
      )}

      {toast && <Toast message={toast.message} variant={toast.variant} />}
    </div>
  );
}
