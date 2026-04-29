import type { Ticket } from "../../../Models/Tickets";
import { toISODateFlex } from "../../../utils/Date";

export function buildTicketsData(rows: Ticket[]) {
  return rows.map((row) => ({
    "Título": row.Title ?? "N/A",
    Resolutor: row.Nombreresolutor ?? "N/A",
    "Solicitante": row.Solicitante ?? "N/A",
    "Fecha de apertura": toISODateFlex(row.FechaApertura) ?? "N/A",
    "Fecha maxima de solución": toISODateFlex(row.TiempoSolucion) ?? "N/A",
    "Ultima actualización": toISODateFlex(row.UltimaActualizacion) ?? "N/A",
    "ANS": row.ANS ?? "N/A",
    "Estado": row.Estadodesolicitud ?? "N/A",
    "Categoria": (row.Categoria && row.SubCategoria) ? `${row.Categoria} > ${row.SubCategoria}` : "N/A",
  }));
}




