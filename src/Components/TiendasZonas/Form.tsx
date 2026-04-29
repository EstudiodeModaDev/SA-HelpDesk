import * as React from "react";
import CatalogModalForm from "../Common/CatalogModalForm";
import type { TiendaZona, TiendaZonaErrors } from "../../Models/TiendasZonas";

type Props = {
  state: TiendaZona;
  errors: TiendaZonaErrors;
  submitting: boolean;
  setField: <K extends keyof TiendaZona>(key: K, value: TiendaZona[K]) => void;
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
  onClose: () => void;
  zonas: { value: string; label: string }[];
};

export default function TiendasZonasForm({ state, errors, submitting, setField, onSubmit, onClose, zonas }: Props) {
  const sortedZonas = React.useMemo(
    () => [...zonas].sort((a, b) => a.value.localeCompare(b.value)),
    [zonas]
  );

  return (
    <CatalogModalForm
      eyebrow="Maestros"
      title="Tiendas y Zonas"
      subtitle="Completa ambos campos por escritura para registrar una nueva relacion entre tienda y zona."
      sectionTitle="Datos base"
      sectionHint="Ingresa el nombre de la tienda y la zona usando texto libre."
      submitting={submitting}
      submitLabel="Guardar"
      submittingLabel="Guardando..."
      helperText={
        state.Title.trim() && state.Zona.trim()
          ? "Campos listos para guardar"
          : "Completa nombre y zona para continuar"
      }
      onSubmit={onSubmit}
      onClose={onClose}
    >
      <div className="ntk-grid ntk-grid--2">
        <div className={`ntk-field ${errors.Title ? "has-error" : ""}`}>
          <label className="ntk-label" htmlFor="tienda-nombre">
            Nombre
          </label>
          <input
            id="tienda-nombre"
            className="ntk-input"
            type="text"
            value={state.Title}
            onChange={(e) => setField("Title", e.target.value)}
            onBlur={() => setField("Title", state.Title.trim())}
            placeholder="Ej. Tienda Centro"
            disabled={submitting}
          />
          {errors.Title && <small className="ntk-error">{errors.Title}</small>}
        </div>

        <div className={`ntk-field ${errors.Zona ? "has-error" : ""}`}>
          <label className="ntk-label" htmlFor="tienda-zona">
            Zona
          </label>
          <select
            id="tienda-zona"
            className="ntk-input"
            value={state.Zona}
            onChange={(e) => setField("Zona", e.target.value)}
            disabled={submitting}
          >
            {sortedZonas.map((zona) => (
              <option key={zona.value} value={zona.value}>
                {zona.label}
              </option>
            ))}
          </select>
          {errors.Zona && <small className="ntk-error">{errors.Zona}</small>}
        </div>
      </div>
    </CatalogModalForm>
  );
}
