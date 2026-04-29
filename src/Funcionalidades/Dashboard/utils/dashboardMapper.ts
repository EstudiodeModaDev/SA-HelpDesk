import type { Ticket } from "../../../Models/Tickets";
import { norm } from "../../../utils/Ans";

export function getTicketEstado(t: Ticket): string {
  return (t?.Estadodesolicitud ?? "");
}

export function classifyEstado(raw: string) {
  const st = norm(raw).toLowerCase();

  return {
    raw: st,
    isAt: st === "cerrado" || st === "cerrado a tiempo",
    isLate: st === "fuera de tiempo" || st === "cerrado fuera de tiempo",
    isProg: st === "en atención" || st === "en atencion",
  };
}

export function getTicketField(t: any, ...keys: string[]): string {
  for (const key of keys) {
    if (t?.[key] != null && String(t[key]).trim()) return String(t[key]).trim();
    if (t?.fields?.[key] != null && String(t.fields[key]).trim()) return String(t.fields[key]).trim();
  }
  return "";
}

export function getFechaApertura(t: Ticket): string {
  return t?.FechaApertura ?? "";
}