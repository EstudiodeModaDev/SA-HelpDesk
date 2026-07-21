import React from "react";
import "../NuevoTicket/NuevoTicket.css";
import type { jefeZona } from "../../Models/TiendasZonas";

type Props = {
  rows: jefeZona[];
  loading: boolean;
  error: string | null;
  onDeactivate: (id: string) => Promise<boolean>;
  reload: () => Promise<void>;
  onClose: () => void;
  search: string;
  setSearch: (s: string) => void;
};

export default function JefeZonaTabla({ rows, loading, error, onDeactivate, reload, onClose, search, setSearch }: Props) {
  const handleDeactivate = React.useCallback(
    async (e: React.FormEvent, id: string) => {
      e.preventDefault();
      const confirmation = window.confirm("Esta seguro de desactivar este jefe de zona?");
      if (confirmation) {
        await onDeactivate(id);
        await reload();
      }

      onClose();
    },
    [onDeactivate, reload, onClose]
  );

  const activeRows = rows.filter((row) => row.Activo !== false);

  return (
    <section className="ntk-card">
      <header className="ntk-card__header">
        <div className="ntk-card__header-copy">
          <span className="ntk-card__eyebrow">Listado</span>
          <h2 className="ntk-card__title">Jefes de Zona registrados</h2>
          <p className="ntk-card__subtitle">Aqui se veran los responsables de zona activos en la configuracion.</p>
        </div>
      </header>

      <div className="tz-table-wrap">
        <div className="tz-filters">
          <div className="ntk-field">
            <label className="ntk-label" htmlFor="jefe-zona-search">
              Buscar jefe de zona
            </label>
            <input
              id="jefe-zona-search"
              className="ntk-input"
              type="text"
              placeholder="Escribe el nombre o correo"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading && <p className="tz-table__empty">Cargando registros...</p>}
        {error && <p className="tz-table__error">{error}</p>}
        {!loading && !error && activeRows.length === 0 && <p className="tz-table__empty">Aun no hay jefes de zona registrados.</p>}

        {!loading && !error && activeRows.length > 0 && (
          <table className="tz-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {activeRows.map((row) => (
                <tr key={row.Id ?? `${row.Title}-${row.Correo}`}>
                  <td>{row.Title}</td>
                  <td>{row.Correo}</td>
                  <td>
                    <button
                      type="button"
                      className="tz-action-btn tz-action-btn--danger"
                      onClick={(e) => handleDeactivate(e, row.Id ?? "")}
                    >
                      Desactivar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
