import * as React from "react";
import "../NuevoTicket/NuevoTicket.css";
import "./CargaMasivaTickets.css";
import { useCargaMasivaTickets } from "../../Funcionalidades/Tickets/hooks/forms/useCargaMasivaTickets";

export default function CargaMasivaTickets() {
  const {
    file,
    setFile,
    submitting,
    progress,
    result,
    processFile,
    downloadTemplate,
    downloadingTemplate,
    reset,
    loadingCatalogos,
    errorCatalogos,
    permissionsLoading,
  } = useCargaMasivaTickets();

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await processFile();
  };

  const onReset = () => {
    reset();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const disabled = submitting || loadingCatalogos || permissionsLoading;

  return (
    <section className="ntk-card">
      <header className="ntk-card__header">
        <div className="ntk-card__header-copy">
          <span className="ntk-card__eyebrow">Mesa de ayuda</span>
          <h2 className="ntk-card__title">Carga masiva de tickets</h2>
          <p className="ntk-card__subtitle">
            Sube un Excel con una fila por caso. El sistema crea un ticket por cada fila valida y reporta
            las filas que no pudo procesar.
          </p>
        </div>

        <div className="ntk-card__status">
          <span className={`ntk-badge ${submitting ? "is-loading" : ""}`}>
            {submitting
              ? `Procesando ${progress?.current ?? 0}/${progress?.total ?? 0}`
              : "SERVICIOS ADMINISTRATIVOS"}
          </span>
        </div>
      </header>

      <form onSubmit={onSubmit} noValidate className="ntk-form">
        <section className="ntk-section">
          <div className="ntk-section__head">
            <h3 className="ntk-section__title">1. Descarga la plantilla</h3>
            <p className="ntk-section__hint">
              Incluye las columnas requeridas y una hoja con las categorias y subcategorias validas hoy en el
              sistema.
            </p>
          </div>

          <div className="cmk-row">
            <button
              type="button"
              className="ntk-btn ntk-btn--primary"
              onClick={downloadTemplate}
              disabled={loadingCatalogos || downloadingTemplate}
            >
              {downloadingTemplate ? "Generando..." : "Descargar plantilla"}
            </button>
            {errorCatalogos && <small className="ntk-error">{errorCatalogos}</small>}
          </div>
        </section>

        <section className="ntk-section">
          <div className="ntk-section__head">
            <h3 className="ntk-section__title">2. Sube el archivo diligenciado</h3>
            <p className="ntk-section__hint">Formatos aceptados: .xlsx, .xls.</p>
          </div>

          <div className="cmk-row">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={onFileChange}
              disabled={disabled}
              className="cmk-file-input"
            />
            <span className="cmk-file-name">{file ? file.name : "Ningun archivo seleccionado"}</span>
          </div>
        </section>

        <footer className="ntk-actions">
          <div className="ntk-actions__meta">
            <span className="ntk-actions__text">
              {file ? "Listo para procesar" : "Selecciona un archivo para continuar"}
            </span>
          </div>

          <div className="ntk-actions__buttons">
            {result && (
              <button type="button" className="ntk-btn" onClick={onReset} disabled={submitting}>
                Cargar otro archivo
              </button>
            )}
            <button type="submit" className="ntk-btn ntk-btn--primary" disabled={disabled || !file}>
              {submitting ? "Procesando..." : "Procesar archivo"}
            </button>
          </div>
        </footer>
      </form>

      {result && (
        <section className="ntk-section cmk-result">
          <div className="ntk-section__head">
            <h3 className="ntk-section__title">Resultado</h3>
            <p className="ntk-section__hint">
              {result.created} de {result.processed} fila(s) crearon un ticket correctamente.
              {result.errors.length > 0 ? ` ${result.errors.length} fila(s) con error.` : ""}
            </p>
          </div>

          {result.errors.length > 0 && (
            <div className="cmk-error-table-wrap">
              <table className="cmk-error-table">
                <thead>
                  <tr>
                    <th>Fila</th>
                    <th>Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {result.errors.map((e) => (
                    <tr key={e.row}>
                      <td>{e.row}</td>
                      <td>{e.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </section>
  );
}
