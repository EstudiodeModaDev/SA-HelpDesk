import Select from "react-select";
import FilesAdmin from "../../Common/FilesAdmin";
import type {
  CorreoErrors,
  correoState,
} from "../../../Funcionalidades/ProveedoresNotifications/hooks/useProveedoresMailForm";
import RichTextBase64 from "../../RichTextBase64/RichTextBase64";
import "../../NuevoTicket/NuevoTicket.css";
import "./Correo.css";
import React from "react";

type Props = {
  onClose: () => void;
  options: { value: string; label: string }[];
  onSubmit: () => Promise<void>;
  setField: <K extends keyof correoState>(key: K, value: correoState[K]) => void;
  state: correoState;
  errors: CorreoErrors;
  handleAddFiles: (file: File[] | FileList) => void;
  handleRemoveFiles: (index: number) => void;
};

export default function CorreoModal({onClose, options, onSubmit, setField, state,  errors, handleAddFiles, handleRemoveFiles,}: Props) {
  
  const onSendMail = React.useCallback(async () => {
    await onSubmit()
    onClose()
  }, [state]);
  
  return (
    <div className="correo-modal">
      <section className="ntk-card">
        <header className="ntk-card__header">
          <div className="ntk-card__header-copy">
            <span className="ntk-card__eyebrow">Comunicacion</span>
            <h2 className="ntk-card__title">Enviar correo</h2>
          </div>

          <div className="ntk-card__status">
            <button type="button" className="correo-modal__close" onClick={onClose} aria-label="Cerrar modal">
              ×
            </button>
          </div>
        </header>

        <form className="ntk-form" noValidate onSubmit={(e) => { e.preventDefault(); onSendMail() }}>
          <section className="ntk-section">
            <div className="ntk-section__head">
              <h3 className="ntk-section__title">Destinatarios</h3>
            </div>

            <div className="correo-modal__grid correo-modal__grid--2">
              <div className={`ntk-field ${errors.correo ? "has-error" : ""}`}>
                <label className="ntk-label" htmlFor="correo-para">Para</label>
                <Select<{ value: string; label: string }, false>
                  inputId="correo-para"
                  classNamePrefix="rs"
                  options={options}
                  placeholder="Selecciona un destinatario"
                  isClearable
                  onChange={(e) => {setField("para", e?.label ?? ""); setField("correo", e?.value ?? "")}}
                />
                {errors.correo && <small className="ntk-error">{errors.correo}</small>}
              </div>

              <div className="ntk-field">
                <label className="ntk-label" htmlFor="correo-cc">
                  Correo
                </label>
                <input id="correo-cc" className="ntk-input" placeholder="copias opcionales" value={state.correo}/>
                {errors.correo && <small className="ntk-error">{errors.correo}</small>}
              </div>
            </div>
          </section>

          <section className="ntk-section">
            <div className="ntk-section__head">
              <h3 className="ntk-section__title">Contenido</h3>
            </div>

            <div className="correo-modal__grid">
              <div className={`ntk-field ${errors.asunto ? "has-error" : ""}`}>
                <label className="ntk-label" htmlFor="correo-asunto">
                  Asunto
                </label>
                <input
                  id="correo-asunto"
                  className="ntk-input"
                  type="text"
                  placeholder="Ej. Actualizacion del caso #12345"
                  value={state.asunto}
                  onChange={(e) => {setField("asunto", e.target.value)}}
                />
                {errors.asunto && <small className="ntk-error">{errors.asunto}</small>}
              </div>

              <div className={`ntk-field ${errors.mensaje ? "has-error" : ""}`}>
                <label className="ntk-label" htmlFor="correo-mensaje">
                  Mensaje
                </label>
                <RichTextBase64 value={state.mensaje}  onChange={(e) => {setField("mensaje", e)}}/>
                {errors.mensaje && <small className="ntk-error">{errors.mensaje}</small>}
              </div>
            </div>
          </section>

          <section className="ntk-section">
            <div className="ntk-section__head">
              <h3 className="ntk-section__title">Adjuntos</h3>
            </div>

            <div className="correo-modal__dropzone">
              <FilesAdmin
                title="Adjuntar archivos"
                onAddFiles={handleAddFiles}
                onRemoveFile={handleRemoveFiles}
                submitting={false}
                files={state.adjuntos}
              />
            </div>
          </section>

          <footer className="ntk-actions">
            <div className="ntk-actions__meta">
              <span className="ntk-actions__text">Borrador de correo listo para integrar con la logica de envio.</span>
            </div>

            <div className="ntk-actions__buttons">
              <button type="button" className="ntk-btn correo-modal__secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="ntk-btn ntk-btn--primary">
                Enviar correo
              </button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  );
}
