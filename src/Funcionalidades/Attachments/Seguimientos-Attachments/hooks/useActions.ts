import { useGraphServices } from "../../../../graph/GrapServicesContext";
import type { Archivo, SeguimientoAttachment } from "../../../../Models/Attachments";
import type { LogConAdjuntos } from "../../../../Models/Log";
import { useSeguimientosAttachment } from "../../Library/SeguimientosAttachmentLibrary/useTicketAttachment";

export function useSeguimientosAttachmentsList() {
  const services = useGraphServices()
  const libraryController = useSeguimientosAttachment()

  const handleCreateRelation = async (seguimientoId: string, file: File[]) => {
    try{
      for(const f of file) {
        const createdAttachment = await libraryController.handleUploadClick("/Seguimientos", f, `Ticket_Attachment_${seguimientoId}`)
        const attachMentId = createdAttachment?.id
        if(attachMentId) {
          const payload: SeguimientoAttachment = {
            IdAttachment: attachMentId,
            IdSeguimiento: seguimientoId,
            Title: `Relación Seguimiento ${seguimientoId} - Attachment ${attachMentId}`,
          }
          await services.seguimientosAttachments.create(payload)
        }  
      }
    } catch(e: any) {
      console.error(e);
      alert("Error creando relación: " + e.message);
    }
  }

  const loadAttachments = async (seguimientoId: string,): Promise<Archivo[]> => {
    try{
      const relations = await services.seguimientosAttachments.getAll({ filter: `fields/IdSeguimiento eq '${seguimientoId}'`});
      if(relations.items.length === 0) return []
      const file = await libraryController.reload(relations.items)
      return file
    } catch(e: any) {
      console.error(e);
      alert("Error creando relación: " + e.message);
      return []
    }
  }

  const loadSeguimientosConAdjuntos = async (ticketId: string,): Promise<LogConAdjuntos[]> => {
    const seguimientos = await services.Logs.getAll({filter: `fields/Title eq '${ticketId}'`});

    const items = await Promise.all(
      seguimientos.items.map(async (seg) => {
        console.log(ticketId)
        const attachments = await loadAttachments(seg.Id!);
        console.log(attachments)
        const obj: LogConAdjuntos = {
          Actor: seg.Actor,
          attachments: attachments,
          CorreoActor: seg.CorreoActor,
          Descripcion: seg.Descripcion,
          Tipo_de_accion: seg.Tipo_de_accion,
          Title: seg.Title,
          Created: seg.Created,

        }
        return  obj
        
      })
    );

    return items;
  };

  return { handleCreateRelation, loadAttachments, loadSeguimientosConAdjuntos };
}
