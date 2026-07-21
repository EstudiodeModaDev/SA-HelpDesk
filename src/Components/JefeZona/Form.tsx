import * as React from "react";
import "../NuevoTicket/NuevoTicket.css";
import type { jefeZona, JefeZonaErrors } from "../../Models/TiendasZonas";

type Props = {
  state: jefeZona;
  errors: JefeZonaErrors;
  submitting: boolean;
  setField: <K extends keyof jefeZona>(key: K, value: jefeZona[K]) => void;
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
  onClose: () => void;
};

export default function JefeZonaForm({ state, errors, submitting, setField, onSubmit, onClose }: Props) {
  return (
    <section className="ntk-card tz-modal-card">
      <header className="ntk-card__header">
        <div className="ntk-card__header-copy">
          <span className="ntk-card__eyebrow">Maestros</span>
          <h2 className="ntk-card__title">Jefes de Zona</h2>
          <p className="ntk-card__subtitle">
            Registra el nombre y el correo del jefe de zona que quedara disponible en el sistema.
          </p>
        </div>

        <div className="ntk-card__status">
          <button type="button" className="tz-modal-close" onClick={onClose} aria-label="Cerrar formulario">
            ×
          </button>
        </div>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void onSubmit(e);
        }}
        noValidate
        className="ntk-form"
      >
        <section className="ntk-section">
          <div className="ntk-section__head">
            <h3 className="ntk-section__title">Datos base</h3>
            <p className="ntk-section__hint">Completa la informacion principal del responsable de zona.</p>
          </div>

          <div className="ntk-grid ntk-grid--2">
            <div className={`ntk-field ${errors.Title ? "has-error" : ""}`}>
              <label className="ntk-label" htmlFor="jefe-zona-nombre">
                Nombre
              </label>
              <input
                id="jefe-zona-nombre"
                className="ntk-input"
                type="text"
                value={state.Title}
                onChange={(e) => setField("Title", e.target.value)}
                placeholder="Ej. Laura Martinez"
                disabled={submitting}
              />
              {errors.Title && <small className="ntk-error">{errors.Title}</small>}
            </div>

            <div className={`ntk-field ${errors.Correo ? "has-error" : ""}`}>
              <label className="ntk-label" htmlFor="jefe-zona-correo">
                Correo
              </label>
              <input
                id="jefe-zona-correo"
                className="ntk-input"
                type="email"
                value={state.Correo}
                onChange={(e) => setField("Correo", e.target.value)}
                placeholder="Ej. jefe.zona@empresa.com"
                disabled={submitting}
              />
              {errors.Correo && <small className="ntk-error">{errors.Correo}</small>}
            </div>
          </div>
        </section>

        <footer className="ntk-actions">
          <div className="ntk-actions__meta">
            <span className="ntk-actions__text">
              {state.Title.trim() && state.Correo.trim()
                ? "Campos listos para guardar"
                : "Completa nombre y correo para continuar"}
            </span>
          </div>

          <div className="ntk-actions__buttons">
            <button type="button" className="ntk-btn tz-btn-secondary" onClick={onClose} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" className="ntk-btn ntk-btn--primary" disabled={submitting}>
              {submitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </footer>
      </form>
    </section>
  );
}
