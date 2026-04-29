import React from "react";
import { useGraphServices } from "../../../graph/GrapServicesContext";
import { useDocumentarTicketForm } from "./useDocumentarTicketForm";
import type { Ticket } from "../../../Models/Tickets";
import type { AccountInfo } from "@azure/msal-browser";
import { canDocumentTicket } from "../utils/documentarTicket.rules";
import { closeTicketIfNeeded, createDocumentLog, getSolutionDescription, hasExistingSolution, updateLastActionOnTicket } from "../utils/documentar.Actions";
import { notifyClosedSolicitante } from "../../Tickets/utils/notifications";
import { useFiles } from "../../Commons/hooks/useFiles";
import { useSeguimientosAttachmentsList } from "../../Attachments/Seguimientos-Attachments/hooks/useActions";

export function useDocumentarTicket() {
  const graph= useGraphServices();
  const form = useDocumentarTicketForm();
  const attachments = useSeguimientosAttachmentsList()
  const files = useFiles()

  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = React.useCallback(
    async (
      e: React.FormEvent,
      tipo: "solucion" | "seguimiento",
      ticket: Ticket,
      account: AccountInfo
    ) => {
      e.preventDefault();
      
      if (!form.validate()) {
        alert("No se ha podido realizar el cambio")
        return
      };
      console.log("Starting")
      const canDocument = canDocumentTicket(ticket);
      if (!canDocument.valid) {
        alert(canDocument.message);
        return;
      }

      console.log("Iniciando documentación para ticket:", ticket.ID, "Tipo:", tipo);

      setSubmitting(true);

      try {
        if (tipo === "solucion") {
          const alreadyHasSolution = await hasExistingSolution(graph.Logs, ticket.ID!);

          if (alreadyHasSolution) {
            alert("Este ticket ya tiene una solución. No puedes escribir más de una por ticket.");
            return;
          }
        }

        const logCreated = await createDocumentLog(graph.Logs, {
          documentacion: form.state.Descripcion,
          tipo,
          ticket,
          account,
        });

        if (!logCreated?.Id) {
          throw new Error("No fue posible crear el registro de documentación.");
        }

        if (files.files.length > 0) {
          await attachments.handleCreateRelation(logCreated.Id, files.files);
        }
        
        const a = await updateLastActionOnTicket(graph.Tickets, ticket)
        console.log(a)
        form.reset();

        if (tipo === "solucion") {
          console.log("Cerrado")
          await closeTicketIfNeeded(
            { Logs: graph.Logs, Tickets: graph.Tickets },
            tipo,
            ticket
          );

          const detalleSolucion = await getSolutionDescription(graph.Logs, ticket.ID!);

          try {
            await notifyClosedSolicitante(graph.mail, ticket, detalleSolucion);
          } catch (mailError) {
            console.error("[Mail] Error enviando notificación:", mailError);
          }
        }
      } catch (err) {
        console.error("Error en handleSubmit:", err);
      } finally {
        setSubmitting(false);
      }
    },
    [form, graph, files.files, attachments]
  );

  return {
    state: form.state,
    errors: form.errors,
    setField: form.setField,
    submitting,
    handleSubmit,
    ...files
  };
}