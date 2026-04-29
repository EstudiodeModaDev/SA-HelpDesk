import React from "react";
import { useGraphServices } from "../../../graph/GrapServicesContext";
import "./DashboardResumen.css";
import { Donut } from "../MicroComponents/Donut";
import { StatusBars } from "../MicroComponents/StatusBars";
import { Gauge } from "../MicroComponents/Gauge";
import { TotalBarras } from "../MicroComponents/TotalBarras";
import { CategoriasChart } from "../MicroComponents/Barras";
import { SmallDonut } from "../MicroComponents/smallDonut";
import { CasosPorDiaChart } from "../MicroComponents/CasosPorDia";
import { useDashboard } from "../../../Funcionalidades/Dashboard/hooks/useDashboard";

export default function DashboardResumen() {
  const { Tickets } = useGraphServices();
  const dashboardController = useDashboard(Tickets);

  React.useEffect(() => {
    dashboardController.load();
  }, [dashboardController.range.from, dashboardController.range.to]);

  if (dashboardController.loading) {
    return (
      <section className="dash">
        <div className="dash-loading" role="status" aria-live="polite">Cargando...</div>
      </section>
    );
  }

  return (
    <section className="dash">
      <div className="dash-shell">
        <div className="dash-top">
          <div className="dash-top__copy">
            <span className="dash-top__eyebrow">Resumen operacional</span>
            <h2 className="dash-top__title">Lectura general del servicio</h2>
            <p className="dash-top__subtitle">
              Vista consolidada del volumen, cumplimiento y comportamiento del equipo resolutor en el periodo consultado.
            </p>
          </div>

          <header className="center-head">
            <div className="dash-filters">
              <input className="date" type="date" value={dashboardController.range.from} onBlur={(e) => dashboardController.setRange({ ...dashboardController.range, from: e.target.value })} />
              <input className="date" type="date" value={dashboardController.range.to} onBlur={(e) => dashboardController.setRange({ ...dashboardController.range, to: e.target.value })} />
            </div>
          </header>
        </div>

        <section className="dash-kpis">
          <article className="dash-kpi dash-kpi--accent">
            <span className="dash-kpi__label">Casos totales</span>
            <strong className="dash-kpi__value">{dashboardController.totalCasos}</strong>
            <span className="dash-kpi__meta">Base general del periodo seleccionado</span>
          </article>
          <article className="dash-kpi">
            <span className="dash-kpi__label">Finalizados</span>
            <strong className="dash-kpi__value">{dashboardController.totalFinalizados}</strong>
            <span className="dash-kpi__meta">Casos cerrados dentro del seguimiento</span>
          </article>
          <article className="dash-kpi">
            <span className="dash-kpi__label">Fuera de tiempo</span>
            <strong className="dash-kpi__value">{dashboardController.totalFueraTiempo}</strong>
            <span className="dash-kpi__meta">Incumplimientos visibles en el periodo</span>
          </article>
          <article className="dash-kpi">
            <span className="dash-kpi__label">En curso</span>
            <strong className="dash-kpi__value">{dashboardController.totalEnCurso}</strong>
            <span className="dash-kpi__meta">Casos abiertos o en atención activa</span>
          </article>
        </section>

        <div className="dash-grid">
          <div className="dash-main">
            <section className="dash-block">
              <div className="dash-block__head">
                <div>
                  <h3 className="dash-block__title">Panorama del servicio</h3>
                  <p className="dash-block__hint">Volumen total, estados y cumplimiento general.</p>
                </div>
              </div>

              <div className="dash-hero">
                <div className="kpi-total">
                  <Donut value={1} size={180} stroke={10} ring="#22c55e" />
                  <div className="kpi-total__text">
                    <div className="big">{dashboardController.totalCasos}</div>
                    <div className="sub">Casos en total</div>
                  </div>
                </div>

                <div className="dash-stack">
                  <StatusBars total={dashboardController.totalCasos} at={dashboardController.totalFinalizados} late={dashboardController.totalFueraTiempo} inprog={dashboardController.totalEnCurso} />

                  <div className="panel">
                    <h4>Porcentaje de cumplimiento</h4>
                    <div className="gauge">
                      <Gauge value={dashboardController.porcentajeCumplimiento} />
                      <div className="gauge__labels">
                        <span>0,00%</span>
                        <span>100,00%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="dash-block">
              <div className="dash-block__head">
                <div>
                  <h3 className="dash-block__title">Categorías con mayor demanda</h3>
                  <p className="dash-block__hint">Top 5 de categorías con más volumen de casos.</p>
                </div>
              </div>
              <h4 className="cats__title">Top 5 Categorias</h4>
              <CategoriasChart data={dashboardController.totalCategorias} maxBars={5} />
            </section>

            <section className="dash-block resolutores">
              <div className="dash-block__head">
                <div>
                  <h3 className="dash-block__title">Resolutores</h3>
                  <p className="dash-block__hint">Distribución del equipo resolutor y su carga visible.</p>
                </div>
              </div>
              <ul className="res-list">
                {dashboardController.resolutores.map((r) => (
                  <li key={r.nombre} className="res-item">
                    <div className="res-left">
                      <SmallDonut value={dashboardController.porcentajeCumplimiento} />
                      <div className="res-meta">
                        <div className="res-name">{r.nombre}</div>
                        <div className="res-sub">0.00%</div>
                      </div>
                    </div>
                    <div className="res-right">
                      <div className="res-total">{dashboardController.totalCasos}</div>
                      <div className="res-caption">Total Casos</div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="dash-side">
            <section className="dash-block">
              <div className="dash-block__head">
                <div>
                  <h3 className="dash-block__title">Casos diarios</h3>
                  <p className="dash-block__hint">Comportamiento diario del servicio en el rango actual.</p>
                </div>
              </div>
              <section className="panel">
                <CasosPorDiaChart data={dashboardController.casosPorDia} height={200} maxBars={5} />
              </section>
            </section>

            <section className="dash-block">
              <div className="dash-block__head">
                <div>
                  <h3 className="dash-block__title">Solicitantes recurrentes</h3>
                  <p className="dash-block__hint">Usuarios con mayor volumen de tickets registrados.</p>
                </div>
              </div>
              <div className="panel">
                <h4>Top 5 solicitante</h4>
                <TotalBarras data={dashboardController.topSolicitante} total={dashboardController.totalCasos} />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}
