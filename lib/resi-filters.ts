import type { ResiRow, ResiStatus } from "@/lib/database.types";

export type ResiFilterStatus = ResiStatus | "all";

export function filterResiRows(
  rows: ResiRow[],
  options: {
    scanFilter: string | null;
    searchQuery: string;
    statusFilter: ResiFilterStatus;
  },
): ResiRow[] {
  let result = rows;

  if (options.scanFilter) {
    result = result.filter((row) => row.resi === options.scanFilter);
  }

  if (options.statusFilter !== "all") {
    result = result.filter((row) => row.status === options.statusFilter);
  }

  const query = options.searchQuery.trim().toLowerCase();
  if (query) {
    result = result.filter(
      (row) =>
        row.resi.toLowerCase().includes(query) ||
        row.name?.toLowerCase().includes(query) ||
        row.alamat?.toLowerCase().includes(query) ||
        row.notes?.toLowerCase().includes(query),
    );
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
