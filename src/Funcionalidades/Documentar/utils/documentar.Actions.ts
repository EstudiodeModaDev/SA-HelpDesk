import type { AccountInfo } from "@azure/msal-browser";
import { buildLogPayload } from "../utils/documentarTicket.mappers";
import { getClosedStatus } from "../utils/documentarTicket.rules";
import type { LogService } from "../../../services/Logs.service";
import type { Ticket } from "../../../Models/Tickets";
import type { TicketsService } from "../../../services/Tickets.service";
import type { Log } from "../../../Models/Log";
import { toGraphDateTime } from "../../../utils/Date";

type Params = {
  Logs: LogService;
  Tickets?: TicketsService;
};

export async function hasExistingSolution(Logs: LogService, ticketId: string | number): Promise<boolean> {
  const res = await Logs.getAll({
    filter: `fields/Title eq '${ticketId}' and fields/Tipo_de_accion eq 'solucion'`,
  });

  return (res?.items?.length ?? 0) > 0;
}

export async function createDocumentLog(Logs: LogService, params: {documentacion: string; tipo: "solucion" | "seguimiento"; ticket: Ticket; account: AccountInfo;}): Promise<Log> {
  const payload = buildLogPayload(params.documentacion, params.tipo, params.ticket, params.account );

  const created = await Logs.create(payload);
  return created;
}

export async function closeTicketIfNeeded(services: Params, tipo: "solucion" | "seguimiento", ticket: Ticket): Promise<string | null> {
  if (tipo !== "solucion") return null;
  if (!services.Tickets) throw new Error("Servicio Tickets no disponible.");

  const nuevoEstado = getClosedStatus(ticket);
  console.log(nuevoEstado)
  console.log(ticket.ID)
  await services.Tickets.update(ticket.ID!, { Estadodesolicitud: nuevoEstado });

  return nuevoEstado;
}

export async function updateLastActionOnTicket(services: TicketsService, ticket: Ticket): Promise<string | null> {
  await services.update(ticket.ID!, { UltimaActualizacion: toGraphDateTime(new Date()) });

  return "Exito";
}

export async function getSolutionDescription(Logs: LogService, ticketId: string | number): Promise<string> {
  const solucion = await Logs.getAll({
    filter: `fields/Title eq '${ticketId}' and fields/Tipo_de_accion eq 'solucion'`,
  });

  return solucion?.items?.[0]?.Descripcion ?? "";
}