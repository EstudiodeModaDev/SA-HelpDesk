import type { GraphRest } from "../graph/GraphRest";
import type { TiendaZona } from "../Models/TiendasZonas";
import { BaseSharePointListService } from "./base.Service";

export class TiendaZonaService extends BaseSharePointListService<TiendaZona> {
  constructor(graph: GraphRest) {
    super(
      graph,
      "estudiodemoda.sharepoint.com",
      "/sites/TransformacionDigital/IN/SA",
      "SA - TiendasZonas"
    );
  }

  protected toModel(item: any): TiendaZona {
    const f = item?.fields ?? {};
    const jefeZonaId =
      f.JefeZonaId ??
      f.JefeZonaLookupId ??
      f.JefedeZonaLookupId ??
      f.Jefe_x0020_de_x0020_ZonaLookupId ??
      "";
    const jefeZona =
      f.JefeZona ??
      f.JefedeZona ??
      f.Jefe_x0020_de_x0020_Zona ??
      f.JefeZonaLookupValue ??
      "";

    return {
      Id: String(item?.id ?? ''),
      Title: f.Title,
      Zona: f.Zona,
      JefeZonaId: String(jefeZonaId || ""),
      JefeZona: String(jefeZona || ""),
    };
  }
}
