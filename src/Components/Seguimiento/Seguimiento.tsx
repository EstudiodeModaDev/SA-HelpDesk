import * as React from "react";
import "./Seguimiento.css";
import type { LogConAdjuntos } from "../../Models/Log";
import type { Ticket } from "../../Models/Tickets";           
import HtmlContent from "../HtmlContent/Renderizador";
import Documentar from "../Documentar/Documentar";
import { useSeguimientosAttachmentsList } from "../../Funcionalidades/Attachments/Seguimientos-Attachments/hooks/useActions";
import { usePermissions } from "../../Funcionalidades/usePermissions";

type Tab = "seguimiento" | "solucion";
type Mode = "detalle" | "documentar";                        

type Props = {
  ticketId: string | number;
  defaultTab?: Tab;
  className?: string;
  ticket: Ticket;
  onAddClick: () => void
};

export default function TicketHistorial({ticketId, defaultTab = "solucion", className, ticket, onAddClick}: Props) {
  const {engine} = usePermissions()
  const [tab, setTab] = React.useState<Tab>(defaultTab);
  const [mode, setMode] = React.useState<Mode>("detalle"); 
  const isPrivileged = engine.can("tickets.change");

            

  const [mensajes, setMensajes] = React.useState<LogConAdjuntos[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const attachments = useSeguimientosAttachmentsList()

  // Cargar historial SOLO en modo detalle
  React.useEffect(() => {
    if (mode !== "detalle") return;

    let cancel = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const items = await attachments.loadSeguimientosConAdjuntos(String(ticket.ID ?? ""));
        console.log(items)
        if (cancel) return;
        setMensajes(items);
      } catch (e: any) {
        if (cancel) return;
        setError(e?.message ?? "No se pudo cargar el historial");
        setMensajes([]);
      } finally {
        if (!cancel) setLoading(false);
      }
    };

    void load();

    return () => {
      cancel = true;
    };
  }, [mode, ticket.ID, ]);                                

  // =======================
  // Vista Documentar (solo Documentar + Volver)
  // =======================
  if (mode === "documentar") {
    return (
      <div className={className ?? ""} style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          <button type="button" className="btn btn-xs btn-terciary" onClick={() => setMode("detalle")}>
            <span className="th-back-icon" aria-hidden>←</span> Volver al detalle
          </button>
        </div>

        {!ticket && <p style={{ opacity: 0.7, padding: 16 }}>Cargando ticket…</p>}
        {ticket && (
          <Documentar key={`doc-${tab}-${ticketId}`} ticket={ticket} tipo={tab} onDone={() => {onAddClick()}}/>
        )}
      </div>
    );
  }

  const estado = (ticket?.Estadodesolicitud ?? '').toLowerCase().trim();
  const isClosed = estado.includes('Cerrado');

  // =======================
  // Vista Detalle (historial)
  // =======================
  return (
    <div className={className ?? ""} style={{ padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 22, fontWeight: 700, marginRight: 12 }}>Agregar :</span>

        {/* Tabs SOLO para admins/técnicos */}
        {isPrivileged && !isClosed && (
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => { setTab("seguimiento"); setMode("documentar"); }}  className={`th-tab ${tab === "seguimiento" ? "th-tab--active" : ""}`}>
              Seguimiento
            </button>
            <button type="button" onClick={() => { setTab("solucion"); setMode("documentar");}} className={`th-tab ${tab === "solucion" ? "th-tab--active" : ""}`}>
              Solución
            </button>
          </div>
        )}
      </div>

      {/* Caja principal */}
      <div className="th-box">
        {loading && mensajes.length === 0 && (
          <p style={{ opacity: 0.7, padding: 16 }}>Cargando mensajes…</p>
        )}
        {error && <p style={{ color: "#b91c1c", padding: 16 }}>{error}</p>}
        {!loading && !error && mensajes.length === 0 && (
          <p style={{ opacity: 0.7, padding: 16 }}>No hay mensajes.</p>
        )}

        {mensajes.map((m) => (
          <HistRow key={m.Id} m={m} />
        ))}
      </div>
    </div>
  );
}

/* ---------- Subcomponente: una fila del historial (usa la foto por Graph) ---------- */

function HistRow({ m }: { m: LogConAdjuntos }) {
  return (
    <div className="th-row">
      <div className="th-left th-left--stack">
        <div className="th-avatar">
          <div className="th-avatar-fallback" aria-hidden>👤</div>
        </div>
        <div className="th-nombre">{m.Actor}</div>
        <div className="th-fecha">{formatDateTime(m.Created ?? "")}</div>
      </div>

      <div className="th-right">
        <div className={`th-bubble th-${tipoToClass(m.Tipo_de_accion)}`}>
          <HtmlContent className="th-text" html={m.Descripcion} />

          {m.attachments?.length > 0 && (
            <ul className="th-files" role="list">
              {m.attachments.map((file, i) => {
                const name = file?.name ?? `Archivo ${i + 1}`;
                const href = file?.webUrl ?? "";
                if (!href) return null;

                return (
                  <li key={`${m.Id}-${href}-${i}`} className="th-files__item">
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="th-files__link"
                      title={name}
                    >
                      <span className="th-files__icon" aria-hidden>📎</span>
                      <span className="th-files__text">{name}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- helpers ---------------- */


function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

function tipoToClass(tipo?: string) {
  const t = (tipo ?? "").toLowerCase();
  if (t.includes("solución") || t.includes("solucion")) return "solucion";
  if (t.includes("seguimiento")) return "seguimiento";
  if (t.includes("creacion")) return "creacion";
  if (t.includes("cierre") || t.includes("cerrado")) return "cierre";
  if (t.includes("sistema")) return "sistema";
  return "default";
}
