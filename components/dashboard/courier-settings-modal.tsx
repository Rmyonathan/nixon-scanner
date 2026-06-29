"use client";

import { useState } from "react";
import {
  addCourierOption,
  deleteCourierOption,
} from "@/lib/courier-options";
import type { CourierOptionRow } from "@/lib/database.types";

type CourierSettingsModalProps = {
  courierOptions: CourierOptionRow[];
  onClose: () => void;
  onUpdated: (options: CourierOptionRow[]) => void;
};

export function CourierSettingsModal({
  courierOptions,
  onClose,
  onUpdated,
}: CourierSettingsModalProps) {
  const [name, setName] = useState("");
  const [prefix, setPrefix] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const created = await addCourierOption({ name, prefix });
      onUpdated([...courierOptions, created]);
      setName("");
      setPrefix("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambah courier");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(option: CourierOptionRow) {
    if (option.id.startsWith("default-")) {
      setError("Courier bawaan hanya bisa dihapus setelah migrasi database.");
      return;
    }

    setDeletingId(option.id);
    setError(null);

    try {
      await deleteCourierOption(option.id);
      onUpdated(courierOptions.filter((item) => item.id !== option.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus courier");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Tutup"
        className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-zinc-200 bg-white shadow-xl sm:max-w-lg sm:rounded-xl"
        data-pause-scanner-focus
      >
        <div className="border-b border-zinc-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">
            Kelola Courier
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Tambah atau hapus courier yang muncul di dropdown form resi.
          </p>
        </div>

        <div className="overflow-y-auto px-6 py-4">
          <form onSubmit={handleAdd} className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <div>
              <label
                htmlFor="courier-name"
                className="block text-sm font-medium text-zinc-700"
              >
                Nama courier
              </label>
              <input
                id="courier-name"
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: AnterAja"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-emerald-500 focus:border-emerald-500 focus:ring-2"
              />
            </div>
            <div>
              <label
                htmlFor="courier-prefix"
                className="block text-sm font-medium text-zinc-700"
              >
                Prefix resi{" "}
                <span className="font-normal text-zinc-400">(opsional)</span>
              </label>
              <input
                id="courier-prefix"
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="Contoh: AN for auto-detect"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-emerald-500 focus:border-emerald-500 focus:ring-2"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Prefix dipakai untuk auto-detect saat scan (mis. SPX → Shopee
                Xpress).
              </p>
            </div>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Tambah courier"}
            </button>
          </form>

          <ul className="mt-4 space-y-2">
            {courierOptions.map((option) => (
              <li
                key={option.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    {option.name}
                  </p>
                  {option.prefix && (
                    <p className="text-xs text-zinc-500">
                      Prefix: {option.prefix}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(option)}
                  disabled={deletingId === option.id}
                  className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  {deletingId === option.id ? "..." : "Hapus"}
                </button>
              </li>
            ))}
          </ul>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>

        <div className="border-t border-zinc-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
