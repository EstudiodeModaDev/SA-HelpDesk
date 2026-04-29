import { GraphRest } from '../graph/GraphRest';
import type { UsuariosSP } from '../Models/Usuarios';
import { BaseSharePointListService } from './base.Service';

export class UsuariosSPService extends BaseSharePointListService<UsuariosSP> {
  constructor(graph: GraphRest) {
    super(
      graph,
      "estudiodemoda.sharepoint.com",
      "/sites/TransformacionDigital/IN/SA",
      "SA - Resolutores"
    );
  }

  protected toModel(item: any): UsuariosSP {
    const f = item?.fields ?? {};

    return {
      Id: String(item?.ID ?? item.id ?? item.Id ??''),
      Title: f.Title,
      Correo: f.Correo,
      Rol: f.Rol,
      Numerodecasos: f.Numerodecasos,
      Disponible: f.Disponible,
    };
  }
}
