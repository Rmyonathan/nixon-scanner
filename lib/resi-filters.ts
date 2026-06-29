import type { ResiRow, ResiStatus } from "@/lib/database.types";

export type ResiFilterStatus = ResiStatus | "all";
export type ResiFilterCourier = string | "all";

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

function isSameLocalDate(iso: string, yyyyMmDd: string) {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}` === yyyyMmDd;
}

export function filterResiRows(
  rows: ResiRow[],
  options: {
    scanFilter: string | null;
    searchQuery: string;
    statusFilter: ResiFilterStatus;
    courierFilter: ResiFilterCourier;
    dateFilter: string;
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

  if (options.dateFilter) {
    result = result.filter((row) =>
      isSameLocalDate(row.updated_at, options.dateFilter),
    );
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
    pengiriman: rows.filter((row) => row.status === "pengiriman").length,
  };
}
