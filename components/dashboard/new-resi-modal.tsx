"use client";

import { useState } from "react";
import type { ResiRow, ResiStatus } from "@/lib/database.types";

type NewResiModalProps = {
  resi: string;
  mode: "new" | "complete" | "edit";
  existing?: ResiRow;
  onClose: () => void;
  onSave: (data: {
    name: string;
    status: ResiStatus;
    alamat: string;
    notes: string;
  }) => Promise<void>;
};

export function NewResiModal({
  resi,
  mode,
  existing,
  onClose,
  onSave,
}: NewResiModalProps) {
  const [name, setName] = useState(existing?.name ?? "");
  const [status, setStatus] = useState<ResiStatus>(
    existing?.status ?? "belum di pack",
  );
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [alamat, setAlamat] = useState(existing?.alamat ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isComplete = mode === "complete";
  const isEdit = mode === "edit";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama wajib diisi");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave({ name, status, alamat, notes });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Tutup"
        className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl"
        data-pause-scanner-focus
      >
        <h2 className="text-lg font-semibold text-zinc-900">
          {isEdit
            ? "Edit Resi"
            : isComplete
              ? "Lengkapi Data Resi"
              : "Resi Baru"}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          {isEdit ? (
            <>
              Ubah data untuk resi{" "}
              <span className="font-mono font-medium text-zinc-800">{resi}</span>.
            </>
          ) : isComplete ? (
            <>
              Resi{" "}
              <span className="font-mono font-medium text-zinc-800">{resi}</span>{" "}
              sudah ada, tapi belum ada data. Silakan isi nama, status, dan
              catatan.
            </>
          ) : (
            <>
              Resi{" "}
              <span className="font-mono font-medium text-zinc-800">{resi}</span>{" "}
              belum ada di database. Silakan input data berikut.
            </>
          )}
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="resi-name"
              className="block text-sm font-medium text-zinc-700"
            >
              Nama
            </label>
            <input
              id="resi-name"
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-emerald-500 focus:border-emerald-500 focus:ring-2"
              placeholder="Nama penerima / paket"
            />
          </div>

          <div>
            <label
              htmlFor="resi-status"
              className="block text-sm font-medium text-zinc-700"
            >
              Status
            </label>
            <select
              id="resi-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ResiStatus)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-emerald-500 focus:border-emerald-500 focus:ring-2"
            >
              <option value="belum di pack">Belum di pack</option>
              <option value="pengiriman">Pengiriman</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="resi-alamat"
              className="block text-sm font-medium text-zinc-700"
            >
              Alamat{" "}
              <span className="font-normal text-zinc-400">(opsional)</span>
            </label>
            <textarea
              id="resi-alamat"
              rows={2}
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              className="mt-1 w-full resize-none rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-emerald-500 focus:border-emerald-500 focus:ring-2"
              placeholder="Alamat pengiriman"
            />
          </div>

          <div>
            <label
              htmlFor="resi-notes"
              className="block text-sm font-medium text-zinc-700"
            >
              Catatan{" "}
              <span className="font-normal text-zinc-400">(opsional)</span>
            </label>
            <textarea
              id="resi-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full resize-none rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-emerald-500 focus:border-emerald-500 focus:ring-2"
              placeholder="Opsional"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
