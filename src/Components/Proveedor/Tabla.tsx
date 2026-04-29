import "../NuevoTicket/NuevoTicket.css";
import React from "react";
import type { Proveedor } from "../../Models/Proveedores";

type Props = {
  rows: Proveedor[];
  loading: boolean;
  error: string | null;
  onDelete: (id: string) => Promise<boolean>;
  reload: () => Promise<void>;
  onClose: () => void;
  search: string
  setSearch: (s: string) => void
};

export default function ProveedorTabla({ rows, loading, error, onDelete, reload, onClose, search, setSearch }: Props) {
  const handleDelete = React.useCallback(
    async (e: React.FormEvent, id: string) => {
      e.preventDefault();
      const confirmation = window.confirm("Esta seguro de eliminar este proveedor?");
      if (confirmation) {
        await onDelete(id);
        alert("Se ha eliminado correctamente");
        await reload();
      }

      onClose();
    },
    [onDelete, reload, onClose]
  );

  return (
    <section className="ntk-card">
      <header className="ntk-card__header">
        <div className="ntk-card__header-copy">
          <span className="ntk-card__eyebrow">Listado</span>
          <h2 className="ntk-card__title">Proveedores registrados</h2>
          <p className="ntk-card__subtitle">Aqui se veran los proveedores registrados actualmente.</p>
        </div>
      </header>

      <div className="tz-table-wrap">
        <div className="tz-filters">
          <div className="ntk-field">
            <label className="ntk-label" htmlFor="proveedor-search">
              Buscar proveedor
            </label>
            <input 
              id="proveedor-search" 
              className="ntk-input" 
              type="text" 
              placeholder="Escribe el nombre o correo del proveedor" 
              value={search}
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
        </div>

        {loading && <p className="tz-table__empty">Cargando registros...</p>}
        {error && <p className="tz-table__error">{error}</p>}
        {!loading && !error && rows.length === 0 && <p className="tz-table__empty">Aun no hay proveedores registrados.</p>}

        {!loading && !error && rows.length > 0 && (
          <table className="tz-table">
            <thead>
              <tr>
                <th>Nombre Proveedor</th>
                <th>Correo Proveedor</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.Id ?? `${row.Title}-${row.correoProveedor}`}>
                  <td>{row.Title}</td>
                  <td>{row.correoProveedor}</td>
                  <td>
                    <button
                      type="button"
                      className="tz-action-btn tz-action-btn--danger"
                      onClick={(e) => handleDelete(e, row.Id ?? "")}
                    >
                      Borrar
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
