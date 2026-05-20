import type { Ticket } from "../../../Models/Tickets";
import { toISODateFlex } from "../../../utils/Date";

export function buildTicketsData(rows: Ticket[]) {
  return rows.map((row) => ({
    Titulo: row.Title ?? "N/A",
    Proveedor: row.Proveedor ?? "N/A",
    Resolutor: row.Nombreresolutor ?? "N/A",
    Solicitante: row.Solicitante ?? "N/A",
    "Fecha de apertura": toISODateFlex(row.FechaApertura) ?? "N/A",
    "Fecha maxima de solucion": toISODateFlex(row.TiempoSolucion) ?? "N/A",
    "Ultima actualizacion": toISODateFlex(row.UltimaActualizacion) ?? "N/A",
    ANS: row.ANS ?? "N/A",
    Estado: row.Estadodesolicitud ?? "N/A",
    Categoria:
      row.Categoria && row.SubCategoria
        ? `${row.Categoria} > ${row.SubCategoria}`
        : "N/A",
  }));
}
