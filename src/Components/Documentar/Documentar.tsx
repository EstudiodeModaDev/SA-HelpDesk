import React from "react";
import { useAuth } from "../../Auth/authContext";
import type { Ticket } from "../../Models/Tickets";
import "./Documentar.css";
import RichTextBase64 from "../RichTextBase64/RichTextBase64";
import { useDocumentarTicket } from "../../Funcionalidades/Documentar/hooks/useDocumentarTickets";
import FilesAdmin from "../Common/FilesAdmin";
import { usePlantillas } from "../../Funcionalidades/Templates/hooks/usePlantillas";


export default function Documentar({ ticket, tipo, onDone }: { ticket: Ticket; tipo: "solucion" | "seguimiento"; onDone: () => void | Promise<void>}) { 
  const { account } = useAuth();
  const { state, errors, submitting, setField, handleSubmit, addFiles, files, removeFile} = useDocumentarTicket()

  // ⬇️ usamos también loading/error por si quieres feedback
  const { ListaPlantillas, loading: loadingPlantillas, error: errorPlantillas } = usePlantillas();

  const [plantillaId, setPlantillaId] = React.useState<string>("");

  const onSelectPlantilla = (id: string) => {
    setPlantillaId(id);
    const p = (ListaPlantillas ?? []).find(pl => pl.Id === id);
    if (!p) return;
    // Asumimos que CamposPlantilla trae HTML listo para el editor
    setField("Descripcion", p.CamposPlantilla ?? "");
  };

  return (
    <section className="docx-shell">

      <form className="docx-layout">
        <main className="docx-main">
          <section className="docx-panel docx-panel--editor">
            <div className="docx-panel__head">
              <div>
                <h3 className="docx-panel__title">Descripción</h3>
                <p className="docx-panel__hint"> Explica claramente lo realizado, hallazgos o contexto del caso. </p>
              </div>
            </div>

            <div className="docx-field">
              <label className="docx-label">Descripción de {tipo}</label>

              <div className="docx-editor-wrap">
                <RichTextBase64 value={state.Descripcion} onChange={(html) => setField("Descripcion", html)} placeholder="Describe el problema y pega capturas (Ctrl+V)…"/>
              </div>

              {errors.Descripcion && (
                <small className="docx-error">{errors.Descripcion}</small>
              )}
            </div>
          </section>
        </main>

        <aside className="docx-side">
          <section className="docx-panel">
            <div className="docx-panel__head">
              <div>
                <h3 className="docx-panel__title">Plantilla</h3>
                <p className="docx-panel__hint">Puedes cargar una plantilla para acelerar el diligenciamiento.</p>
              </div>
            </div>

            <div className="docx-field">
              <div className="docx-select-wrap">
                <select id="plantilla" className="docx-input docx-select" value={plantillaId} onChange={(e) => onSelectPlantilla(e.target.value)} disabled={submitting || loadingPlantillas}>
                  <option value="">
                    {loadingPlantillas
                      ? "Cargando plantillas..."
                      : "— Selecciona una plantilla —"}
                  </option>
                  {(ListaPlantillas ?? []).map((p) => (
                    <option key={p.Id} value={p.Id}>
                      {p.Title}
                    </option>
                  ))}
                </select>

                <span className="docx-select-icon" aria-hidden="true">
                  ⌄
                </span>
              </div>

              {errorPlantillas && (
                <small className="docx-error">{errorPlantillas}</small>
              )}
            </div>
          </section>

          <section className="docx-panel">
            <div className="docx-panel__head">
              <div>
                <h3 className="docx-panel__title">Archivos adjuntos</h3>
                <p className="docx-panel__hint">
                  Adjunta evidencias, capturas, documentos o soportes relevantes.
                </p>
              </div>
            </div>

            <div className="docx-upload">
              <FilesAdmin
                title=""
                onAddFiles={addFiles}
                onRemoveFile={removeFile}
                submitting={submitting}
                files={files}
              />
            </div>
          </section>
        </aside>

        <footer className="docx-footer">
          <div className="docx-footer__meta">
            <span className="docx-footer__text">
              {files.length > 0
                ? `${files.length} archivo${files.length > 1 ? "s" : ""} seleccionado${files.length > 1 ? "s" : ""}`
                : "Sin archivos adjuntos"}
            </span>
          </div>

          <div className="docx-footer__actions">
            <button
              type="button"
              disabled={submitting}
              className="docx-btn docx-btn--ghost"
              onClick={onDone}
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={submitting}
              className="docx-btn docx-btn--primary"
              onClick={async (e) => {
                await handleSubmit(e, tipo, ticket, account!);
                await onDone();
              }}
            >
              {submitting ? "Enviando..." : "Guardar documentación"}
            </button>
          </div>
        </footer>
      </form>
    </section>
  );
}
