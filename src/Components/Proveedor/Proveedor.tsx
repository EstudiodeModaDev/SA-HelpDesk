import * as React from "react";
import "./TiendasZonas.css";
import Form from "./Form";
import Tabla from "./Tabla";
import { useProveedores } from "../../Funcionalidades/Proveedores/hooks/useProveedores";

export default function Proveedor() {
  const {searc, setSearch, tiendaZona, loading, error, state, errors, submitting, setField, addTiendaZona, deleteTiendaZona, loadProveedores } = useProveedores();
  const [showForm, setShowForm] = React.useState(false);

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await addTiendaZona();
    },
    [addTiendaZona]
  );

  return (
    <section className="tz-page">
      <div className="tz-helper">
        <span className="tz-helper__label">Configuracion</span>
        <p className="tz-helper__text">
          Administra manualmente el catalogo de tiendas y las zonas a las que pertenecen.
        </p>
        <div className="tz-helper__actions">
          <button type="button" className="ntk-btn ntk-btn--primary" onClick={() => setShowForm(true)}>
            Nuevo Proveedor
          </button>
        </div>
      </div>

      <Tabla 
        rows={tiendaZona}
        loading={loading}
        error={error}
        onDelete={deleteTiendaZona}
        reload={loadProveedores}
        onClose={() => setShowForm(false)} 
        search={searc} 
        setSearch={setSearch}        />

      {showForm && (
        <div className="tz-modal" role="dialog" aria-modal="true" aria-label="Formulario de tiendas y zonas">
          <div className="tz-modal__backdrop" onClick={() => setShowForm(false)} />
          <div className="tz-modal__content">
            <Form
              state={state}
              errors={errors}
              submitting={submitting}
              setField={setField}
              onSubmit={handleSubmit}
              onClose={() => setShowForm(false)}            />
          </div>
        </div>
      )}
    </section>
  );
}
