import * as React from "react";
import type { Holiday } from "festivos-colombianos";
import type { Ticket } from "../../../../Models/Tickets";
import type { Categoria, SubCategoria } from "../../../../Models/Categorias";
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
import { usePermissions } from "../../../usePermissions";
import { buildApprovalPendingLog, resolveApprovalTarget, shouldRequireApproval } from "../../utils/ticketApproval";
import { useANS } from "../../utils/Ans";
import {
  parseTicketsExcelFile,
  downloadTicketsTemplate,
  findCategoriaByTitle,
  findSubcategoriaByTitle,
  type TicketDraft,
} from "../../utils/ticketsBulkExcel";

export type BulkTicketRowError = { row: number; message: string };

export type BulkTicketResult = {
  totalRows: number;
  processed: number;
  created: number;
  errors: BulkTicketRowError[];
};

function buildRowState(draft: TicketDraft, categoria: Categoria, subcategoria: SubCategoria): Ticket {
  return {
    Title: draft.title,
    Descripcion: draft.descripcion,
    Categoria: categoria.Title,
    SubCategoria: subcategoria.Title,
    id_Categoria: String(categoria.ID),
    Id_Subcategoria: String(subcategoria.ID),
    Solicitante: draft.nombreSolicitante || draft.correoSolicitante || "",
    CorreoSolicitante: draft.correoSolicitante || "",
    Observador: "",
    CorreoObservador: draft.correoObservador || "",
    Proveedor: draft.proveedor || "",
    IdCasoPadre: draft.idCasoPadre || "",
    ANS: "",
    UltimaActualizacion: null,
  };
}

export function useCargaMasivaTickets() {
  const graph = useGraphServices();
  const auth = useAuth();
  const { groups, loading: permissionsLoading } = usePermissions();
  const { holidays } = useTicketHolidays();
  const { categorias, subcategorias, loadingCatalogos, errorCatalogos } = useTicketCatalogos();
  const { obtainANS } = useANS(graph.ANS);

  const [file, setFile] = React.useState<File | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [progress, setProgress] = React.useState<{ current: number; total: number } | null>(null);
  const [result, setResult] = React.useState<BulkTicketResult | null>(null);
  const [downloadingTemplate, setDownloadingTemplate] = React.useState(false);

  const downloadTemplate = React.useCallback(async () => {
    setDownloadingTemplate(true);
    try {
      const [tiendasRes, proveedoresRes] = await Promise.all([
        graph.tiendasZonas.getAll({ top: 5000 }),
        graph.proveedor.getAll({ top: 5000 }),
      ]);

      await downloadTicketsTemplate(categorias, subcategorias, tiendasRes.items ?? [], proveedoresRes.items ?? []);
    } catch (err: any) {
      alert(err?.message ?? "No fue posible generar la plantilla.");
    } finally {
      setDownloadingTemplate(false);
    }
  }, [graph, categorias, subcategorias]);

  const processFile = React.useCallback(async () => {
    if (!file) {
      alert("Selecciona un archivo de Excel para continuar.");
      return;
    }

    if (permissionsLoading || loadingCatalogos) {
      alert("Espera a que terminen de cargar los catalogos y permisos.");
      return;
    }

    setSubmitting(true);
    setResult(null);

    const errors: BulkTicketRowError[] = [];
    let created = 0;

    try {
      const rows = await parseTicketsExcelFile(file);
      setProgress({ current: 0, total: rows.length });

      for (const row of rows) {
        try {
          const categoria = findCategoriaByTitle(categorias, row.draft.categoria);
          const subcategoria = categoria
            ? findSubcategoriaByTitle(subcategorias, categoria.ID, row.draft.subcategoria)
            : undefined;

          if (!categoria || !subcategoria) {
            errors.push({
              row: row.rowNumber,
              message: `No se encontro la categoria/subcategoria "${row.draft.categoria} / ${row.draft.subcategoria}".`,
            });
            continue;
          }

          const rowState = buildRowState(row.draft, categoria, subcategoria);
          const validation = validateNuevoTicket(rowState);
          if (Object.keys(validation).length > 0) {
            errors.push({ row: row.rowNumber, message: Object.values(validation).join(" ") });
            continue;
          }

          const ans = await obtainANS(String(categoria.ID), String(subcategoria.ID));
          rowState.ANS = ans?.Title ?? "";

          const apertura = new Date();
          const horasAns = horasPorANS[rowState.ANS ?? ""] ?? 0;
          const solucion = horasAns > 0 ? calcularFechaSolucion(apertura, horasAns, holidays as Holiday[]) : null;

          const requireApproval = shouldRequireApproval(groups);
          const approvalTarget = requireApproval
            ? await resolveApprovalTarget(graph.tiendasZonas, graph.jefesZona, rowState.Title ?? "")
            : null;

          const payload = await buildNuevoTicketPayload(
            rowState,
            rowState.ANS ?? "",
            apertura,
            solucion,
            graph.Usuarios,
            { requireApproval, approvalTarget }
          );

          const createdTicket = await graph.Tickets.create(payload);
          if (!createdTicket?.ID) {
            throw new Error("No fue posible crear el ticket.");
          }

          await logTicketCreated(graph.Logs, createdTicket.ID);

          if (requireApproval) {
            if (auth.account) {
              await graph.Logs.create(
                buildApprovalPendingLog(createdTicket.ID, auth.account, approvalTarget?.jefeZona ?? "")
              );
            }

            try {
              if (createdTicket.CorreoSolicitante) {
                await notifyTicketPendingApprovalSolicitante(graph.mail, createdTicket);
              }
              if (approvalTarget?.correoJefeZona) {
                await notifyTicketPendingApprovalJefeZona(graph.mail, createdTicket, approvalTarget);
              }
            } catch (notifyErr) {
              console.error("Error notificando aprobacion pendiente:", notifyErr);
            }
          } else {
            await increaseResolverCaseCount(graph.Usuarios, payload.Correoresolutor);

            try {
              if (createdTicket.CorreoSolicitante) {
                await notifyTicketCreatedSolicitante(graph.mail, createdTicket);
              }
              if (createdTicket.Correoresolutor) {
                await notifyTicketCreatedResolutor(graph.mail, createdTicket);
              }
            } catch (notifyErr) {
              console.error("Error notificando creacion de ticket:", notifyErr);
            }
          }

          created += 1;
        } catch (err: any) {
          errors.push({ row: row.rowNumber, message: err?.message ?? "Error desconocido creando el ticket." });
        } finally {
          setProgress((p) => (p ? { current: p.current + 1, total: p.total } : p));
        }
      }

      setResult({ totalRows: rows.length, processed: rows.length, created, errors });
    } catch (err: any) {
      alert(err?.message ?? "No fue posible leer el archivo de Excel.");
    } finally {
      setSubmitting(false);
      setProgress(null);
    }
  }, [file, permissionsLoading, loadingCatalogos, categorias, subcategorias, holidays, groups, graph, auth, obtainANS]);

  const reset = React.useCallback(() => {
    setFile(null);
    setResult(null);
  }, []);

  return {
    file,
    setFile,
    submitting,
    progress,
    result,
    processFile,
    downloadTemplate,
    downloadingTemplate,
    reset,
    loadingCatalogos,
    errorCatalogos,
    permissionsLoading,
  };
}
