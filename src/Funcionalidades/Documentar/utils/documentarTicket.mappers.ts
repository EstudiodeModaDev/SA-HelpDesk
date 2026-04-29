import type { AccountInfo } from "@azure/msal-browser";
import type { Ticket } from "../../../Models/Tickets";
import type { Log } from "../../../Models/Log";

export function buildLogPayload(documentacion: string, tipo: "solucion" | "seguimiento", ticket: Ticket, account: AccountInfo): Log {
  return {
    Actor: account.name ?? account.username ?? "",
    CorreoActor: account.username ?? "",
    Descripcion: documentacion,
    Tipo_de_accion: tipo,
    Title: String(ticket.ID ?? ""),
  };
}

