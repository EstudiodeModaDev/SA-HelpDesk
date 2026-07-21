import * as React from "react";
import "./TiendasZonas.css";
import Form from "./Form";
import Tabla from "./Tabla";
import "../Common/CatalogUI.css";
import { useTiendasZonas } from "../../Funcionalidades/TiendasZonas/hooks/useTiendasZonas";
import { useJefeZonaList } from "../../Funcionalidades/jefeZona/hooks/useJefeZonaList";
import { zonas } from "../../consts/zonasConst";

export default function TiendasZonas() {
  const {zona, setZona, tiendaZona, loading, error, state, errors, submitting, setField, addTiendaZona, deleteTiendaZona, loadTiendasZonas } = useTiendasZonas();
  const { jefeZonaOptions, jefesZona } = useJefeZonaList();
  const [showForm, setShowForm] = React.useState(false);
  const activeJefeZonaIds = React.useMemo(() => {
    return new Set(
      jefesZona
        .filter((item) => item.Activo !== false)
        .map((item) => String(item.Id ?? ""))
        .filter(Boolean)
    );
  }, [jefesZona]);

  const activeJefeZonaOptions = React.useMemo(() => {
    return jefeZonaOptions.filter((option) => activeJefeZonaIds.has(String(option.value)));
  }, [activeJefeZonaIds, jefeZonaOptions]);

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const created = await addTiendaZona();
      if (created) {
        setShowForm(false);
      }
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
            Nueva tienda
          </button>
        </div>
      </div>

      <Tabla 
        rows={tiendaZona} 
        zonas={zonas} 
        jefesZonaOptions={jefeZonaOptions}
        loading={loading} 
        error={error} 
        onDelete={deleteTiendaZona} 
        reload={loadTiendasZonas} 
        onClose={() => setShowForm(false)} 
        zona={zona} 
        setZona={setZona} />

      {showForm && (
        <div className="catalog-modal" role="dialog" aria-modal="true" aria-label="Formulario de tiendas y zonas">
          <div className="catalog-modal__backdrop" onClick={() => setShowForm(false)} />
          <div className="catalog-modal__content">
            <Form
              state={state}
              errors={errors}
              submitting={submitting}
              setField={setField}
              onSubmit={handleSubmit}
              onClose={() => setShowForm(false)}
              zonas={zonas}
              jefesZonaOptions={activeJefeZonaOptions}
            />
          </div>
        </div>
      )}
    </section>
  );
}
