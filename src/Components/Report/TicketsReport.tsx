import React from "react";
import "./TicketsReport.css";
import { useTickets } from "../../Funcionalidades/Tickets/hooks/Queries/useTickets";
import { calculateComplianceMetrics } from "../../Funcionalidades/Report/utils/reportMetric";
import { exportComplianceReportToExcel } from "../../Funcionalidades/Report/utils/reportExcel";
import type { Ticket } from "../../Models/Tickets";
import type { DateRange } from "../../Models/Commons";

type Props = {
  title?: string;
};

function pctColorClass(value: number) {
  if (value >= 90) return "is-good";
  if (value >= 75) return "is-warn";
  return "is-bad";
}

export default function TicketsComplianceReport({
  title = "Reporte de cumplimiento",
}: Props) {
  const tickets = useTickets();
  const [rows, setRows] = React.useState<Ticket[]>([]);
  const [range, setRange] = React.useState<DateRange>({ from: "", to: "" });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const founded = await tickets.loadToReport(range.from, range.to);

        if (!active) return;
        setRows(founded ?? []);
      } catch (e: any) {
        if (!active) return;
        setError(e?.message ?? "Error cargando reporte");
        setRows([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [range.from, range.to]);

  const metrics = React.useMemo(() => calculateComplianceMetrics(rows), [rows]);

  const topTecnicos = React.useMemo(
    () => metrics.byTecnico.slice(0, 5),
    [metrics.byTecnico]
  );

  const topCategorias = React.useMemo(
    () => metrics.byCategoria.slice(0, 5),
    [metrics.byCategoria]
  );

  return (
    <section className="compliance-report">
      <div className="cr-header">
        <div>
          <p className="cr-eyebrow">ANALÍTICA OPERATIVA</p>
          <h2 className="cr-title">{title}</h2>
          <p className="cr-subtitle">
            Cumplimiento calculado sobre tickets cerrados a tiempo.
          </p>
        </div>

        <button
          type="button"
          className="cr-export-btn"
          onClick={() =>
            exportComplianceReportToExcel(rows, {
              fileName: "ReporteCumplimientoTickets.xlsx",
            })
          }
          disabled={loading}
        >
          Exportar a Excel
        </button>
      </div>

      <div className="cr-filter-bar">
        <div className="cr-filter-field">
          <label>Desde</label>
          <input
            type="date"
            value={range.from}
            onChange={(e) =>
              setRange((prev) => ({ ...prev, from: e.target.value }))
            }
          />
        </div>

        <div className="cr-filter-field">
          <label>Hasta</label>
          <input
            type="date"
            value={range.to}
            onChange={(e) =>
              setRange((prev) => ({ ...prev, to: e.target.value }))
            }
          />
        </div>

        <div className="cr-filter-actions">
          <button
            type="button"
            className="cr-btn-secondary"
            onClick={() => setRange({ from: "", to: "" })}
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="cr-filter-summary">
        <span>
          <strong>Rango aplicado:</strong>{" "}
          {range.from || range.to
            ? `${range.from || "Inicio"} → ${range.to || "Hoy"}`
            : "Sin filtro"}
        </span>

        <span>
          <strong>Tickets evaluados:</strong> {rows.length}
        </span>

        {loading && (
          <span>
            <strong>Estado:</strong> Cargando...
          </span>
        )}

        {error && (
          <span>
            <strong>Error:</strong> {error}
          </span>
        )}
      </div>

      <div className="cr-hero">
        <div className="cr-gauge-card">
          <div className="cr-gauge-wrap">
            <div
              className={`cr-gauge ${pctColorClass(metrics.compliancePct)}`}
              style={
                {
                  "--pct": `${Math.min(metrics.compliancePct, 100)}%`,
                } as React.CSSProperties
              }
            >
              <div className="cr-gauge-inner">
                <span className="cr-gauge-value">{metrics.compliancePct}%</span>
                <span className="cr-gauge-label">Cumplimiento</span>
              </div>
            </div>
          </div>

          <div className="cr-hero-stats">
            <div className="cr-mini-stat">
              <span>Total tickets</span>
              <strong>{metrics.total}</strong>
            </div>

            <div className="cr-mini-stat">
              <span>Cerrados</span>
              <strong>{metrics.closed}</strong>
            </div>

            <div className="cr-mini-stat">
              <span>Abiertos</span>
              <strong>{metrics.open}</strong>
            </div>
          </div>
        </div>

        <div className="cr-grid-kpis">
          <article className="cr-kpi">
            <div className="cr-kpi-top">
              <span className="cr-kpi-label">Cerrados a tiempo</span>
            </div>
            <div className="cr-kpi-center">
              <strong className="cr-kpi-value">{metrics.closedOnTime}</strong>
            </div>
            <div className="cr-kpi-bottom">
              <small className="cr-kpi-foot">
                Base del porcentaje de cumplimiento
              </small>
            </div>
          </article>

          <article className="cr-kpi">
            <div className="cr-kpi-top">
              <span className="cr-kpi-label">Cerrados fuera de tiempo</span>
            </div>
            <div className="cr-kpi-center">
              <strong className="cr-kpi-value">{metrics.closedLate}</strong>
            </div>
            <div className="cr-kpi-bottom">
              <small className="cr-kpi-foot">
                Última actualización mayor que tiempo de solución
              </small>
            </div>
          </article>

          <article className="cr-kpi">
            <div className="cr-kpi-top">
              <span className="cr-kpi-label">Abiertos vencidos</span>
            </div>
            <div className="cr-kpi-center">
              <strong className="cr-kpi-value">{metrics.openOverdue}</strong>
            </div>
            <div className="cr-kpi-bottom">
              <small className="cr-kpi-foot">
                Siguen abiertos y ya superaron la fecha límite
              </small>
            </div>
          </article>

          <article className="cr-kpi">
            <div className="cr-kpi-top">
              <span className="cr-kpi-label">Abiertos dentro del tiempo</span>
            </div>
            <div className="cr-kpi-center">
              <strong className="cr-kpi-value">{metrics.openWithinTime}</strong>
            </div>
            <div className="cr-kpi-bottom">
              <small className="cr-kpi-foot">Aún no incumplen SLA</small>
            </div>
          </article>
        </div>
      </div>

      <div className="cr-panels">
        <article className="cr-panel">
          <div className="cr-panel-head">
            <h3>Rendimiento por técnico</h3>
            <span>{metrics.byTecnico.length} registros</span>
          </div>

          <div className="cr-table-wrap">
            <table className="cr-table">
              <thead>
                <tr>
                  <th>Técnico</th>
                  <th>Total</th>
                  <th>Cerrados</th>
                  <th>A tiempo</th>
                  <th>Fuera de tiempo</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {topTecnicos.map((item) => (
                  <tr key={item.tecnico}>
                    <td>{item.tecnico}</td>
                    <td>{item.total}</td>
                    <td>{item.closed}</td>
                    <td>{item.onTime}</td>
                    <td>{item.late}</td>
                    <td>
                      <span
                        className={`cr-badge ${pctColorClass(
                          item.compliancePct
                        )}`}
                      >
                        {item.compliancePct}%
                      </span>
                    </td>
                  </tr>
                ))}

                {topTecnicos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="cr-empty">
                      No hay datos para mostrar
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="cr-panel">
          <div className="cr-panel-head">
            <h3>Categorías con más volumen</h3>
            <span>{metrics.byCategoria.length} registros</span>
          </div>

          <div className="cr-bars">
            {topCategorias.map((item) => (
              <div className="cr-bar-row" key={item.categoria}>
                <div className="cr-bar-meta">
                  <span className="cr-bar-title">{item.categoria}</span>
                  <strong>{item.compliancePct}%</strong>
                </div>

                <div className="cr-bar-track">
                  <div
                    className={`cr-bar-fill ${pctColorClass(
                      item.compliancePct
                    )}`}
                    style={{ width: `${Math.min(item.compliancePct, 100)}%` }}
                  />
                </div>

                <small className="cr-bar-foot">
                  {item.onTime} a tiempo · {item.late} fuera de tiempo ·{" "}
                  {item.total} total
                </small>
              </div>
            ))}

            {topCategorias.length === 0 && (
              <div className="cr-empty">No hay categorías para mostrar</div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}