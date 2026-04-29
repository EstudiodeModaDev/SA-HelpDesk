import * as React from "react";
import type { Ticket } from "../../Models/Tickets";
import "./DetallesTickets.css";

import { ParseDateShow } from "../../utils/Date";
import HtmlContent from "../HtmlContent/Renderizador";
import TicketsAsociados from "./TicketsRelacionados/Relacionados";
import TicketHistorial from "../Seguimiento/Seguimiento";
import AsignarObservador from "./Modals/Observador";
import RecategorizarTicket from "./Modals/Recategorizar";
import { useTicketsAttachmentsList } from "../../Funcionalidades/Attachments/Tickets-Attachments/hooks/useActions";
import type { Archivo } from "../../Models/Attachments";
import { usePermissions } from "../../Funcionalidades/usePermissions";
import CorreoModal from "./Correo/Correo";
import { useProveedores } from "../../Funcionalidades/Proveedores/hooks/useProveedores";
import { useProveedoresMail } from "../../Funcionalidades/ProveedoresNotifications/hooks/useProveedoresMail";
import { useTickets } from "../../Funcionalidades/Tickets/hooks/Queries/useTickets";

type Props = {
  ticket: Ticket;
  onVolver: () => void;
  onDocumentar: () => Promise<void> | void;
  onAddObservador: (ticketId: string, correo: string, nombre: string) => Promise<void>;
};

export type Opcion = { value: string; label: string };

export function CaseDetail({ ticket, onVolver, onDocumentar }: Props) {
  const { engine } = usePermissions();
  const ticketAttachment = useTicketsAttachmentsList();
  const { proveedoresOptions } = useProveedores();
  const { addProveedor, loadFirstPage, updateSelectedTicket } = useTickets();
  const proveedorMailController = useProveedoresMail(ticket);

  const [selected, setSelected] = React.useState<Ticket>(ticket);
  const [attachments, setAttachments] = React.useState<Archivo[]>([]);
  const [showProveedor, setProveedor] = React.useState(false);
  const [showObservador, setShowObservador] = React.useState(false);
  const [showRecategorizar, setShowRecategorizar] = React.useState(false);

  React.useEffect(() => {
    setShowObservador(false);
    setShowRecategorizar(false);
  }, [ticket?.ID]);

  React.useEffect(() => {
    ticketAttachment.loadAttachments(ticket?.ID ?? "").then((files) => {
      setAttachments(files);
    });
  }, [ticket?.ID,]);

  React.useEffect(() => {
    setSelected(ticket);
  }, [ticket]);

  const categoria = React.useMemo(
    () => [selected?.Categoria, selected?.SubCategoria].filter(Boolean).join(" > "),
    [selected?.Categoria, selected?.SubCategoria]
  );

  const onSendMail = React.useCallback(async () => {
    const proveedorName = proveedorMailController.state.para

    await Promise.all([
      addProveedor(ticket.ID ?? "", proveedorName),
      proveedorMailController.sendMail(),
      updateSelectedTicket(ticket.ID ?? ""),
      loadFirstPage(),
    ]);

    setProveedor(false);
  }, [addProveedor, proveedorMailController, ticket.ID, updateSelectedTicket, loadFirstPage,]);


  if (!selected) return <div>Ticket no encontrado</div>;

  return (
    <section className="ticket-case">
      <header className="ticket-case__hero">
        <div className="ticket-case__hero-main">
          <div className="ticket-case__eyebrow">
            <span className="ticket-case__id">Caso #{selected.ID}</span>

            <span
              className={`ticket-case__status ${
                selected.Estadodesolicitud === "Cerrado"
                  ? "is-closed"
                  : selected.Estadodesolicitud === "En Atención"
                    ? "is-open"
                    : "is-out"
              }`}
              title={selected.Estadodesolicitud ?? ""}
            >
              {selected.Estadodesolicitud ?? "Sin estado"}
            </span>
          </div>

          <h2 className="ticket-case__title">
            <Trunc text={selected.Title || "Sin título"} lines={2} />
          </h2>
        </div>

        <div className="ticket-case__hero-actions">
          <button type="button" className="ticket-btn ticket-btn--ghost" onClick={onVolver}>
            ← Volver
          </button>

          <button type="button" className="ticket-btn ticket-btn--primary" onClick={() => setProveedor(true)}>
            Enviar correo a proveedor
          </button>
        </div>
      </header>

      <div className="ticket-case__layout">
        <main className="ticket-case__main">
          <aside className="ticket-case__side">
            <section className="ticket-panel ticket-panel--people">
              <div className="ticket-panel__head">
                <h3 className="ticket-panel__title">Personas involucradas</h3>
              </div>

              <div className="people-list">
                <div className="person-card">
                  <div className="person-card__label">Solicitante</div>
                  <div className="person-card__value">
                    <Trunc text={selected.Solicitante || "—"} lines={1} maxLenght={30} />
                  </div>
                </div>

                <div className="person-card">
                  <div className="person-card__label">Observador</div>
                  <div className="person-card__value">
                    {engine.can("tickets.change") ? (
                      <button type="button" className="ticket-link-btn" onClick={() => setShowObservador(true)}>
                        <Trunc text={selected.Observador || "-----------"} lines={1} maxLenght={30} />
                      </button>
                    ) : (
                      <Trunc text={selected.Observador || "-----------"} lines={1} maxLenght={30} />
                    )}
                  </div>
                </div>

                <div className="person-card">
                  <div className="person-card__label">Espacio fisico</div>
                  <div className="person-card__value">
                    <Trunc text={selected.Title || "—"} lines={1} maxLenght={30} />
                  </div>
                </div>

                <div className="person-card">
                  <div className="person-card__label">Resolutor</div>
                  <div className="person-card__value">
                    <Trunc text={selected.Nombreresolutor || "-----------"} lines={1} maxLenght={30} />
                  </div>
                </div>
              </div>
            </section>
          </aside>

          <section className="ticket-panel ticket-panel--metrics">
            <div className="ticket-metric">
              <span className="ticket-metric__label">Fecha de apertura</span>
              <strong className="ticket-metric__value">
                <Trunc text={ParseDateShow(selected.FechaApertura ?? "") ?? "—"} />
              </strong>
            </div>

            <div className="ticket-metric">
              <span className="ticket-metric__label">Fecha de solución</span>
              <strong className="ticket-metric__value">
                <Trunc text={ParseDateShow(selected.TiempoSolucion ?? "") ?? "—"} />
              </strong>
            </div>

            <div className="ticket-metric">
              <span className="ticket-metric__label">ANS</span>
              <strong className="ticket-metric__value">
                <Trunc text={selected.ANS ?? "N/A"} lines={1} />
              </strong>
            </div>

            <div className="ticket-metric">
              <span className="ticket-metric__label">Categoría</span>
              <div className="ticket-metric__value">
                {engine.can("tickets.change") ? (
                  <button type="button" className="ticket-link-btn" onClick={() => setShowRecategorizar(true)}>
                    <span className="ticket-clamp">{categoria || "-----------"}</span>
                  </button>
                ) : (
                  <span className="ticket-clamp">{categoria || "-----------"}</span>
                )}
              </div>
            </div>

            <div className="ticket-metric">
              <span className="ticket-metric__label">Proveedor asignado</span>
              <div className="ticket-metric__value">
                <span className="ticket-clamp">{selected.Proveedor || "No ha sido asignado a ninguno proveedor"}</span>
              </div>
            </div>
          </section>

          <section className="ticket-panel ticket-panel--content">
            <div className="ticket-block">
              <div className="ticket-block__label">Descripción</div>
              <div className="ticket-block__value ticket-block__value--html html-trunc">
                <HtmlContent html={selected.Descripcion ?? ""} />
              </div>
            </div>

            {Array.isArray(attachments) && (
              <section className="ticket-panel ticket-panel--attachments">
                <div className="ticket-panel__head">
                  <h3 className="ticket-panel__title">Adjuntos</h3>
                  <span className="ticket-panel__count">{attachments.length}</span>
                </div>

                {attachments.length === 0 ? (
                  <p className="ticket-empty">Sin adjuntos.</p>
                ) : (
                  <ul className="attachment-list" role="list">
                    {attachments.map((r: Archivo, i: number) => {
                      const name = r?.name ?? `Archivo ${i + 1}`;
                      const href = r?.webUrl ?? "";
                      if (!href) return null;

                      return (
                        <li key={`${href}-${i}`} className="attachment-item">
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="attachment-link"
                            title={name}
                          >
                            <span className={`attachment-link__icon ext-${name}`} aria-hidden />
                            <span className="attachment-link__text">
                              <Trunc text={name} lines={1} />
                            </span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            )}
          </section>

          <section className="ticket-panel ticket-panel--history">
            <div className="ticket-panel__head">
              <h3 className="ticket-panel__title">Historial y seguimiento</h3>
            </div>

            <div className="ticket-panel__body">
              <TicketHistorial ticketId={selected.ID!} ticket={selected} onAddClick={onDocumentar} />
            </div>
          </section>

          <section className="ticket-panel ticket-panel--related">
            <div className="ticket-panel__head">
              <h3 className="ticket-panel__title">Tickets relacionados</h3>
            </div>

            <div className="ticket-panel__body">
              <TicketsAsociados
                key={String(selected.ID)}
                ticket={selected}
                onTicketChanged={onDocumentar}
                onSelect={(t: Ticket) => {
                  setSelected(t);
                }}
              />
            </div>
          </section>
        </main>
      </div>

      {showObservador && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={`Asignar observador al ticket ${selected.ID}`}>
          <div className="modal-card">
            <div className="modal-head">
              <h3>Asignar observador a ticket #{selected.ID}</h3>
              <button type="button" className="modal-close" onClick={() => setShowObservador(false)} aria-label="Cerrar">
                X
              </button>
            </div>

            <div className="modal-body">
              <AsignarObservador ticket={selected} onDone={() => setShowObservador(false)} />
            </div>
          </div>
        </div>
      )}

      {showRecategorizar && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={`Recategorizar ticket ${selected.ID}`}>
          <div className="modal-card">
            <div className="modal-head">
              <h3>Recategorizar ticket #{selected.ID}</h3>
              <button type="button" className="modal-close" onClick={() => setShowRecategorizar(false)} aria-label="Cerrar">
                X
              </button>
            </div>

            <div className="modal-body">
              <RecategorizarTicket
                ticket={selected}
                onDone={async () => {
                  setShowRecategorizar(false);
                  await onDocumentar();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {showProveedor && (
        <div className="modal-overlay">
          <CorreoModal
            onClose={() => setProveedor(false)}
            onSubmit={onSendMail}
            options={proveedoresOptions}
            setField={proveedorMailController.setField}
            errors={proveedorMailController.errors}
            state={proveedorMailController.state}
            handleAddFiles={proveedorMailController.handleAddFiles}
            handleRemoveFiles={proveedorMailController.handleRemoveFile}
          />
        </div>
      )}
    </section>
  );
}

type TruncProps = { text?: string | null; lines?: number; className?: string; maxLenght?: number };

export default function Trunc({ text, lines = 1, className = "" }: TruncProps) {
  const safe = (text ?? "—").toString();
  return (
    <span className={`ttip trunc ${className}`} data-full={safe} style={{ ["--lines" as any]: String(lines) }} aria-label={safe}>
      {safe}
    </span>
  );
}
