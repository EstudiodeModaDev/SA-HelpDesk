import type { GraphRest } from "../graph/GraphRest";
import type { SeguimientoAttachment } from "../Models/Attachments";
import { BaseSharePointListService } from "./base.Service";

export class SeguimientosAttachmentsService extends BaseSharePointListService<SeguimientoAttachment> {
  constructor(graph: GraphRest) {
    super(
      graph,
      "estudiodemoda.sharepoint.com",
      "/sites/TransformacionDigital/IN/SA",
      "SA - SeguimientosAttachments"
    );
  }

  protected toModel(item: any): SeguimientoAttachment {
    const f = item?.fields ?? {};

    return {
      Id: String(item?.id ?? ''),
      Title: f.Title,
      IdSeguimiento: f.IdSegumiento,
      IdAttachment: f.IdAttachment
    };
  }
}