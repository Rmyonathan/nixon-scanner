import type { ResiRow, ResiStatus } from "@/lib/database.types";

const STATUS_STYLES: Record<ResiStatus, string> = {
  pengiriman: "bg-blue-50 text-blue-700 ring-blue-600/20",
  "belum di pack": "bg-amber-50 text-amber-700 ring-amber-600/20",
};

const STATUS_LABELS: Record<ResiStatus, string> = {
  pengiriman: "Pengiriman",
  "belum di pack": "Belum di pack",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

type ResiTableProps = {
  rows: ResiRow[];
  allRowsEmpty: boolean;
  loading: boolean;
  connectionError?: string | null;
  highlightedResi?: string | null;
  onQuickPack?: (row: ResiRow) => void;
  onEdit?: (row: ResiRow) => void;
  onCopyResi?: (resi: string) => void;
};

export function ResiTable({
  rows,
  allRowsEmpty,
  loading,
  connectionError,
  highlightedResi,
  onQuickPack,
  onEdit,
  onCopyResi,
}: ResiTableProps) {
  if (loading) {
    return (
      <div className="px-4 py-12 text-center text-sm text-zinc-500">
        Memuat data...
      </div>
    );
  }

  if (allRowsEmpty) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-sm font-medium text-zinc-700">Belum ada data resi</p>
        <p className="mt-2 text-sm text-zinc-500">
          {connectionError
            ? "Database belum terhubung. Setelah URL Supabase benar, scan resi untuk menambah data."
            : "Scan nomor resi di input atas. Jika belum ada datanya, form input akan muncul otomatis."}
        </p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-sm font-medium text-zinc-700">
          Tidak ada hasil cocok
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          Coba ubah kata kunci pencarian atau filter status.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <th className="whitespace-nowrap border-r border-zinc-200 px-4 py-3">
              Resi
            </th>
            <th className="whitespace-nowrap border-r border-zinc-200 px-4 py-3">
              Nama
            </th>
            <th className="whitespace-nowrap border-r border-zinc-200 px-4 py-3">
              Alamat
            </th>
            <th className="whitespace-nowrap border-r border-zinc-200 px-4 py-3">
              Status
            </th>
            <th className="whitespace-nowrap border-r border-zinc-200 px-4 py-3">
              Catatan
            </th>
            <th className="whitespace-nowrap border-r border-zinc-200 px-4 py-3">
              Diperbarui
            </th>
            <th className="whitespace-nowrap px-4 py-3">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const isHighlighted = highlightedResi === row.resi;

            return (
              <tr
                key={row.id}
                className={`border-b border-zinc-100 transition-colors ${
                  isHighlighted
                    ? "bg-emerald-50 ring-1 ring-inset ring-emerald-300"
                    : index % 2 === 0
                      ? "bg-white hover:bg-zinc-50/80"
                      : "bg-zinc-50/50 hover:bg-zinc-50"
                }`}
              >
                <td className="whitespace-nowrap border-r border-zinc-100 px-4 py-2.5">
                  <button
                    type="button"
                    onClick={() => onCopyResi?.(row.resi)}
                    className="font-mono font-medium text-zinc-900 hover:text-emerald-700"
                    title="Salin nomor resi"
                  >
                    {row.resi}
                  </button>
                </td>
                <td className="whitespace-nowrap border-r border-zinc-100 px-4 py-2.5 text-zinc-700">
                  {row.name?.trim() ? (
                    row.name
                  ) : (
                    <span className="italic text-amber-600">Belum ada data</span>
                  )}
                </td>
                <td className="max-w-xs truncate border-r border-zinc-100 px-4 py-2.5 text-zinc-600">
                  {row.alamat || "—"}
                </td>
                <td className="whitespace-nowrap border-r border-zinc-100 px-4 py-2.5">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[row.status]}`}
                  >
                    {STATUS_LABELS[row.status]}
                  </span>
                </td>
                <td className="max-w-xs truncate border-r border-zinc-100 px-4 py-2.5 text-zinc-600">
                  {row.notes || "—"}
                </td>
                <td className="whitespace-nowrap border-r border-zinc-100 px-4 py-2.5 text-zinc-500">
                  {formatDate(row.updated_at)}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    {row.status === "belum di pack" && onQuickPack && (
                      <button
                        type="button"
                        onClick={() => onQuickPack(row)}
                        className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
                      >
                        Kirim
                      </button>
                    )}
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
