import * as React from "react";
import "../NuevoTicket/NuevoTicket.css";
import "./CatalogUI.css";

export type CatalogColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
};

type Props<T> = {
  eyebrow: string;
  title: string;
  subtitle: string;
  rows: T[];
  columns: CatalogColumn<T>[];
  loading: boolean;
  error: string | null;
  emptyText: string;
  filters?: React.ReactNode;
  actionsHeader?: string;
  renderActions?: (row: T) => React.ReactNode;
  rowKey: (row: T, index: number) => string;
};

export default function CatalogTable<T>(props: Props<T>) {
  const {
    eyebrow,
    title,
    subtitle,
    rows,
    columns,
    loading,
    error,
    emptyText,
    filters,
    actionsHeader = "Acciones",
    renderActions,
    rowKey,
  } = props;

  return (
    <section className="ntk-card">
      <header className="ntk-card__header">
        <div className="ntk-card__header-copy">
          <span className="ntk-card__eyebrow">{eyebrow}</span>
          <h2 className="ntk-card__title">{title}</h2>
          <p className="ntk-card__subtitle">{subtitle}</p>
        </div>
      </header>

      <div className="catalog-table-wrap">
        {filters}

        {loading && <p className="catalog-table__empty">Cargando registros...</p>}
        {error && <p className="catalog-table__error">{error}</p>}
        {!loading && !error && rows.length === 0 && <p className="catalog-table__empty">{emptyText}</p>}

        {!loading && !error && rows.length > 0 && (
          <table className="catalog-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>{column.header}</th>
                ))}
                {renderActions && <th>{actionsHeader}</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={rowKey(row, index)}>
                  {columns.map((column) => (
                    <td key={column.key}>{column.render(row)}</td>
                  ))}
                  {renderActions && <td>{renderActions(row)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
