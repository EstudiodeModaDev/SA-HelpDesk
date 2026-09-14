import type { DateRange, GetAllOpts } from "../../../../Models/Commons";
import type { SortDir, SortField, Ticket } from "../../../../Models/Tickets";
import type { TiendaZona } from "../../../../Models/TiendasZonas";
import type { TiendaZonaService } from "../../../../services/TiendasZonas.Service";
import { escapeOData } from "../../../../utils/Commons";
import {
  ESTADO_EN_ATENCION,
  ESTADO_FUERA_TIEMPO,
  ESTADO_NO_APROBADO,
  ESTADO_PENDIENTE_APROBACION,
  FILTRO_SIN_APROBACION,
  SIN_PROVEEDOR_VALUE,
} from "../../utils/ticketConstants";

export const sortFieldToOData: Record<SortField, string> = {
  id: "Id",
  FechaApertura: "fields/FechaApertura",
  TiempoSolucion: "fields/TiempoSolucion",
  Title: "fields/Title",
  resolutor: "fields/Nombreresolutor",
};

export async function buildTicketsFilter(
  params: {
    espacio: string;
    view: boolean;
    userMail: string;
    filterMode: string;
    range: DateRange;
    pageSize: number;
    sorts: Array<{ field: SortField; dir: SortDir }>;
    servicio: TiendaZonaService;
    proveedor: string;
    tienda: string;
  }
): Promise<GetAllOpts> {
  const { view, userMail, filterMode, range, pageSize, sorts, espacio, servicio, proveedor, tienda } = params;

  const filters: string[] = [];
  const isAdmin = view;

  if (!isAdmin) {
    const emailSafe = String(userMail ?? "").replace(/'/g, "''");
    const myVisibility =
      `(fields/CorreoSolicitante eq '${emailSafe}' or ` +
      `fields/CorreoObservador eq '${emailSafe}' or ` +
      `fields/Correoresolutor eq '${emailSafe}')` 

    filters.push(myVisibility);
  }

  if (filterMode === "En curso") {
    filters.push(
      `(fields/Estadodesolicitud eq '${ESTADO_EN_ATENCION}' or ` +
      `fields/Estadodesolicitud eq 'En Atención' or ` +
      `fields/Estadodesolicitud eq '${ESTADO_FUERA_TIEMPO}')`
    );
  } else if (filterMode === FILTRO_SIN_APROBACION) {
    filters.push(
      `(fields/Estadodesolicitud eq '${ESTADO_PENDIENTE_APROBACION}' or ` +
      `fields/Estadodesolicitud eq '${ESTADO_NO_APROBADO}')`
    );
  } else if (filterMode !== "Todos") {
    filters.push(
      `(startswith(fields/Estadodesolicitud,'Cerrado') or fields/Estadodesolicitud eq '${ESTADO_NO_APROBADO}')`
    );
  }

  if (espacio) {
    const tiendas = await getShopsByZone({ zona: espacio }, servicio);
    const tiendasFilter = tiendas
      .map((tienda) => String(tienda.Title ?? "").trim())
      .filter(Boolean)
      .map((nombre) => `fields/Title eq '${escapeOData(nombre)}'`)
      .join(" or ");

    if (tiendasFilter) {
      filters.push(`(${tiendasFilter})`);
    }
  }

  if (range.from && range.to && range.from < range.to) {
    filters.push(`fields/TiempoSolucion ge '${range.from}T00:00:00Z'`);
    filters.push(`fields/TiempoSolucion le '${range.to}T23:59:59Z'`);
  }

  if (proveedor === SIN_PROVEEDOR_VALUE) {
    filters.push(`(fields/Proveedor eq null or fields/Proveedor eq '')`);
  } else if (proveedor) {
    filters.push(`fields/Proveedor eq '${escapeOData(proveedor)}'`);
  }

  if (tienda) {
    filters.push(`fields/Title eq '${escapeOData(tienda)}'`);
  }

  const orderParts = sorts
    .map((s) => {
      const col = sortFieldToOData[s.field];
      return col ? `${col} ${s.dir}` : "";
    })
    .filter(Boolean);

  if (!sorts.some((s) => s.field === "id")) {
    orderParts.push("ID desc");
  }

  return {
    filter: filters.join(" and "),
    orderby: orderParts.join(","),
    top: pageSize,
  };
}

/**
 * Re-aplica en cliente las mismas reglas de negocio de buildTicketsFilter, pero sobre un
 * conjunto acotado de tickets ya resueltos por ID (candidatos de busqueda por texto libre).
 * Necesario porque Graph no soporta filtrar $filter por el id de un list item de SharePoint.
 */
export function ticketMatchesFilters(
  ticket: Ticket,
  params: {
    view: boolean;
    userMail: string;
    filterMode: string;
    range: DateRange;
    proveedor: string;
    tienda: string;
  },
  tiendasEnZona?: Set<string>
): boolean {
  const { view, userMail, filterMode, range, proveedor, tienda } = params;
  const isAdmin = view;

  if (!isAdmin) {
    const mail = String(userMail ?? "");
    const visible =
      ticket.CorreoSolicitante === mail ||
      ticket.CorreoObservador === mail ||
      ticket.Correoresolutor === mail;
    if (!visible) return false;
  }

  const estado = ticket.Estadodesolicitud ?? "";
  if (filterMode === "En curso") {
    const enCurso =
      estado === ESTADO_EN_ATENCION ||
      estado === "En Atención" ||
      estado === ESTADO_FUERA_TIEMPO;
    if (!enCurso) return false;
  } else if (filterMode === FILTRO_SIN_APROBACION) {
    const sinAprobacion =
      estado === ESTADO_PENDIENTE_APROBACION || estado === ESTADO_NO_APROBADO;
    if (!sinAprobacion) return false;
  } else if (filterMode !== "Todos") {
    const cerrado = estado.startsWith("Cerrado") || estado === ESTADO_NO_APROBADO;
    if (!cerrado) return false;
  }

  if (tiendasEnZona && !tiendasEnZona.has(String(ticket.Title ?? "").trim())) {
    return false;
  }

  if (range.from && range.to && range.from < range.to) {
    const solucion = ticket.TiempoSolucion ?? "";
    if (!solucion) return false;
    if (solucion < `${range.from}T00:00:00Z` || solucion > `${range.to}T23:59:59Z`) return false;
  }

  if (proveedor === SIN_PROVEEDOR_VALUE) {
    if (ticket.Proveedor) return false;
  } else if (proveedor && ticket.Proveedor !== proveedor) {
    return false;
  }
  if (tienda && ticket.Title !== tienda) return false;

  return true;
}

export async function getShopsByZone(params: { zona: string }, servicio: TiendaZonaService): Promise<TiendaZona[]> {
  const { zona } = params;

  try {
    const tiendasZonas: TiendaZona[] = (await servicio.getAll({ filter: `fields/Zona eq '${escapeOData(zona)}'` })).items;
    return tiendasZonas;
  } catch {
    return [];
  }
}
