import * as React from "react";
import Select, { components, type OptionProps, type SingleValue } from "react-select";
import "./NuevoTicket.css";
import "../../App.css";
import type { UserOption } from "../../Models/Commons";
import { useGraphServices } from "../../graph/GrapServicesContext";
import { norm, pick, s } from "../../utils/Commons";
import RichTextBase64 from "../RichTextBase64/RichTextBase64";
import { useWorkers } from "../../Funcionalidades/Workers";
import { useANS } from "../../Funcionalidades/Tickets/utils/Ans";
import { useNuevoTicketForm } from "../../Funcionalidades/Tickets/hooks/forms/useNuevoTicketForm";
import { horasPorANS } from "../../Funcionalidades/Tickets/utils/ticketConstants";
import FilesAdmin from "../Common/FilesAdmin";
import { useFranquicias } from "../../Funcionalidades/Franquicias/hooks/useFranquicias";
import { useTiendasZonas } from "../../Funcionalidades/TiendasZonas/hooks/useTiendasZonas";

export type UserOptionEx = UserOption & { source?: "Empleado" | "Franquicia" };

export type TreeOption = {
  value: string; // "sub:<id>" | "art:<id>"
  label: string; // "Cat > Sub" | "Cat > Sub > Art"
  meta: {
    catId: string | number;
    subId: string | number;
    artId?: string | number;
    catTitle: string;
    subTitle: string;
    artTitle?: string; // vacío cuando solo Cat/Sub
    kind: "sub" | "art";
  };
};

export default function NuevoTicketForm() {
  const {Franquicias: FranquiciasSvc, ANS} = useGraphServices();
  const {state, errors, submitting, categorias, subcategoriasAll, loadingCatalogos, setField, handleSubmit, files, addFiles, removeFile} = useNuevoTicketForm();
  const { franqOptions, loading: loadingFranq, error: franqError } = useFranquicias(FranquiciasSvc!);
  const { workersOptions, loadingWorkers, error: usersError } = useWorkers({ onlyEnabled: true });
  const {tiendaZonaOptions, loading: loadingTiendas} = useTiendasZonas()
  const {obtainANS} = useANS(ANS)

  // ====== Combinar usuarios con franquicias
  const combinedOptions: UserOptionEx[] = React.useMemo(() => {
    const map = new Map<string, UserOptionEx>();
    for (const o of [...workersOptions, ...franqOptions]) {
      const key = (o.value || "").toLowerCase();
      if (!map.has(key)) map.set(key, o);
    }
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [workersOptions, franqOptions]);

  // ✅ TreeOptions = Subcategorías (sin artículo) + Artículos (con artículo)
  const treeOptions: TreeOption[] = React.useMemo(() => {
    if (!categorias.length || !subcategoriasAll.length) {
      console.log("categorias:", categorias);
      console.log("subcategoriasAll:", subcategoriasAll);
      return []
    };

    const catById = new Map(categorias.map((c: any) => [s(c.ID), c]));

    // 1) base: Cat > Sub
    const base: TreeOption[] = subcategoriasAll.map((sub: any) => {
      const catIdRaw = pick(sub, ["Id_categoria", "Id_Categoria", "CategoriaId", "IdCategoria"]);
      const cat = catById.get(s(catIdRaw));

      const catTitle = cat?.Title ?? "(Sin categoría)";
      const subTitle = sub?.Title ?? "(Sin subcategoría)";

      return {
        value: `sub:${s(sub.ID)}`,
        label: `${catTitle} > ${subTitle}`,
        meta: {
          kind: "sub",
          catId: catIdRaw ?? "",
          subId: sub.ID ?? "",
          catTitle,
          subTitle,
          artTitle: "",
        },
      };
    });


    return [...base, ].sort((x, y) => x.label.localeCompare(y.label));
  }, [categorias, subcategoriasAll,]);

  // ✅ value actual del select (basado en tus 3 fields de state: Categoria/SubCategoria/SubSubCategoria)
  const treeValue: TreeOption | null = React.useMemo(() => {
    if (!state.Categoria || !state.SubCategoria) return null;

    const nCat = norm(state.Categoria || "");
    const nSub = norm(state.SubCategoria || "");

    return (
      treeOptions.find(
        (o) =>
          o.meta.kind === "sub" &&
          norm(o.meta.catTitle) === nCat &&
          norm(o.meta.subTitle) === nSub
      ) ?? null
    );
  }, [state.Categoria, state.SubCategoria, treeOptions]);

  const Option = (props: OptionProps<UserOptionEx, false>) => {
    const { data, label } = props;
    return (
      <components.Option {...props}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="block truncate font-semibold text-[var(--ink)]">{label}</span>
          </div>
          {data.source && (
            <span className="shrink-0 rounded-md border border-[var(--bd)] bg-[color-mix(in_oklab,var(--surface)_92%,transparent)] px-2 py-0.5 text-[11px] font-bold text-[var(--muted)]">
              {data.source}
            </span>
          )}
        </div>
      </components.Option>
    );
  };

  const onTreeChange = async (opt: SingleValue<TreeOption>) => {
    if (!opt) {
      setField("Categoria", "");
      setField("SubCategoria", "");
      return;
    }

    // Guardas títulos (como lo venías haciendo) + artículo vacío si no aplica
    setField("Categoria", opt.meta.catTitle);
    setField("SubCategoria", opt.meta.subTitle);
    setField("id_Categoria", String(opt.meta.catId));
    setField("Id_Subcategoria", String(opt.meta.subId));

    const ans = await obtainANS(String(opt.meta.catId), String(opt.meta.subId) ?? "",)
    setField("ANS", ans?.Title)
  };

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if(files.length === 0){
      alert("Debe adjuntar minimo un documento como evidencia")
      return
    }

    handleSubmit(e, state.ANS ?? "")
  };

  const disabledCats = submitting || loadingCatalogos;

  const selectedSolicitnate = combinedOptions.find((o) => o.value.toLocaleLowerCase() === state.CorreoSolicitante?.trim().toLocaleLowerCase()) ?? null;
  const selectedZona = tiendaZonaOptions.find((o) => o.label.toLocaleLowerCase() === state.Title?.trim().toLocaleLowerCase()) ?? null;

  return (
    <section className="ntk-card">
      <header className="ntk-card__header">
        <div className="ntk-card__header-copy">
          <span className="ntk-card__eyebrow">Mesa de ayuda</span>
          <h2 className="ntk-card__title">Nuevo Ticket</h2>
          <p className="ntk-card__subtitle">
            Registra el caso con una descripción clara, clasifícalo correctamente y adjunta evidencias si aplica.
          </p>
        </div>

        <div className="ntk-card__status">
          <span className={`ntk-badge ${submitting ? "is-loading" : ""}`}>
            {submitting ? "Enviando..." : "SERVICIOS ADMINISTRATIVOS"}
          </span>
        </div>
      </header>

      <form onSubmit={(e) => onCreate(e)} noValidate className="ntk-form">
        <section className="ntk-section">
          <div className="ntk-section__head">
            <h3 className="ntk-section__title">Información básica</h3>
            <p className="ntk-section__hint">
              Define quién reporta el caso y cuál es el asunto principal.
            </p>
          </div>

          <div className="ntk-grid ntk-grid--2">
            <div className="ntk-field">
              <label className="ntk-label">Solicitante</label>
              <Select<UserOptionEx, false>
                options={combinedOptions}
                placeholder={
                  loadingTiendas 
                    ? "Cargando opciones…"
                    : "Buscar solicitante…"
                }
                value={selectedSolicitnate}
                onChange={(opt) => {
                  setField("CorreoSolicitante", opt?.value);
                  setField("Solicitante", opt?.label);
                }}
                classNamePrefix="rs"
                isDisabled={submitting || loadingWorkers || loadingFranq}
                isLoading={loadingWorkers || loadingFranq}
                components={{ Option }}
                noOptionsMessage={() =>
                  usersError || franqError ? "Error cargando opciones" : "Sin coincidencias"
                }
                isClearable
              />
              {errors.Solicitante && <small className="ntk-error">{errors.Solicitante}</small>}
            </div>

            <div className="ntk-field">
              <label className="ntk-label" htmlFor="motivo">
                Espacio fisico
              </label>
              <Select<UserOptionEx, false>
                options={tiendaZonaOptions}
                placeholder={
                  loadingWorkers || loadingFranq
                    ? "Cargando opciones…"
                    : "Buscar espacio"
                }
                value={selectedZona}
                onChange={(opt) => {
                  setField("Title", opt?.label);
                }}
                classNamePrefix="rs"
                isDisabled={submitting || loadingTiendas}
                isLoading={loadingTiendas }
                components={{ Option }}
                noOptionsMessage={() =>
                  usersError || franqError ? "Error cargando opciones" : "Sin coincidencias"
                }
                isClearable
              />
              {errors.Title && <small className="ntk-error">{errors.Title}</small>}
            </div>
          </div>
        </section>

        <section className="ntk-section">
          <div className="ntk-section__head">
            <h3 className="ntk-section__title">Clasificación</h3>
            <p className="ntk-section__hint">
              Selecciona la categoría correcta para calcular el ANS y enrutar el caso adecuadamente.
            </p>
          </div>

          <div className="ntk-grid ntk-grid--2 ntk-grid--align-start">
            <div className="ntk-field">
              <label className="ntk-label">Categoría</label>
              <Select<TreeOption, false>
                classNamePrefix="rs"
                placeholder={
                  loadingCatalogos
                    ? "Cargando catálogo..."
                    : "Buscar categoría/sub/artículo…"
                }
                options={treeOptions}
                value={treeValue}
                onChange={onTreeChange}
                isDisabled={disabledCats}
                isClearable
              />
              {errors.Categoria && <small className="ntk-error">{errors.Categoria}</small>}
            </div>

            <div className="ntk-field">
              <label className="ntk-label" htmlFor="ans">
                ANS
              </label>

              <div className="ntk-ans-card" id="ans">
                <div className="ntk-ans-card__pill">
                  {state.ANS || "Sin definir"}
                </div>

                <div className="ntk-ans-card__meta">
                  {state.ANS
                    ? `${horasPorANS[state.ANS ?? ""]} horas hábiles para resolución`
                    : "Selecciona una categoría para calcular el ANS"}
                </div>
              </div>

              {errors.ANS && <small className="ntk-error">{errors.ANS}</small>}
            </div>
          </div>
        </section>

        <section className="ntk-section">
          <div className="ntk-section__head">
            <h3 className="ntk-section__title">Descripción del caso</h3>
            <p className="ntk-section__hint">
              Explica el problema con el mayor contexto posible. Puedes pegar capturas directamente.
            </p>
          </div>

          <div className={`ntk-field ${errors.Descripcion ? "has-error" : ""}`}>
            <div className="ntk-editor-wrap">
              <RichTextBase64 value={state.Descripcion ?? ""} onChange={(html) => setField("Descripcion", html)} placeholder="Describe el problema y pega capturas (Ctrl+V)..."/>
            </div>

            {errors.Descripcion && <small className="ntk-error">{errors.Descripcion}</small>}
          </div>
        </section>

        <section className="ntk-section">
          <div className="ntk-section__head">
            <h3 className="ntk-section__title">Adjuntos</h3>
            <p className="ntk-section__hint">
              Agrega archivos de soporte como imágenes, documentos o evidencias del caso.
            </p>
          </div>

          <FilesAdmin
            title="Archivos adjuntos"
            onAddFiles={addFiles}
            onRemoveFile={removeFile}
            submitting={submitting}
            files={files}
          />
        </section>

        <footer className="ntk-actions">
          <div className="ntk-actions__meta">
            <span className="ntk-actions__text">
              {files.length > 0
                ? `${files.length} archivo${files.length > 1 ? "s" : ""} adjunto${files.length > 1 ? "s" : ""}`
                : "Sin adjuntos"}
            </span>
          </div>

          <div className="ntk-actions__buttons">
            <button type="submit" disabled={submitting || loadingCatalogos} className="ntk-btn ntk-btn--primary">
              {submitting ? "Enviando..." : "Enviar Ticket"}
            </button>
          </div>
        </footer>
      </form>
    </section>
  );
}
