import React from "react";
import type { TiendaZona } from "../../Models/TiendasZonas";
import CatalogTable, { type CatalogColumn } from "../Common/CatalogTable";

type Props = {
  rows: TiendaZona[];
  loading: boolean;
  error: string | null;
  zonas: { value: string; label: string }[];
  onDelete: (id: string) => Promise<boolean>;
  reload: () => Promise<void>;
  onClose: () => void;
  zona: string;
  setZona: (z: string) => void;
};

export default function TiendasZonasTabla({rows, loading, error, zonas, onDelete, reload, onClose, zona, setZona,}: Props) {
  const sortedZonas = React.useMemo(
    () => [...zonas].sort((a, b) => a.value.localeCompare(b.value)),
    [zonas]
  );

  const columns = React.useMemo<CatalogColumn<TiendaZona>[]>(
    () => [
      { key: "title", header: "Nombre", render: (row) => row.Title },
      { key: "zona", header: "Zona", render: (row) => row.Zona },
    ],
    []
  );

  const handleDelete = React.useCallback(
    async (e: React.FormEvent, id: string) => {
      e.preventDefault();
      const confirmation = window.confirm("Esta seguro de eliminar esta tienda?");
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
    <CatalogTable
      eyebrow="Listado"
      title="Tiendas registradas"
      subtitle="Aqui se veran las tiendas y zonas registradas actualmente."
      rows={rows}
      columns={columns}
      loading={loading}
      error={error}
      emptyText="Aun no hay tiendas registradas."
      rowKey={(row, index) => row.Id ?? `${row.Title}-${row.Zona}-${index}`}
      renderActions={(row) => (
        <button
          type="button"
          className="catalog-action-btn catalog-action-btn--danger"
          onClick={(e) => handleDelete(e, row.Id ?? "")}
        >
          Borrar
        </button>
      )}
      filters={
        <div className="catalog-filters">
          <div className="ntk-field">
            <label className="ntk-label" htmlFor="tiendas-zona-filter">
              Filtrar por zona
            </label>
            <select
              id="tiendas-zona-filter"
              className="ntk-input"
              value={zona}
              onChange={(e) => setZona(e.target.value ?? "")}
            >
              {sortedZonas.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      }
    />
  );
}
