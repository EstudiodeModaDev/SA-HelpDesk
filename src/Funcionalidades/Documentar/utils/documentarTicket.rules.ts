import type { Ticket } from "../../../Models/Tickets";

export function canDocumentTicket(ticket: Ticket): { valid: boolean; message?: string } {
  if (!ticket.Categoria) {
    return {
      valid: false,
      message: "No puedes hacer ninguna acción en el ticket antes de categorizarlo",
    };
  }

  return { valid: true };
}

export function getClosedStatus(ticket: Ticket): string {
  return ticket.Estadodesolicitud === "En Atención"
    ? "Cerrado"
    : "Cerrado fuera de tiempo";
}