import * as React from "react";
import { useGraphServices } from "../../../graph/GrapServicesContext";
import type {
  GraphFileAttachment,
  GraphRecipient,
  GraphSendMailPayload,
} from "../../../graph/GraphRest";
import type { Archivo } from "../../../Models/Attachments";
import type { Ticket } from "../../../Models/Tickets";
import { fileToBasePA64,  } from "../../../utils/Commons";
import { useProveedoresMailForm } from "./useProveedoresMailForm";

export function useProveedoresMail(ticket: Ticket, ticketAttachments: Archivo[] = []) {
  const graph = useGraphServices();
  const form = useProveedoresMailForm(ticket);

  const buildMailPayload = React.useCallback(async (): Promise<GraphSendMailPayload | null> => {
    const isValid = form.validate();
    if (!isValid) {
      alert("Hay algunos campos vacios");
      return null;
    }

    const toRecipients: GraphRecipient[] = [
      {
        emailAddress: {
          address: form.state.correo,
          name: form.state.para || undefined,
        },
      },
    ];

    const manualAttachments: GraphFileAttachment[] = await Promise.all(
      form.state.adjuntos.map(async (file) => ({
        "@odata.type": "#microsoft.graph.fileAttachment",
        name: file.name,
        contentType: file.type || "application/octet-stream",
        contentBytes: await fileToBasePA64(file),
      }))
    );

    const ticketFileAttachments: GraphFileAttachment[] = await Promise.all(
      ticketAttachments
        .filter((archivo) => !archivo.isFolder)
        .map(async (archivo) => {
          const blob = await graph.ticketBiblioteca.getFileContent(archivo.id);
          return {
            "@odata.type": "#microsoft.graph.fileAttachment",
            name: archivo.name,
            contentType: blob.type || "application/octet-stream",
            contentBytes: await fileToBasePA64(blob),
          };
        })
    );

    const attachments: GraphFileAttachment[] = [...manualAttachments, ...ticketFileAttachments];

    return {
      message: {
        subject: form.state.asunto,
        body: {
          contentType: "HTML",
          content: form.state.mensaje,
        },
        toRecipients,
        attachments,
      },
      saveToSentItems: true,
    };
  }, [form]);

  const sendMail = React.useCallback(async () => {
    form.setSubmitting(true);

    try {
      const payload = await buildMailPayload();
      if (!payload) return false;

      await graph.mail.sendEmail(payload);
      form.resetForm();
      alert("Se ha enviado el correo con éxito")
      return true;
    } catch (e) {
      console.error("Error enviando correo al proveedor:", e);
      return false;
    } finally {
      form.setSubmitting(false);
    }
  }, [buildMailPayload, form, graph]);

  return {
    ...form,
    sendMail,
  };
}
