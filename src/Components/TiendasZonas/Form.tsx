import * as React from "react";
import Select, { type SingleValue } from "react-select";
import CatalogModalForm from "../Common/CatalogModalForm";
import type { TiendaZona, TiendaZonaErrors } from "../../Models/TiendasZonas";
import type { UserOption } from "../../Models/Commons";

type Props = {
  state: TiendaZona;
  errors: TiendaZonaErrors;
  submitting: boolean;
  setField: <K extends keyof TiendaZona>(key: K, value: TiendaZona[K]) => void;
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
  onClose: () => void;
  zonas: { value: string; label: string }[];
  jefesZonaOptions: UserOption[];
};

export default function TiendasZonasForm({ state, errors, submitting, setField, onSubmit, onClose, zonas, jefesZonaOptions }: Props) {
  const sortedZonas = React.useMemo(
    () => [...zonas].sort((a, b) => a.value.localeCompare(b.value)),
    [zonas]
  );
  const selectedJefeZona = React.useMemo(
    () =>
      jefesZonaOptions.find(
        (option) =>
          option.value === state.JefeZonaId ||
          option.label === state.JefeZona ||
          option.label === state.JefeZonaId
      ) ?? null,
    [jefesZonaOptions, state.JefeZonaId, state.JefeZona]
  );

  return (
    <CatalogModalForm
      eyebrow="Maestros"
      title="Tiendas y Zonas"
      subtitle="Completa la tienda, la zona y el jefe de zona para registrar la relacion operativa."
      sectionTitle="Datos base"
      sectionHint="Ingresa el nombre de la tienda y relaciona su zona y responsable."
      submitting={submitting}
      submitLabel="Guardar"
      submittingLabel="Guardando..."
      helperText={
        state.Title.trim() && state.Zona.trim() && (state.JefeZonaId?.trim() || state.JefeZona?.trim())
          ? "Campos listos para guardar"
          : "Completa nombre, zona y jefe de zona para continuar"
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

        <div className={`ntk-field ${errors.JefeZonaId ? "has-error" : ""}`}>
          <label className="ntk-label" htmlFor="tienda-jefe-zona">
            Jefe de zona
          </label>
          <Select<UserOption, false>
            inputId="tienda-jefe-zona"
            classNamePrefix="rs"
            options={jefesZonaOptions}
            value={selectedJefeZona}
            onChange={(option: SingleValue<UserOption>) => {
              setField("JefeZonaId", option?.value ?? "");
              setField("JefeZona", option?.label ?? "");
            }}
            placeholder="Selecciona un jefe de zona"
            noOptionsMessage={() => "No hay jefes de zona disponibles"}
            isClearable
            isDisabled={submitting}
            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            }}
          />
          {errors.JefeZonaId && <small className="ntk-error">{errors.JefeZonaId}</small>}
        </div>
      </div>
    </CatalogModalForm>
  );
}
