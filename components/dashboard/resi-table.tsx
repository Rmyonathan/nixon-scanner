import type { ResiRow, ResiStatus } from "@/lib/database.types";

const STATUS_STYLES: Record<ResiStatus, string> = {
  dikirim: "bg-emerald-100 text-emerald-800 ring-emerald-300/50",
  "belum di pack": "bg-amber-100 text-amber-800 ring-amber-300/50",
};

const STATUS_LABELS: Record<ResiStatus, string> = {
  dikirim: "Dikirim",
  "belum di pack": "Belum di pack",
};

const CELL =
  "border border-zinc-300 px-4 py-2.5 align-middle bg-zinc-50/90";
const HEAD_CELL =
  "border border-zinc-300 bg-zinc-100 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

function rowCellClass(row: ResiRow, isHighlighted: boolean) {
  if (row.status === "dikirim") {
    return isHighlighted
      ? "border border-emerald-300 bg-emerald-100/95 px-4 py-2.5 align-middle"
      : "border border-emerald-200 bg-emerald-50/95 px-4 py-2.5 align-middle";
  }

  if (isHighlighted) {
    return "border border-emerald-300 bg-emerald-50/90 px-4 py-2.5 align-middle";
  }

  return CELL;
}

function TrashButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Hapus resi"
      title="Hapus"
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-600 shadow-sm transition hover:bg-red-100 active:bg-red-200"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </button>
  );
}

type ResiTableProps = {
  rows: ResiRow[];
  allRowsEmpty: boolean;
  loading: boolean;
  connectionError?: string | null;
  highlightedResi?: string | null;
  onQuickPack?: (row: ResiRow) => void;
  onEdit?: (row: ResiRow) => void;
  onDelete?: (row: ResiRow) => void;
  onCopyResi?: (resi: string) => void;
};

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="px-4 py-12 text-center sm:px-6 sm:py-16">
      <p className="text-sm font-medium text-zinc-700">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500">{description}</p>
    </div>
  );
}

function ResiMobileCard({
  row,
  isHighlighted,
  onQuickPack,
  onEdit,
  onDelete,
  onCopyResi,
}: {
  row: ResiRow;
  isHighlighted: boolean;
  onQuickPack?: (row: ResiRow) => void;
  onEdit?: (row: ResiRow) => void;
  onDelete?: (row: ResiRow) => void;
  onCopyResi?: (resi: string) => void;
}) {
  const isDikirim = row.status === "dikirim";

  return (
    <article
      className={`rounded-2xl border p-4 shadow-sm ${
        isDikirim
          ? "border-emerald-200 bg-emerald-50/95"
          : isHighlighted
            ? "border-emerald-300 bg-emerald-50/80 ring-2 ring-emerald-200"
            : "border-zinc-200 bg-zinc-50/90"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => onCopyResi?.(row.resi)}
          className="font-mono text-lg font-bold text-zinc-900 active:text-emerald-700"
          title="Salin nomor resi"
        >
          {row.resi}
        </button>
        <span
          className={`inline-flex shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[row.status]}`}
        >
          {STATUS_LABELS[row.status]}
        </span>
      </div>

      <dl className="mt-4 space-y-2.5 text-sm">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Nama
          </dt>
          <dd className="mt-0.5 text-zinc-800">
            {row.name?.trim() ? (
              row.name
            ) : (
              <span className="italic text-amber-700">Belum ada data</span>
            )}
          </dd>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Courier
            </dt>
            <dd className="mt-0.5">
              {row.courier ? (
                <span className="inline-flex rounded-md bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800">
                  {row.courier}
                </span>
              ) : (
                <span className="text-zinc-400">—</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Diperbarui
            </dt>
            <dd className="mt-0.5 text-zinc-600">{formatDate(row.updated_at)}</dd>
          </div>
        </div>
        {row.alamat && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Alamat
            </dt>
            <dd className="mt-0.5 text-zinc-700">{row.alamat}</dd>
          </div>
        )}
        {row.notes && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Catatan
            </dt>
            <dd className="mt-0.5 text-zinc-700">{row.notes}</dd>
          </div>
        )}
      </dl>

      <div className="mt-4 flex gap-2">
        {row.status === "belum di pack" && onQuickPack && (
          <button
            type="button"
            onClick={() => onQuickPack(row)}
            className="min-h-11 flex-1 rounded-xl bg-blue-600 text-sm font-medium text-white shadow-sm active:bg-blue-700"
          >
            Kirim
          </button>
        )}
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(row)}
            className="min-h-11 flex-1 rounded-xl border border-zinc-300 bg-white text-sm font-medium text-zinc-700 shadow-sm active:bg-zinc-100"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(row)}
            aria-label="Hapus resi"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 shadow-sm active:bg-red-100"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>
    </article>
  );
}

export function ResiTable({
  rows,
  allRowsEmpty,
  loading,
  connectionError,
  highlightedResi,
  onQuickPack,
  onEdit,
  onDelete,
  onCopyResi,
}: ResiTableProps) {
  if (loading) {
    return <EmptyState title="Memuat data..." description="Mohon tunggu sebentar." />;
  }

  if (allRowsEmpty) {
    return (
      <EmptyState
        title="Belum ada data resi"
        description={
          connectionError
            ? "Database belum terhubung. Setelah URL Supabase benar, scan resi untuk menambah data."
            : "Scan resi di mode Sebelum di pack untuk mulai menambah data."
        }
      />
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title="Tidak ada hasil cocok"
        description="Coba ubah kata kunci pencarian atau filter status."
      />
    );
  }

  return (
    <>
      <div className="space-y-3 p-3 md:hidden">
        {rows.map((row) => (
          <ResiMobileCard
            key={row.id}
            row={row}
            isHighlighted={highlightedResi === row.resi}
            onQuickPack={onQuickPack}
            onEdit={onEdit}
            onDelete={onDelete}
            onCopyResi={onCopyResi}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto p-4 pt-0 md:block">
        <table className="min-w-full border-collapse border border-zinc-300 text-sm shadow-sm">
          <thead>
            <tr>
              <th className={`${HEAD_CELL} whitespace-nowrap`}>Resi</th>
              <th className={`${HEAD_CELL} whitespace-nowrap`}>Nama</th>
              <th className={`${HEAD_CELL} whitespace-nowrap`}>Courier</th>
              <th className={`${HEAD_CELL} whitespace-nowrap`}>Alamat</th>
              <th className={`${HEAD_CELL} whitespace-nowrap`}>Status</th>
              <th className={`${HEAD_CELL} whitespace-nowrap`}>Catatan</th>
              <th className={`${HEAD_CELL} whitespace-nowrap`}>Diperbarui</th>
              <th className={`${HEAD_CELL} whitespace-nowrap`}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isHighlighted = highlightedResi === row.resi;
              const cellClass = rowCellClass(row, isHighlighted);
              const isDikirim = row.status === "dikirim";

              return (
                <tr
                  key={row.id}
                  className={
                    isDikirim
                      ? "transition-colors hover:[&>td]:bg-emerald-100/90"
                      : "transition-colors hover:[&>td]:bg-zinc-100/90"
                  }
                >
                  <td className={`${cellClass} whitespace-nowrap`}>
                    <button
                      type="button"
                      onClick={() => onCopyResi?.(row.resi)}
                      className="font-mono font-semibold text-zinc-900 hover:text-emerald-700"
                      title="Salin nomor resi"
                    >
                      {row.resi}
                    </button>
                  </td>
                  <td className={`${cellClass} whitespace-nowrap text-zinc-800`}>
                    {row.name?.trim() ? (
                      row.name
                    ) : (
                      <span className="italic text-amber-700">
                        Belum ada data
                      </span>
                    )}
                  </td>
                  <td className={`${cellClass} whitespace-nowrap`}>
                    {row.courier ? (
                      <span className="inline-flex rounded-md bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800 ring-1 ring-violet-200">
                        {row.courier}
                      </span>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                  <td className={`${cellClass} max-w-xs truncate text-zinc-700`}>
                    {row.alamat || "—"}
                  </td>
                  <td className={`${cellClass} whitespace-nowrap`}>
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[row.status]}`}
                    >
                      {STATUS_LABELS[row.status]}
                    </span>
                  </td>
                  <td className={`${cellClass} max-w-xs truncate text-zinc-700`}>
                    {row.notes || "—"}
                  </td>
                  <td className={`${cellClass} whitespace-nowrap text-zinc-600`}>
                    {formatDate(row.updated_at)}
                  </td>
                  <td className={`${cellClass} whitespace-nowrap`}>
                    <div className="flex items-center gap-1.5">
                      {row.status === "belum di pack" && onQuickPack && (
                        <button
                          type="button"
                          onClick={() => onQuickPack(row)}
                          className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white shadow-sm hover:bg-blue-700"
                        >
                          Kirim
                        </button>
                      )}
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(row)}
                          className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 shadow-sm hover:bg-zinc-100"
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <TrashButton onClick={() => onDelete(row)} />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
