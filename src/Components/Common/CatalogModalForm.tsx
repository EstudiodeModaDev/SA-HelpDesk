import * as React from "react";
import "../NuevoTicket/NuevoTicket.css";
import "./CatalogUI.css";

type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  sectionTitle: string;
  sectionHint: string;
  submitting?: boolean;
  submitLabel: string;
  submittingLabel?: string;
  helperText: string;
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
  onClose: () => void;
  children: React.ReactNode;
};

export default function CatalogModalForm(props: Props) {
  const {
    eyebrow,
    title,
    subtitle,
    sectionTitle,
    sectionHint,
    submitting = false,
    submitLabel,
    submittingLabel,
    helperText,
    onSubmit,
    onClose,
    children,
  } = props;

  return (
    <section className="ntk-card catalog-modal__card">
      <header className="ntk-card__header">
        <div className="ntk-card__header-copy">
          <span className="ntk-card__eyebrow">{eyebrow}</span>
          <h2 className="ntk-card__title">{title}</h2>
          <p className="ntk-card__subtitle">{subtitle}</p>
        </div>

        <div className="ntk-card__status">
          <button type="button" className="catalog-modal__close" onClick={onClose} aria-label="Cerrar formulario">
            x
          </button>
        </div>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void onSubmit(e);
        }}
        noValidate
        className="ntk-form"
      >
        <section className="ntk-section">
          <div className="ntk-section__head">
            <h3 className="ntk-section__title">{sectionTitle}</h3>
            <p className="ntk-section__hint">{sectionHint}</p>
          </div>

          {children}
        </section>

        <footer className="ntk-actions">
          <div className="ntk-actions__meta">
            <span className="ntk-actions__text">{helperText}</span>
          </div>

          <div className="ntk-actions__buttons">
            <button type="button" className="ntk-btn catalog-btn-secondary" onClick={onClose} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" className="ntk-btn ntk-btn--primary" disabled={submitting}>
              {submitting ? submittingLabel ?? submitLabel : submitLabel}
            </button>
          </div>
        </footer>
      </form>
    </section>
  );
}
