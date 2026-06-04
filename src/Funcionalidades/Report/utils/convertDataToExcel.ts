import type { Ticket } from "../../../Models/Tickets";
import { toISODateFlex } from "../../../utils/Date";

export function htmlToPlainText(html?: string | null): string {
  if (!html) return "";

  const doc = new DOMParser().parseFromString(html, "text/html");

  doc.querySelectorAll("br").forEach((el) => el.replaceWith("\n"));
  doc.querySelectorAll("p, div, li").forEach((el) => el.append("\n"));

  return (doc.body.textContent ?? "")
    .replace(/\u00A0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n/g, "\n")
    .trim();
}

export function buildTicketsData(rows: Ticket[]) {
  return rows.map((row) => ({
    ID: row.ID ?? "N/A",
    "Espacio Fisico": row.Title ?? "N/A",
    Proveedor: row.Proveedor ?? "N/A",
    Resolutor: row.Nombreresolutor ?? "N/A",
    Solicitante: row.Solicitante ?? "N/A",
    "Fecha de apertura": toISODateFlex(row.FechaApertura) ?? "N/A",
    "Fecha maxima de solucion": toISODateFlex(row.TiempoSolucion) ?? "N/A",
    "Ultima actualizacion": toISODateFlex(row.UltimaActualizacion) ?? "N/A",
    ANS: row.ANS ?? "N/A",
    "Descripcion del problema": htmlToPlainText(row.Descripcion) ?? "N/A",
    Estado: row.Estadodesolicitud ?? "N/A",
    Categoria:
      row.Categoria && row.SubCategoria
        ? `${row.Categoria} > ${row.SubCategoria}`
        : "N/A",
  }));
}
