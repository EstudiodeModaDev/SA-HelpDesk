import * as React from "react";
import "../NuevoTicket/NuevoTicket.css";
import type { Proveedor, ProveedorErrors } from "../../Models/Proveedores";

type Props = {
  state: Proveedor;
  errors: ProveedorErrors;
  submitting: boolean;
  setField: <K extends keyof Proveedor>(key: K, value: Proveedor[K]) => void;
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
  onClose: () => void;
};

export default function ProveedorForm({ state, errors, submitting, setField, onSubmit, onClose }: Props) {
  return (
    <section className="ntk-card tz-modal-card">
      <header className="ntk-card__header">
        <div className="ntk-card__header-copy">
          <span className="ntk-card__eyebrow">Maestros</span>
          <h2 className="ntk-card__title">Proveedores</h2>
          <p className="ntk-card__subtitle">
            Completa los campos principales para registrar un nuevo proveedor.
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
            <p className="ntk-section__hint">Ingresa el nombre y el correo del proveedor.</p>
          </div>

          <div className="ntk-grid ntk-grid--2">
            <div className={`ntk-field ${errors.Title ? "has-error" : ""}`}>
              <label className="ntk-label" htmlFor="proveedor-nombre">
                Nombre proveedor
              </label>
              <input
                id="proveedor-nombre"
                className="ntk-input"
                type="text"
                value={state.Title}
                onChange={(e) => setField("Title", e.target.value)}
                placeholder="Ej. Proveedor Central"
                disabled={submitting}
              />
              {errors.Title && <small className="ntk-error">{errors.Title}</small>}
            </div>

            <div className={`ntk-field ${errors.correoProveedor ? "has-error" : ""}`}>
              <label className="ntk-label" htmlFor="proveedor-correo">
                Correo proveedor
              </label>
              <input
                id="proveedor-correo"
                className="ntk-input"
                type="text"
                value={state.correoProveedor}
                onChange={(e) => setField("correoProveedor", e.target.value)}
                placeholder="Ej. proveedor@empresa.com"
                disabled={submitting}
              />
              {errors.correoProveedor && <small className="ntk-error">{errors.correoProveedor}</small>}
            </div>
          </div>
        </section>

        <footer className="ntk-actions">
          <div className="ntk-actions__meta">
            <span className="ntk-actions__text">
              {state.Title.trim() && state.correoProveedor.trim()
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
