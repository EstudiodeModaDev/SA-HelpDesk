import type { GraphRest } from "../../graph/GraphRest";
import type { jefeZona } from "../../Models/TiendasZonas";
import { BaseSharePointListService } from "../base.Service";


export class JefeZonaService extends BaseSharePointListService<jefeZona> {
  constructor(graph: GraphRest) {
    super(
      graph,
      "estudiodemoda.sharepoint.com",
      "/sites/TransformacionDigital/IN/SA",
      "SA - JEFES ZONA"
    );
  }

  protected toModel(item: any): jefeZona {
    const f = item?.fields ?? {};
  return {
      Id: String(item?.id ?? ''),
      Title: f.Title,
      Activo: f.Activo,
      Correo: f.Correo
    };
  }
}