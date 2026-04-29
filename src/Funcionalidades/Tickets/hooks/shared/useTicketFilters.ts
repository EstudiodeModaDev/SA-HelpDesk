import type { DateRange, GetAllOpts } from "../../../../Models/Commons";
import type { SortDir, SortField } from "../../../../Models/Tickets";
import type { TiendaZona } from "../../../../Models/TiendasZonas";
import type { TiendaZonaService } from "../../../../services/TiendasZonas.Service";
import { escapeOData } from "../../../../utils/Commons";

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
    servicio: TiendaZonaService
  }, 
  ): Promise<GetAllOpts> {
  const { view, userMail, filterMode, range, pageSize, sorts, espacio, servicio} = params;

  const filters: string[] = [];
  const isAdmin = view;

  if (!isAdmin) {
    const emailSafe = String(userMail ?? "").replace(/'/g, "''");

    const myVisibility =
      `(fields/CorreoSolicitante eq '${emailSafe}' or ` +
      `fields/CorreoObservador eq '${emailSafe}' or ` +
      `fields/Correoresolutor eq '${emailSafe}')`;

    filters.push(myVisibility);
  }

  if (filterMode === "En curso") {
    filters.push(
      `(fields/Estadodesolicitud eq 'En atención' or fields/Estadodesolicitud eq 'Fuera de tiempo')`
    );
  } else if (filterMode !== "Todos") {
    filters.push(`startswith(fields/Estadodesolicitud,'Cerrado')`);
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
    filters.push(`fields/FechaApertura ge '${range.from}T00:00:00Z'`);
    filters.push(`fields/FechaApertura le '${range.to}T23:59:59Z'`);
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

export async function getShopsByZone(params: {zona: string}, servicio: TiendaZonaService ): Promise<TiendaZona[]> {
  const { zona } = params;

  try{
    const tiendasZonas: TiendaZona[] = (await servicio.getAll({filter: `fields/Zona eq '${escapeOData(zona)}'`})).items
    return tiendasZonas
  } catch {
    return []
  }

}
