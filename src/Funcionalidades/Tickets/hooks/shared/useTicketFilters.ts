import type { DateRange, GetAllOpts } from "../../../../Models/Commons";
import type { SortDir, SortField } from "../../../../Models/Tickets";
import type { TiendaZona } from "../../../../Models/TiendasZonas";
import type { TiendaZonaService } from "../../../../services/TiendasZonas.Service";
import { escapeOData } from "../../../../utils/Commons";
import {
  ESTADO_EN_ATENCION,
  ESTADO_FUERA_TIEMPO,
  ESTADO_NO_APROBADO,
  ESTADO_PENDIENTE_APROBACION,
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
  }
): Promise<GetAllOpts> {
  const { view, userMail, filterMode, range, pageSize, sorts, espacio, servicio, proveedor } = params;

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
      `fields/Estadodesolicitud eq '${ESTADO_FUERA_TIEMPO}' or ` +
      `fields/Estadodesolicitud eq '${ESTADO_PENDIENTE_APROBACION}')`
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

  if (proveedor) {
    filters.push(`fields/Proveedor eq '${escapeOData(proveedor)}'`);
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

export async function getShopsByZone(params: { zona: string }, servicio: TiendaZonaService): Promise<TiendaZona[]> {
  const { zona } = params;

  try {
    const tiendasZonas: TiendaZona[] = (await servicio.getAll({ filter: `fields/Zona eq '${escapeOData(zona)}'` })).items;
    return tiendasZonas;
  } catch {
    return [];
  }
}
