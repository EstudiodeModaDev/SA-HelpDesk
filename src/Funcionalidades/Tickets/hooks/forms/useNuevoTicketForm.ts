import * as React from "react";
import type { Holiday } from "festivos-colombianos";
import type { TZDate } from "@date-fns/tz";
import type { Ticket, TicketErrors } from "../../../../Models/Tickets";
import type { SubCategoria } from "../../../../Models/Categorias";
import { useGraphServices } from "../../../../graph/GrapServicesContext";
import { useAuth } from "../../../../Auth/authContext";
import { useTicketHolidays } from "../shared/useTicketHolidays";
import { useTicketCatalogos } from "../shared/useTicketCatalogos";
import { validateNuevoTicket } from "../../utils/ticketValidators";
import { horasPorANS } from "../../utils/ticketConstants";
import { calcularFechaSolucion } from "../../../../utils/Ans";
import { buildNuevoTicketPayload } from "../../utils/ticketPayloads";
import { logTicketCreated } from "../../../Log/utils/ticketsLogs";
import {
  notifyTicketCreatedResolutor,
  notifyTicketCreatedSolicitante,
  notifyTicketPendingApprovalJefeZona,
  notifyTicketPendingApprovalSolicitante,
} from "../../utils/notifications";
import { increaseResolverCaseCount } from "../../utils/ticketAssignment";
import { useFiles } from "../../../Commons/hooks/useFiles";
import { useTicketsAttachmentsList } from "../../../Attachments/Tickets-Attachments/hooks/useActions";
import { usePermissions } from "../../../usePermissions";
import {
  buildApprovalPendingLog,
  resolveApprovalTarget,
  shouldRequireApproval,
} from "../../utils/ticketApproval";

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
  Id_Subcategoria: "",
  Nombreresolutor: "",
  Observador: "",
  Solicitante: "",
  SubCategoria: "",
  TiempoSolucion: "",
  Title: "",
  id_Categoria: "",
  UltimaActualizacion: null,
};

export function useNuevoTicketForm() {
  const graph = useGraphServices();
  const auth = useAuth();
  const { groups, loading: permissionsLoading } = usePermissions();
  const attachmentsList = useTicketsAttachmentsList();
  const files = useFiles();

  const [state, setState] = React.useState<Ticket>(initialState);
  const [errors, setErrors] = React.useState<TicketErrors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [fechaSolucion, setFechaSolucion] = React.useState<Date | null>(null);

  const { holidays } = useTicketHolidays();
  const { categorias, subcategorias, loadingCatalogos, errorCatalogos } = useTicketCatalogos();

  const setField = <K extends keyof Ticket>(k: K, v: Ticket[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  const handleSubmit = async (e: React.FormEvent, ANS: string) => {
    e.preventDefault();

    if (permissionsLoading) {
      alert("Espera un momento mientras validamos tus permisos.");
      return;
    }

    const validation = validateNuevoTicket(state);
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      alert("Por favor corrige los errores en el formulario.");
      return;
    }

    setSubmitting(true);

    try {
      const apertura = new Date();
      let solucion: TZDate | null = null;

      const horasAns = horasPorANS[ANS] ?? 0;
      if (horasAns > 0) {
        solucion = calcularFechaSolucion(apertura, horasAns, holidays as Holiday[]);
        setFechaSolucion(solucion);
      }

      const requireApproval = shouldRequireApproval(groups);
      const approvalTarget = requireApproval
        ? await resolveApprovalTarget(graph.tiendasZonas, graph.jefesZona, state.Title ?? "")
        : null;

      const payload = await buildNuevoTicketPayload(state, ANS, apertura, solucion, graph.Usuarios, {
        requireApproval,
        approvalTarget,
      });

      const created = await graph.Tickets.create(payload);
      if (!created?.ID) {
        throw new Error("Tickets service no disponible o no fue posible crear el ticket");
      }

      if (files.files.length > 0) {
        await attachmentsList.handleCreateRelation(created.ID, files.files);
      }

      await logTicketCreated(graph.Logs, created.ID);

      if (requireApproval) {
        if (auth.account) {
          await graph.Logs.create(
            buildApprovalPendingLog(created.ID, auth.account, approvalTarget?.jefeZona ?? "")
          );
        }

        if (created.CorreoSolicitante) {
          await notifyTicketPendingApprovalSolicitante(graph.mail, created);
        }

        if (approvalTarget?.correoJefeZona) {
          await notifyTicketPendingApprovalJefeZona(graph.mail, created, approvalTarget);
        }
      } else {
        await increaseResolverCaseCount(graph.Usuarios, payload.Correoresolutor);

        if (created.CorreoSolicitante) {
          await notifyTicketCreatedSolicitante(graph.mail, created);
        }

        if (created.Correoresolutor) {
          await notifyTicketCreatedResolutor(graph.mail, created);
        }
      }

      alert(requireApproval ? "Se ha creado y enviado a aprobacion." : "Se ha creado con exito");

      setState(initialState);
      setErrors({});
      files.setFiles([]);
    } catch (err) {
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
    permissionsLoading,
    handleSubmit,
    setField,
    ...files,
  };
}
