import React from "react";
import "../DashboardGeneral/DashboardResumen.css";
import { useGraphServices } from "../../../graph/GrapServicesContext";
import { useDashboardDetallado } from "../../../Funcionalidades/Dashboard/hooks/useDashboardDetallado";
import { Donut } from "../MicroComponents/Donut";
import { StatusBars } from "../MicroComponents/StatusBars";
import { Gauge } from "../MicroComponents/Gauge";
import { TotalBarras } from "../MicroComponents/TotalBarras";
import { SmallDonut } from "../MicroComponents/smallDonut";
import { CasosPorDiaChart } from "../MicroComponents/CasosPorDia";

export default function DashboardDetallado() {
  const { Tickets } = useGraphServices();
  const { load, totalCasos, totalEnCurso, totalFinalizados, totalFueraTiempo, porcentajeCumplimiento, topCategorias, range, resolutores, loading, conteoPorMes, topSolicitante, setRange } = useDashboardDetallado(Tickets);

  React.useEffect(() => {
    load();
  }, [range.from, range.to]);

  if (loading) {
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
            <span className="dash-top__eyebrow">Analítica detallada</span>
            <h2 className="dash-top__title">Vista ampliada del comportamiento</h2>
            <p className="dash-top__subtitle">
              Profundiza en el rendimiento del equipo, categorías críticas y evolución temporal del servicio.
            </p>
          </div>

          <header className="center-head">
            <div className="dash-filters">
              <input className="date" type="date" onChange={(e) => setRange({ ...range, from: e.target.value })} value={range.from} />
              <input className="date" type="date" onChange={(e) => setRange({ ...range, to: e.target.value })} value={range.to} />
            </div>
          </header>
        </div>

        <section className="dash-kpis">
          <article className="dash-kpi dash-kpi--accent">
            <span className="dash-kpi__label">Casos totales</span>
            <strong className="dash-kpi__value">{totalCasos}</strong>
            <span className="dash-kpi__meta">Base analítica del periodo</span>
          </article>
          <article className="dash-kpi">
            <span className="dash-kpi__label">Finalizados</span>
            <strong className="dash-kpi__value">{totalFinalizados}</strong>
            <span className="dash-kpi__meta">Tickets que llegaron a cierre</span>
          </article>
          <article className="dash-kpi">
            <span className="dash-kpi__label">Fuera de tiempo</span>
            <strong className="dash-kpi__value">{totalFueraTiempo}</strong>
            <span className="dash-kpi__meta">Casos con desviación frente al SLA</span>
          </article>
          <article className="dash-kpi">
            <span className="dash-kpi__label">En curso</span>
            <strong className="dash-kpi__value">{totalEnCurso}</strong>
            <span className="dash-kpi__meta">Casos que siguen en atención</span>
          </article>
        </section>

        <div className="dash-grid">
          <div className="dash-main">
            <section className="dash-block">
              <div className="dash-block__head">
                <div>
                  <h3 className="dash-block__title">Rendimiento general</h3>
                  <p className="dash-block__hint">Totales, estados y cumplimiento consolidado.</p>
                </div>
              </div>

              <div className="dash-hero">
                <div className="kpi-total">
                  <Donut value={1} size={180} stroke={10} ring="#22c55e" />
                  <div className="kpi-total__text">
                    <div className="big">{totalCasos}</div>
                    <div className="sub">Casos en total</div>
                  </div>
                </div>

                <div className="dash-stack">
                  <StatusBars total={totalCasos} at={totalFinalizados} late={totalFueraTiempo} inprog={totalEnCurso} />

                  <div className="panel">
                    <h4>Porcentaje de cumplimiento</h4>
                    <div className="gauge">
                      <Gauge value={porcentajeCumplimiento} />
                      <div className="gauge__labels">
                        <span>0,00%</span>
                        <span>100,00%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="dash-block resolutores">
              <div className="dash-block__head">
                <div>
                  <h3 className="dash-block__title">Resolutores</h3>
                  <p className="dash-block__hint">Carga visible por persona y lectura rápida de desempeño.</p>
                </div>
              </div>
              <ul className="res-list">
                {resolutores.map((r) => (
                  <li key={r.nombre} className="res-item">
                    <div className="res-left">
                      <SmallDonut value={r.porcentaje} />
                      <div className="res-meta">
                        <div className="res-name">{r.nombre}</div>
                        <div className="res-sub">{r.porcentaje}%</div>
                      </div>
                    </div>
                    <div className="res-right">
                      <div className="res-total">{r.total}</div>
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
                  <h3 className="dash-block__title">Casos mensuales</h3>
                  <p className="dash-block__hint">Evolución agregada del volumen a lo largo del tiempo.</p>
                </div>
              </div>
              <section className="panel">
                <CasosPorDiaChart data={conteoPorMes} height={200} maxBars={5} />
              </section>
            </section>

            <section className="dash-block">
              <div className="dash-block__head">
                <div>
                  <h3 className="dash-block__title">Top categorías</h3>
                  <p className="dash-block__hint">Categorías con mayor participación en el periodo.</p>
                </div>
              </div>
              <div className="panel">
                <h4>Top 5 categorías</h4>
                <TotalBarras data={topCategorias} total={totalCasos} />
              </div>
            </section>

            <section className="dash-block">
              <div className="dash-block__head">
                <div>
                  <h3 className="dash-block__title">Top solicitantes</h3>
                  <p className="dash-block__hint">Usuarios que generan más tickets en el rango consultado.</p>
                </div>
              </div>
              <div className="panel">
                <h4>Top 5 solicitantes</h4>
                <TotalBarras data={topSolicitante} total={totalCasos} />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}
