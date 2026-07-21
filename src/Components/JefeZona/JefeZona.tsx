import * as React from "react";
import "../Proveedor/TiendasZonas.css";
import Form from "./Form";
import Tabla from "./Tabla";
import { useJefeZona } from "../../Funcionalidades/jefeZona/hooks/useJefeZona";

export default function JefeZona() {
  const {
    search,
    setSearch,
    jefesZona,
    loading,
    error,
    state,
    errors,
    submitting,
    setField,
    addJefeZona,
    inactivateJefeZona,
    loadJefesZonas,
  } = useJefeZona();
  const [showForm, setShowForm] = React.useState(false);

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const created = await addJefeZona();
      if (created) {
        setShowForm(false);
      }
    },
    [addJefeZona]
  );

  return (
    <section className="tz-page">
      <div className="tz-helper">
        <span className="tz-helper__label">Configuracion</span>
        <p className="tz-helper__text">
          Administra los jefes de zona disponibles para los flujos operativos del sistema.
        </p>
        <div className="tz-helper__actions">
          <button type="button" className="ntk-btn ntk-btn--primary" onClick={() => setShowForm(true)}>
            Nuevo jefe de zona
          </button>
        </div>
      </div>

      <Tabla
        rows={jefesZona}
        loading={loading}
        error={error}
        onDeactivate={inactivateJefeZona}
        reload={loadJefesZonas}
        onClose={() => setShowForm(false)}
        search={search}
        setSearch={setSearch}
      />

      {showForm && (
        <div className="tz-modal" role="dialog" aria-modal="true" aria-label="Formulario de jefes de zona">
          <div className="tz-modal__backdrop" onClick={() => setShowForm(false)} />
          <div className="tz-modal__content">
            <Form
              state={state}
              errors={errors}
              submitting={submitting}
              setField={setField}
              onSubmit={handleSubmit}
              onClose={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </section>
  );
}
