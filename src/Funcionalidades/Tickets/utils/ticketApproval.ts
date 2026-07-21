import type { AccountInfo } from "@azure/msal-browser";
import type { Holiday } from "festivos-colombianos";
import type { Ticket } from "../../../Models/Tickets";
import type { TiendaZona, jefeZona } from "../../../Models/TiendasZonas";
import type { Log } from "../../../Models/Log";
import type { JefeZonaService } from "../../../services/Sharepoint/JefesZona.service";
import type { TiendaZonaService } from "../../../services/TiendasZonas.Service";
import type { TicketsService } from "../../../services/Tickets.service";
import type { LogService } from "../../../services/Logs.service";
import type { UsuariosSPService } from "../../../services/Usuarios.service";
import { toGraphDateTime } from "../../../utils/Date";
import { calcularFechaSolucion } from "../../../utils/Ans";
import {
  ESTADO_EN_ATENCION,
  ESTADO_NO_APROBADO,
  ESTADO_PENDIENTE_APROBACION,
  horasPorANS,
} from "./ticketConstants";
import { pickTecnicoConMenosCasos, increaseResolverCaseCount } from "./ticketAssignment";

export type ApprovalTarget = {
  jefeZonaId: string;
  jefeZona: string;
  correoJefeZona: string;
};

export async function resolveApprovalTarget(
  tiendasZonas: TiendaZonaService,
  jefesZona: JefeZonaService,
  espacioFisico: string
): Promise<ApprovalTarget> {
  const safeSpace = String(espacioFisico ?? "").trim();
  if (!safeSpace) {
    throw new Error("No fue posible resolver el jefe de zona porque el espacio fisico esta vacio.");
  }

  const tiendaZona = await findTiendaByTitle(tiendasZonas, safeSpace);
  if (!tiendaZona) {
    throw new Error(`No existe una relacion de Tienda/Zona para "${safeSpace}".`);
  }

  const jefe = await findActiveJefeZona(jefesZona, tiendaZona);
  if (!jefe?.Correo) {
    throw new Error(`El espacio "${safeSpace}" no tiene un jefe de zona activo con correo configurado.`);
  }

  return {
    jefeZonaId: String(jefe.Id ?? tiendaZona.JefeZonaId ?? ""),
    jefeZona: String(jefe.Title ?? tiendaZona.JefeZona ?? ""),
    correoJefeZona: String(jefe.Correo ?? "").trim(),
  };
}

async function findTiendaByTitle(servicio: TiendaZonaService, title: string): Promise<TiendaZona | null> {
  const result = await servicio.getAll({
    filter: `fields/Title eq '${title.replace(/'/g, "''")}'`,
    top: 1,
  });

  return result.items?.[0] ?? null;
}

async function findActiveJefeZona(servicio: JefeZonaService, tiendaZona: TiendaZona): Promise<jefeZona | null> {
  const jefeById = String(tiendaZona.JefeZonaId ?? "").trim();
  if (jefeById) {
    try {
      return await servicio.get(jefeById);
    } catch {
      // fallback by name
    }
  }

  const jefeName = String(tiendaZona.JefeZona ?? "").trim();
  if (!jefeName) return null;

  const result = await servicio.getAll({
    filter: `fields/Title eq '${jefeName.replace(/'/g, "''")}'`,
    top: 1,
  });

  return result.items?.[0] ?? null;
}

export function buildApprovalPendingLog(ticketId: string | number, account: AccountInfo, jefeZona: string): Log {
  return {
    Title: String(ticketId ?? ""),
    Actor: account.name ?? account.username ?? "Sistema",
    CorreoActor: account.username ?? "",
    Tipo_de_accion: "Solicitud aprobacion",
    Descripcion: `El ticket fue enviado a aprobacion de ${jefeZona}.`,
  };
}

export function buildApprovalRejectedLog(ticketId: string | number, account: AccountInfo, motivo: string): Log {
  return {
    Title: String(ticketId ?? ""),
    Actor: account.name ?? account.username ?? "Sistema",
    CorreoActor: account.username ?? "",
    Tipo_de_accion: "seguimiento",
    Descripcion: motivo,
  };
}

export function buildApprovalApprovedLog(ticketId: string | number, account: AccountInfo, resolutorNombre?: string): Log {
  return {
    Title: String(ticketId ?? ""),
    Actor: account.name ?? account.username ?? "Sistema",
    CorreoActor: account.username ?? "",
    Tipo_de_accion: "Aprobacion jefe zona",
    Descripcion: resolutorNombre
      ? `El jefe de zona aprobo el ticket y fue asignado a ${resolutorNombre}.`
      : "El jefe de zona aprobo el ticket.",
  };
}

export async function rejectPendingTicket(params: {
  ticket: Ticket;
  tickets: TicketsService;
  logs: LogService;
  account: AccountInfo;
  reason?: string;
}): Promise<Ticket> {
  const { ticket, tickets, logs, account, reason } = params;
  const motivo = (reason ?? "").trim() || "No fue aprobado por el jefe de zona.";

  const updated = await tickets.update(String(ticket.ID ?? ""), {
    Estadodesolicitud: ESTADO_NO_APROBADO,
    UltimaActualizacion: toGraphDateTime(new Date()) ?? null,
  });

  await logs.create(buildApprovalRejectedLog(String(ticket.ID ?? ""), account, motivo));
  return updated;
}

export async function approvePendingTicket(params: {
  ticket: Ticket;
  account: AccountInfo;
  holidays: Holiday[];
  tickets: TicketsService;
  logs: LogService;
  usuarios: UsuariosSPService;
}): Promise<Ticket> {
  const { ticket, account, holidays, tickets, logs, usuarios } = params;
  const apertura = new Date();
  const horasAns = horasPorANS[String(ticket.ANS ?? "")] ?? 0;
  const tiempoSolucion =
    horasAns > 0 ? toGraphDateTime(calcularFechaSolucion(apertura, horasAns, holidays)) : undefined;
  const resolutor = await pickTecnicoConMenosCasos(usuarios);

  const updated = await tickets.update(String(ticket.ID ?? ""), {
    Estadodesolicitud: ESTADO_EN_ATENCION,
    Nombreresolutor: resolutor?.Title ?? "",
    Correoresolutor: resolutor?.Correo ?? "",
    TiempoSolucion: tiempoSolucion,
    UltimaActualizacion: toGraphDateTime(apertura) ?? null,
  });

  if (resolutor?.Correo) {
    await increaseResolverCaseCount(usuarios, resolutor.Correo);
  }

  await logs.create(buildApprovalApprovedLog(String(ticket.ID ?? ""), account, resolutor?.Title));
  return updated;
}

export function shouldRequireApproval(groups: string[]): boolean {
  const safeGroups = new Set((groups ?? []).map((group) => String(group).trim()));
  return !safeGroups.has("SA-TICKETS-ADMINISTRADOR") && !safeGroups.has("SA-TICKETS-RESOLUTOR");
}

export function getPendingApprovalStatus(): string {
  return ESTADO_PENDIENTE_APROBACION;
}
