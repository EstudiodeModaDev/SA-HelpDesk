import * as React from "react";
import "./Aprobaciones.css";
import { useAuth } from "../../Auth/authContext";
import { useGraphServices } from "../../graph/GrapServicesContext";
import type { Ticket } from "../../Models/Tickets";
import HtmlContent from "../HtmlContent/Renderizador";
import TicketHistorial from "../Seguimiento/Seguimiento";
import { ParseDateShow } from "../../utils/Date";
import { useTicketHolidays } from "../../Funcionalidades/Tickets/hooks/shared/useTicketHolidays";
import {
  approvePendingTicket,
  rejectPendingTicket,
} from "../../Funcionalidades/Tickets/utils/ticketApproval";
import {
  notifyTicketCreatedResolutor,
  notifyTicketCreatedSolicitante,
  notifyTicketRejectedSolicitante,
} from "../../Funcionalidades/Tickets/utils/notifications";
import { ESTADO_PENDIENTE_APROBACION } from "../../Funcionalidades/Tickets/utils/ticketConstants";

export default function AprobacionesTickets() {
  const auth = useAuth();
  const graph = useGraphServices();
  const { holidays } = useTicketHolidays();
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [selected, setSelected] = React.useState<Ticket | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [reason, setReason] = React.useState("");
  const [acting, setActing] = React.useState<"approve" | "reject" | null>(null);

  const loadPendingTickets = React.useCallback(async () => {
    const mail = String(auth.account?.username ?? "").trim();
    if (!mail) return;

    setLoading(true);
    setError(null);

    try {
      const result = await graph.Tickets.getAll({
        filter: `fields/Estadodesolicitud eq '${ESTADO_PENDIENTE_APROBACION}' and fields/CorreoObservador eq '${mail.replace(/'/g, "''")}'`,
        orderby: "id desc",
      });
      setTickets(result.items);
      setSelected((current) => {
        if (!result.items.length) return null;
        if (!current?.ID) return result.items[0];
        return result.items.find((ticket) => ticket.ID === current.ID) ?? result.items[0];
      });
    } catch (e: any) {
      setError(e?.message ?? "No fue posible cargar las aprobaciones.");
      setTickets([]);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  }, [auth.account?.username, graph.Tickets]);

  React.useEffect(() => {
    void loadPendingTickets();
  }, [loadPendingTickets]);

  const handleApprove = React.useCallback(async () => {
    if (!selected || !auth.account) return;

    setActing("approve");
    setError(null);
    try {
      const updated = await approvePendingTicket({
        ticket: selected,
        account: auth.account,
        holidays,
        tickets: graph.Tickets,
        logs: graph.Logs,
        usuarios: graph.Usuarios,
      });

      if (updated.CorreoSolicitante) {
        await notifyTicketCreatedSolicitante(graph.mail, updated);
      }

      if (updated.Correoresolutor) {
        await notifyTicketCreatedResolutor(graph.mail, updated);
      }

      setReason("");
      await loadPendingTickets();
    } catch (e: any) {
      setError(e?.message ?? "No fue posible aprobar el ticket.");
    } finally {
      setActing(null);
    }
  }, [auth.account, graph.Logs, graph.Tickets, graph.Usuarios, graph.mail, holidays, loadPendingTickets, selected]);

  const handleReject = React.useCallback(async () => {
    if (!selected || !auth.account) return;

    setActing("reject");
    setError(null);
    try {
      const updated = await rejectPendingTicket({
        ticket: selected,
        tickets: graph.Tickets,
        logs: graph.Logs,
        account: auth.account,
        reason,
      });

      if (updated.CorreoSolicitante) {
        await notifyTicketRejectedSolicitante(graph.mail, updated, "El jefe de zona no aprobo el ticket");
      }

      setReason("");
      await loadPendingTickets();
    } catch (e: any) {
      setError(e?.message ?? "No fue posible rechazar el ticket.");
    } finally {
      setActing(null);
    }
  }, [auth.account, graph.Logs, graph.Tickets, graph.mail, loadPendingTickets, reason, selected]);

  return (
    <section className="approvalsPage">
      <aside className="approvalsPanel">
        <div className="approvalsPanel__head">
          <h2 className="approvalsPanel__title">Aprobaciones pendientes</h2>
          <p className="approvalsPanel__subtitle">
            Revisa los tickets que requieren aprobacion para tu zona.
          </p>
        </div>

        {loading ? (
          <div className="approvalsEmpty">Cargando tickets pendientes...</div>
        ) : tickets.length === 0 ? (
          <div className="approvalsEmpty">No tienes tickets pendientes por aprobar.</div>
        ) : (
          <div className="approvalsList">
            {tickets.map((ticket) => (
              <button
                key={ticket.ID}
                type="button"
                className={`approvalCard ${selected?.ID === ticket.ID ? "is-active" : ""}`}
                onClick={() => setSelected(ticket)}
              >
                <div className="approvalCard__id">Caso #{ticket.ID}</div>
                <p className="approvalCard__title">{ticket.Title || "Sin espacio fisico"}</p>
                <p className="approvalCard__meta">{ticket.Solicitante || "Solicitante no disponible"}</p>
                <p className="approvalCard__meta">{ticket.Categoria || "Sin categoria"}</p>
              </button>
            ))}
          </div>
        )}
      </aside>

      <section className="approvalsDetail">
        <div className="approvalsDetail__head">
          <h2 className="approvalsDetail__title">
            {selected ? `Caso #${selected.ID}` : "Selecciona una solicitud"}
          </h2>
          <p className="approvalsDetail__subtitle">
            {selected
              ? "Aprueba para asignar el ticket con la logica actual o rechaza para cerrarlo."
              : "Aqui veras el detalle del ticket pendiente."}
          </p>
        </div>

        {!selected ? (
          <div className="approvalsEmpty">No hay un ticket seleccionado.</div>
        ) : (
          <div className="approvalsDetail__body">
            <div className="approvalsGrid">
              <div className="approvalsInfo">
                <span className="approvalsInfo__label">Solicitante</span>
                <div className="approvalsInfo__value">{selected.Solicitante || "—"}</div>
              </div>
              <div className="approvalsInfo">
                <span className="approvalsInfo__label">Espacio fisico</span>
                <div className="approvalsInfo__value">{selected.Title || "—"}</div>
              </div>
              <div className="approvalsInfo">
                <span className="approvalsInfo__label">Categoria</span>
                <div className="approvalsInfo__value">
                  {[selected.Categoria, selected.SubCategoria].filter(Boolean).join(" > ") || "—"}
                </div>
              </div>
              <div className="approvalsInfo">
                <span className="approvalsInfo__label">Fecha de solicitud</span>
                <div className="approvalsInfo__value">
                  {ParseDateShow(selected.FechaApertura ?? "") || "—"}
                </div>
              </div>
            </div>

            <div className="approvalsHtml">
              <HtmlContent html={selected.Descripcion ?? ""} />
            </div>

            <div className="approvalsActions">
              <textarea
                className="approvalsTextarea"
                placeholder="Motivo de rechazo (opcional). Si apruebas, este texto se ignorara."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />

              {error && <div className="approvalsError">{error}</div>}

              <div className="approvalsButtons">
                <button
                  type="button"
                  className="approvalsBtn approvalsBtn--approve"
                  onClick={handleApprove}
                  disabled={acting !== null}
                >
                  {acting === "approve" ? "Aprobando..." : "Aprobar y asignar"}
                </button>
                <button
                  type="button"
                  className="approvalsBtn approvalsBtn--reject"
                  onClick={handleReject}
                  disabled={acting !== null}
                >
                  {acting === "reject" ? "Rechazando..." : "Rechazar"}
                </button>
              </div>
            </div>

            <div>
              <TicketHistorial
                ticketId={selected.ID ?? ""}
                ticket={selected}
                onAddClick={() => {
                  void loadPendingTickets();
                }}
              />
            </div>
          </div>
        )}
      </section>
    </section>
  );
}
