import * as XLSX from "xlsx";
import type { Ticket } from "../../../Models/Tickets";
import { calculateComplianceMetrics } from "./reportMetric";
import { buildTicketsData } from "./convertDataToExcel";

function appendSheet<T extends Record<string, unknown>>(wb: XLSX.WorkBook,
  sheetName: string,
  data: T[]
) {
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
}

export function exportComplianceReportToExcel(
  rows: Ticket[],
  opts?: { fileName?: string }
) {
  const metrics = calculateComplianceMetrics(rows);
  const detail = buildTicketsData(rows);

  const resumen = [
    { Indicador: "Total tickets", Valor: metrics.total },
    { Indicador: "Tickets cerrados", Valor: metrics.closed },
    { Indicador: "Tickets abiertos", Valor: metrics.open },
    { Indicador: "% cumplimiento", Valor: `${metrics.compliancePct}%` },
    { Indicador: "Cerrados a tiempo", Valor: metrics.closedOnTime },
    { Indicador: "Cerrados fuera de tiempo", Valor: metrics.closedLate },
    { Indicador: "Cerrados sin fechas", Valor: metrics.closedWithoutDates },
    { Indicador: "Abiertos vencidos", Valor: metrics.openOverdue },
    { Indicador: "Abiertos dentro de tiempo", Valor: metrics.openWithinTime },
    { Indicador: "Abiertos sin fecha máxima", Valor: metrics.openWithoutDates },
  ];

  const tecnicos = metrics.byTecnico.map((x) => ({
    Técnico: x.tecnico,
    Total: x.total,
    Cerrados: x.closed,
    "A tiempo": x.onTime,
    "Fuera de tiempo": x.late,
    "% cumplimiento": `${x.compliancePct}%`,
  }));

  const categorias = metrics.byCategoria.map((x) => ({
    Categoría: x.categoria,
    Total: x.total,
    Cerrados: x.closed,
    "A tiempo": x.onTime,
    "Fuera de tiempo": x.late,
    "% cumplimiento": `${x.compliancePct}%`,
  }));

  const wb = XLSX.utils.book_new();

  appendSheet(wb, "Resumen", resumen);
  appendSheet(wb, "Por técnico", tecnicos);
  appendSheet(wb, "Por categoría", categorias);
  appendSheet(wb, "Detalle tickets", detail);

  XLSX.writeFile(wb, opts?.fileName ?? "ReporteCumplimientoTickets.xlsx");
}