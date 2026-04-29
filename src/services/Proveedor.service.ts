import type { GraphRest } from "../graph/GraphRest";
import type { Proveedor } from "../Models/Proveedores";
import { BaseSharePointListService } from "./base.Service";

export class ProveedorService extends BaseSharePointListService<Proveedor> {
  constructor(graph: GraphRest) {
    super(
      graph,
      "estudiodemoda.sharepoint.com",
      "/sites/TransformacionDigital/IN/SA",
      "SA - Proveedores"
    );
  }

  protected toModel(item: any): Proveedor {
    const f = item?.fields ?? {};

    return {
      Id: String(item?.id ?? ''),
      Title: f.Title,
      correoProveedor: f.correoProveedor
    };
  }
}