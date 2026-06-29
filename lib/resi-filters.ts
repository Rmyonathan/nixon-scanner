import type { ResiRow, ResiStatus } from "@/lib/database.types";

export type ResiFilterStatus = ResiStatus | "all";
export type ResiFilterCourier = string | "all";

export type DateRangeFilter = {
  dateFrom: string;
  dateTo: string;
};

function formatRowDates(iso: string) {
  const date = new Date(iso);
  return [
    new Intl.DateTimeFormat("id-ID", { dateStyle: "short" }).format(date),
    new Intl.DateTimeFormat("id-ID", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date),
    iso.slice(0, 10),
  ];
}

function matchesSearchQuery(row: ResiRow, query: string) {
  const haystack = [
    row.resi,
    row.name ?? "",
    row.alamat ?? "",
    row.courier ?? "",
    row.notes ?? "",
    ...formatRowDates(row.updated_at),
    ...formatRowDates(row.created_at),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export function getLocalDateString(iso: string) {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayLocalDate() {
  return getLocalDateString(new Date().toISOString());
}

export function filterRowsByDateRange(
  rows: ResiRow[],
  dateFrom: string,
  dateTo: string,
) {
  if (!dateFrom && !dateTo) return rows;

  const start = dateFrom || dateTo;
  const end = dateTo || dateFrom;

  return rows.filter((row) => {
    const value = getLocalDateString(row.updated_at);
    return value >= start && value <= end;
  });
}

export function formatDateRangeLabel(dateFrom: string, dateTo: string) {
  if (!dateFrom && !dateTo) return null;
  if (dateFrom && dateTo && dateFrom === dateTo) return dateFrom;
  if (dateFrom && dateTo) return `${dateFrom} – ${dateTo}`;
  if (dateFrom) return `dari ${dateFrom}`;
  return `sampai ${dateTo}`;
}

export function filterResiRows(
  rows: ResiRow[],
  options: {
    scanFilter: string | null;
    searchQuery: string;
    statusFilter: ResiFilterStatus;
    courierFilter: ResiFilterCourier;
  },
): ResiRow[] {
  let result = rows;

  if (options.scanFilter) {
    result = result.filter((row) => row.resi === options.scanFilter);
  }

  if (options.statusFilter !== "all") {
    result = result.filter((row) => row.status === options.statusFilter);
  }

  if (options.courierFilter !== "all") {
    result = result.filter((row) => row.courier === options.courierFilter);
  }

  const query = options.searchQuery.trim().toLowerCase();
  if (query) {
    result = result.filter((row) => matchesSearchQuery(row, query));
  }

  return result;
}

export function getResiStats(rows: ResiRow[]) {
  return {
    total: rows.length,
    belumDiPack: rows.filter((row) => row.status === "belum di pack").length,
    dikirim: rows.filter((row) => row.status === "dikirim").length,
  };
}
