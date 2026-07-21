import type { Ticket } from "../../../Models/Tickets";
import { normalizeStatus } from "../../Tickets/utils/ticketConstants";

export function canDocumentTicket(ticket: Ticket): { valid: boolean; message?: string } {
  if (!ticket.Categoria) {
    return {
      valid: false,
      message: "No puedes hacer ninguna accion en el ticket antes de categorizarlo",
    };
  }

  const estado = normalizeStatus(ticket.Estadodesolicitud);
  if (estado === "pendiente aprobacion") {
    return {
      valid: false,
      message: "No puedes documentar un ticket mientras esta pendiente de aprobacion.",
    };
  }

  if (estado.includes("no aprobado")) {
    return {
      valid: false,
      message: "No puedes documentar un ticket que no fue aprobado.",
    };
  }

  return { valid: true };
}

export function getClosedStatus(ticket: Ticket): string {
  return normalizeStatus(ticket.Estadodesolicitud) === "en atencion"
    ? "Cerrado"
    : "Cerrado fuera de tiempo";
}
