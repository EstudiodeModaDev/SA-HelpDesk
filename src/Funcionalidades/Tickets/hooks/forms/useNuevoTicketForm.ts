import * as React from "react";
import type { Holiday } from "festivos-colombianos";
import type { Ticket, TicketErrors } from "../../../../Models/Tickets";
import { useGraphServices } from "../../../../graph/GrapServicesContext";
import { useTicketHolidays } from "../shared/useTicketHolidays";
import { useTicketCatalogos } from "../shared/useTicketCatalogos";
import { validateNuevoTicket } from "../../utils/ticketValidators";
import type { TZDate } from "@date-fns/tz";
import { horasPorANS } from "../../utils/ticketConstants";
import { calcularFechaSolucion } from "../../../../utils/Ans";
import { buildNuevoTicketPayload } from "../../utils/ticketPayloads";

import { logTicketCreated } from "../../../Log/utils/ticketsLogs";
import { notifyTicketCreatedResolutor, notifyTicketCreatedSolicitante } from "../../utils/notifications";
import type { SubCategoria } from "../../../../Models/Categorias";
import { increaseResolverCaseCount, } from "../../utils/ticketAssignment";
import { useAuth } from "../../../../Auth/authContext";
import { useFiles } from "../../../Commons/hooks/useFiles";
import { useTicketsAttachmentsList } from "../../../Attachments/Tickets-Attachments/hooks/useActions";

const initialState: Ticket = {
  ANS: "",
  Categoria: "",
  CorreoObservador: "",
  Correoresolutor: "",
  CorreoSolicitante: "",
  Descripcion: "",
  Estadodesolicitud: "",
  FechaApertura: "",
  IdCasoPadre: "",
  IdResolutor: "",
  Nombreresolutor: "",
  Observador: "",
  Solicitante: "",
  SubCategoria: "",
  TiempoSolucion: "",
  Title: "",
  id_Categoria: "",
  Id_Subcategoria: "",
  UltimaActualizacion: null
};

export function useNuevoTicketForm() {
  const graph = useGraphServices();
  const attachmentsList = useTicketsAttachmentsList()
  const files = useFiles()
  const {account} = useAuth()
  const [state, setState] = React.useState<Ticket>(initialState);
  const [errors, setErrors] = React.useState<TicketErrors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [fechaSolucion, setFechaSolucion] = React.useState<Date | null>(null);

  const { holidays } = useTicketHolidays();
  const {categorias, subcategorias, loadingCatalogos, errorCatalogos,} = useTicketCatalogos();

  const setField = <K extends keyof Ticket>(k: K, v: Ticket[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  const handleSubmit = async (e: React.FormEvent, ANS: string) => {
    e.preventDefault();

    const validation = validateNuevoTicket(state);
    console.log(validation)
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      alert("Por favor corrige los errores en el formulario.");
      return;
    };

    setSubmitting(true);

    try {
      const apertura = new Date();
      let solucion: TZDate | null = null;

      const horasAns = horasPorANS[ANS] ?? 0;
      if (horasAns > 0) {
        solucion = calcularFechaSolucion(apertura, horasAns, holidays as Holiday[]);
        setFechaSolucion(solucion);
      }

      const payload = await buildNuevoTicketPayload(state, ANS, apertura, solucion, account, graph.Usuarios);
 
      const created = await graph.Tickets.create(payload);
      if (!created?.ID) {
        throw new Error("Tickets service no disponible o no fue posible crear el ticket");
      }

      //Subir archivos adjuntos antes de cualquier notificación
      if (files.files.length > 0) {
         await attachmentsList.handleCreateRelation(created.ID, files.files)
      }

      await increaseResolverCaseCount(graph.Usuarios, payload.Correoresolutor);
      await logTicketCreated(graph.Logs, created.ID);

      if (created.CorreoSolicitante) {
        await notifyTicketCreatedSolicitante(graph.mail, created);
      }

      if (created.Correoresolutor) {
        await notifyTicketCreatedResolutor(graph.mail, created);
      }

      alert("Se ha creado con éxito")

      setState(initialState);
      setErrors({});
      files.setFiles([]);
    } catch (err: any) {
      console.error("Error creando ticket:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    state,
    errors,
    submitting,
    fechaSolucion,
    categorias,
    subcategoriasAll: subcategorias as SubCategoria[],
    loadingCatalogos,
    errorCatalogos,
    handleSubmit,
    setField,
    ...files
  };
}