import "./NuevaPlantilla.css";
import RichTextBase64 from "../RichTextBase64/RichTextBase64";
import { usePlantillas } from "../../Funcionalidades/Templates/hooks/usePlantillas";

export default function CrearPlantilla() {
  const { createPlantilla, loading, state, setField } = usePlantillas();

  return (
    <section className="tpl-page tpl-scope" aria-label="Crear una plantilla">
      <form className="tpl-form" onSubmit={(e) => {e.preventDefault(); createPlantilla();}}>
        <header className="tpl-hero">
          <div className="tpl-hero__copy">
            <span className="tpl-eyebrow">AutomatizaciÃ³n documental</span>
            <h1 className="tpl-title">Crear una plantilla</h1>
            <p className="tpl-subtitle">
              DiseÃ±a respuestas y estructuras reutilizables con un formato mÃ¡s claro para el equipo operativo.
            </p>
          </div>
          <div className="tpl-hero__meta">
            <span className="tpl-chip">{loading ? "Guardando..." : "Lista para editar"}</span>
          </div>
        </header>

        <div className="tpl-field">
          <label htmlFor="nombre" className="tpl-label">Nombre de la plantilla</label>
          <input id="nombre" name="nombre" className="tpl-input" placeholder="Ingrese el nombre de la plantilla" value={state.Title} onChange={(e) => setField("Title", e.target.value)} required/>
        </div>

        <div className="tpl-field">
          <label className="tpl-label">Campos de la plantilla</label>

          {/* Editor */}
          <div className="tpl-editorWrapper">
            <RichTextBase64 value={state.CamposPlantilla} onChange={(html) => setField("CamposPlantilla", html)} placeholder="Cree su plantilla..."/>
          </div>

          {/* hint opcional */}
          <small className="tpl-hint">
            Puedes usar negrilla, listas y adjuntar imágenes. El contenido se
            guardará en HTML.
          </small>
        </div>

        <footer className="tpl-actions">
          <button type="submit" className="tpl-primary" disabled={loading}>
            {loading ? "Guardando…" : "Guardar plantilla"}
          </button>
        </footer>
      </form>
    </section>
  );
}
