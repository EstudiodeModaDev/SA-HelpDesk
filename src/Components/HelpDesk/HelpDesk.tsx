import * as React from "react";
import "./HelpDesk.css";
import { useHelpDeskTicket } from "../../Funcionalidades/tickets";
import {
  HELP_DESK_CATALOG,
  HELP_DESK_ANS_HOURS,
  findHelpDeskCategory,
  findHelpDeskSubcategory,
} from "../../Funcionalidades/HelpDesk/helpDeskCatalog";

function formatAnsMeta(ans?: string) {
  if (!ans) return "Selecciona una categoria y una subcategoria para calcular el ANS";
  const hours = HELP_DESK_ANS_HOURS[ans as keyof typeof HELP_DESK_ANS_HOURS];
  return `${hours} horas habiles de resolucion`;
}

export default function HelpDeskForm() {
  const { state, errors, submitting, fechaSolucion, setField, handleSubmit } = useHelpDeskTicket();

  const selectedCategory = React.useMemo(
    () => findHelpDeskCategory(state.categoria),
    [state.categoria]
  );

  const selectedSubcategory = React.useMemo(
    () => findHelpDeskSubcategory(state.categoria, state.subcategoria),
    [state.categoria, state.subcategoria]
  );

  const categoryOptions = HELP_DESK_CATALOG;
  const subcategoryOptions = selectedCategory?.subcategories ?? [];
  const issueOptions = selectedSubcategory?.issues ?? [];

  const onCategoryChange = (value: string) => {
    setField("categoria", value);
    setField("subcategoria", "");
    setField("articulo", "");
    setField("ANS", "");
  };

  const onSubcategoryChange = (value: string) => {
    setField("subcategoria", value);
    setField("articulo", "");
    const subcategory = findHelpDeskSubcategory(state.categoria, value);
    setField("ANS", subcategory?.ans ?? "");
  };

  const onIssueChange = (value: string) => {
    setField("articulo", value);
    if (!state.motivo.trim()) {
      setField("motivo", value);
    }
  };

  return (
    <section className="hdk-card">
      <header className="hdk-card__header">
        <div className="hdk-card__copy">
          <span className="hdk-card__eyebrow">Mesa de Ayuda</span>
          <h1 className="hdk-card__title">Registro de Tickets HelpDesk</h1>
          <p className="hdk-card__subtitle">
            Registra el requerimiento del cliente, clasificalo con el catalogo de servicios y calcula automaticamente el ANS comprometido.
          </p>
        </div>

        <div className="hdk-card__status">
          <span className={`hdk-pill ${submitting ? "is-loading" : ""}`}>
            {submitting ? "Enviando..." : "Cliente final"}
          </span>
        </div>
      </header>

      <form className="hdk-form" onSubmit={handleSubmit} noValidate>
        <section className="hdk-panel">
          <div className="hdk-panel__head">
            <h2 className="hdk-panel__title">Datos del caso</h2>
            <p className="hdk-panel__hint">
              Define el asunto y ubica el problema dentro del modulo correcto.
            </p>
          </div>

          <div className="hdk-grid hdk-grid--2">
            <label className="hdk-field">
              <span className="hdk-label">Asunto</span>
              <input
                className="hdk-input"
                type="text"
                placeholder="Ej. No puedo facturar en caja"
                value={state.motivo}
                onChange={(e) => setField("motivo", e.target.value)}
                disabled={submitting}
              />
              {errors.motivo && <small className="hdk-error">{errors.motivo}</small>}
            </label>

            <label className="hdk-field">
              <span className="hdk-label">Categoria</span>
              <select
                className="hdk-input"
                value={state.categoria}
                onChange={(e) => onCategoryChange(e.target.value)}
                disabled={submitting}
              >
                <option value="">Selecciona una categoria</option>
                {categoryOptions.map((category) => (
                  <option key={category.title} value={category.title}>
                    {category.title}
                  </option>
                ))}
              </select>
              {errors.categoria && <small className="hdk-error">{errors.categoria}</small>}
            </label>

            <label className="hdk-field">
              <span className="hdk-label">Subcategoria</span>
              <select
                className="hdk-input"
                value={state.subcategoria}
                onChange={(e) => onSubcategoryChange(e.target.value)}
                disabled={submitting || !selectedCategory}
              >
                <option value="">Selecciona una subcategoria</option>
                {subcategoryOptions.map((subcategory) => (
                  <option key={subcategory.title} value={subcategory.title}>
                    {subcategory.title}
                  </option>
                ))}
              </select>
              {errors.subcategoria && <small className="hdk-error">{errors.subcategoria}</small>}
            </label>

            <label className="hdk-field">
              <span className="hdk-label">Problema frecuente</span>
              <select
                className="hdk-input"
                value={state.articulo}
                onChange={(e) => onIssueChange(e.target.value)}
                disabled={submitting || !selectedSubcategory}
              >
                <option value="">Selecciona un problema del catalogo</option>
                {issueOptions.map((issue) => (
                  <option key={issue.title} value={issue.title}>
                    {issue.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="hdk-grid hdk-grid--2">
            <article className="hdk-ans">
              <span className="hdk-label">ANS asignado</span>
              <div className="hdk-ans__value">{state.ANS || "Sin definir"}</div>
              <p className="hdk-ans__meta">{formatAnsMeta(state.ANS)}</p>
              {errors.ANS && <small className="hdk-error">{errors.ANS}</small>}
            </article>

            <article className="hdk-summary">
              <span className="hdk-label">Resumen de atencion</span>
              <p className="hdk-summary__text">
                {selectedSubcategory?.summary ||
                  "Selecciona una subcategoria para ver la cobertura del servicio."}
              </p>
              <p className="hdk-summary__time">
                {fechaSolucion
                  ? `Fecha estimada de solucion: ${fechaSolucion.toLocaleString()}`
                  : "La fecha estimada se calculara al enviar el ticket."}
              </p>
            </article>
          </div>
        </section>

        <section className="hdk-panel">
          <div className="hdk-panel__head">
            <h2 className="hdk-panel__title">Descripcion</h2>
            <p className="hdk-panel__hint">
              Explica el impacto, el modulo afectado y cualquier paso que ayude a reproducir el problema.
            </p>
          </div>

          <label className="hdk-field">
            <span className="hdk-label">Detalle del requerimiento</span>
            <textarea
              className="hdk-textarea"
              rows={7}
              placeholder="Describe lo que sucede, desde cuando ocurre y como impacta al usuario..."
              value={state.descripcion}
              onChange={(e) => setField("descripcion", e.target.value)}
              disabled={submitting}
            />
            {errors.descripcion && <small className="hdk-error">{errors.descripcion}</small>}
          </label>
        </section>

        <section className="hdk-panel">
          <div className="hdk-panel__head">
            <h2 className="hdk-panel__title">Catalogo de servicios</h2>
            <p className="hdk-panel__hint">
              Referencia rapida de modulos, subcategorias y ANS disponibles para clasificar correctamente el ticket.
            </p>
          </div>

          <div className="hdk-catalog">
            {HELP_DESK_CATALOG.map((category) => (
              <article
                key={category.title}
                className={`hdk-catalog__card ${
                  state.categoria === category.title ? "is-active" : ""
                }`}
              >
                <header className="hdk-catalog__head">
                  <div>
                    <h3 className="hdk-catalog__title">{category.title}</h3>
                    <p className="hdk-catalog__subtitle">{category.summary}</p>
                  </div>
                </header>

                <div className="hdk-catalog__list">
                  {category.subcategories.map((subcategory) => (
                    <div key={subcategory.title} className="hdk-catalog__item">
                      <div className="hdk-catalog__item-top">
                        <strong>{subcategory.title}</strong>
                        <span className="hdk-chip">{subcategory.ans}</span>
                      </div>
                      <p>{subcategory.summary}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer className="hdk-actions">
          <div className="hdk-actions__meta">
            <span className="hdk-actions__text">
              {selectedSubcategory
                ? `${selectedSubcategory.title} quedara registrado con ${selectedSubcategory.ans}`
                : "Selecciona una subcategoria para completar el registro"}
            </span>
          </div>

          <button type="submit" className="hdk-btn hdk-btn--primary" disabled={submitting}>
            {submitting ? "Creando ticket..." : "Registrar ticket"}
          </button>
        </footer>
      </form>
    </section>
  );
}
