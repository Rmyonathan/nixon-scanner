import type { ResiRow } from "@/lib/database.types";

const STATUS_LABELS: Record<ResiRow["status"], string> = {
  pengiriman: "Pengiriman",
  "belum di pack": "Belum di pack",
};

function formatExportDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

export async function exportResiRowsToXlsx(
  rows: ResiRow[],
  filenamePrefix = "resi-export",
) {
  const XLSX = await import("xlsx");

  const sheetData = rows.map((row) => ({
    Resi: row.resi,
    Name: row.name ?? "",
    Courier: row.courier ?? "",
    Status: STATUS_LABELS[row.status],
    Date: formatExportDate(row.updated_at),
  }));

  const worksheet = XLSX.utils.json_to_sheet(sheetData);
  worksheet["!cols"] = [
    { wch: 22 },
    { wch: 24 },
    { wch: 18 },
    { wch: 16 },
    { wch: 20 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Resi");

  const dateStamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${filenamePrefix}-${dateStamp}.xlsx`);
}
