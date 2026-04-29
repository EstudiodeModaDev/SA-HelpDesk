// src/utils/exportExcel.ts
import * as XLSX from "xlsx";
import type { Ticket } from "../../../Models/Tickets";
import { buildTicketsData } from "./convertDataToExcel";

//Funcion que crea una nueva hoja para el exporte
function appendSheet<T extends Record<string, unknown>>(wb: XLSX.WorkBook, sheetName: string, data: T[]) {
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
}


export function exportTicketsToExcel(rows: Ticket[], opts?: { fileName?: string }) {
  const data = buildTicketsData(rows)

  const wb = XLSX.utils.book_new();
  appendSheet(wb, "Envios", data)

  XLSX.writeFile(wb, opts?.fileName ?? "ReporteEnvios.xlsx");
}
