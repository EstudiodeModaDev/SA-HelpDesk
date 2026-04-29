import type { DateRange } from "../../../Models/Commons";
import { toGraphDateTime, toISODateFlex } from "../../../utils/Date";

//Inicio del dia enviado en formato UTC (Z) para evitar problemas de zona horaria en consultas a APIs
export function toUtcDayStart(date: string): string {
  return `${date}T00:00:00Z`;
}

//Fin del dia enviado en formato UTC (Z) para evitar problemas de zona horaria en consultas a APIs
export function toUtcDayEnd(date: string): string {
  return `${date}T23:59:59Z`;
}

//Obtener el rango del mes actual en formato ISO (UTC) para consultas a APIs, evitando problemas de zona horaria
export function getCurrentMonthRange(): DateRange {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));

  return {
    from: toISODateFlex(start),
    to: toISODateFlex(end),
  };
}

//Obtener el rango del mes actual en formato para gráficos (UTC) para evitar problemas de zona horaria
export function getCurrentMonthGraphRange() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));

  return {
    from: toGraphDateTime(start),
    to: toGraphDateTime(end),
  };
}


export function toMonthKey(v: string | Date): string {
  const d = typeof v === "string" ? new Date(v) : v;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function toDayKey(v: string | Date): string {
  const d = typeof v === "string" ? new Date(v) : v;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}