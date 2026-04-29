import * as React from "react";
import "./RelacionadorInline.css";
import Select, { type SingleValue } from "react-select";
import type { Ticket } from "../../../../Models/Tickets";
import { useNuevoTicketForm } from "../../../../Funcionalidades/Tickets/hooks/forms/useNuevoTicketForm";
import type { TreeOption } from "../../../NuevoTicket/NuevoTicket";
import { useGraphServices } from "../../../../graph/GrapServicesContext";
import { norm, pick, s } from "../../../../utils/Commons";
import RichTextBase64 from "../../../RichTextBase64/RichTextBase64";
import { useANS } from "../../../../Funcionalidades/Tickets/utils/Ans";
import { horasPorANS } from "../../../../Funcionalidades/Tickets/utils/ticketConstants";
import { useDocumentarTicket } from "../../../../Funcionalidades/Documentar/hooks/useDocumentarTickets";
import { useAuth } from "../../../../Auth/authContext";

export type TicketLite = { ID: number | string; Title: string };

type Props = {
  currentId: number | string;
  onCancel: () => void;
  reload: () => void;
  onFinish: () => void;
  onTicketChanged?: () => Promise<void> | void;
  ticket: Ticket;
};

export default function RelacionadorInline({ reload, onCancel, onTicketChanged, ticket }: Props) {
  const graph = useGraphServices();
  const {
    state: TicketState,
    errors,
    submitting,
    categorias,
    subcategoriasAll,
    loadingCatalogos,
    setField: setTicketField,
    handleSubmit,
  } = useNuevoTicketForm();
  const { state, submitting: closing, setField, handleSubmit: cerrarTicket } = useDocumentarTicket();
  const { obtainANS } = useANS(graph.ANS);
  const auth = useAuth();
  const [pendingClose, setPendingClose] = React.useState(false);

  const loading = closing || submitting;

  React.useEffect(() => {
    setTicketField("Solicitante", ticket.Solicitante);
    setTicketField("CorreoSolicitante", ticket.CorreoSolicitante);
    setTicketField("Nombreresolutor", ticket.Nombreresolutor);
    setTicketField("Correoresolutor", ticket.Correoresolutor);
    setTicketField("IdCasoPadre", ticket.ID);
    setTicketField(
      "Descripcion",
      `Continuación del ticket ${ticket.ID}</br>
      <strong>Descripción original:</strong> ${ticket.Descripcion}
      `
    );
    setTicketField("Title", ticket.Title);
  }, []);

  React.useEffect(() => {
    if (!pendingClose) return;
    if (!state.Descripcion?.trim()) return;

    const run = async () => {
      if (!(ticket.Estadodesolicitud ?? "").trim().toLocaleLowerCase().includes("cerrado")) {
        await cerrarTicket({ preventDefault() {} } as React.FormEvent, "solucion", ticket, auth.account!);
      }

      alert("Se ha creado el ticket con éxito");
      await reload();
      await onTicketChanged?.();
      onCancel();
      setPendingClose(false);
    };

    void run();
  }, [pendingClose, ticket, auth.account, state.Descripcion,]);

  const onTreeChange = async (opt: SingleValue<TreeOption>) => {
    if (!opt) {
      setTicketField("Categoria", "");
      setTicketField("SubCategoria", "");
      return;
    }

    setTicketField("Categoria", opt.meta.catTitle);
    setTicketField("SubCategoria", opt.meta.subTitle);
    setTicketField("id_Categoria", String(opt.meta.catId));
    setTicketField("Id_Subcategoria", String(opt.meta.subId));

    const ans = await obtainANS(String(opt.meta.catId), String(opt.meta.subId) ?? "");
    setTicketField("ANS", ans?.Title);
  };

  const treeOptions: TreeOption[] = React.useMemo(() => {
    if (!categorias.length || !subcategoriasAll.length) {
      console.log("categorias:", categorias);
      console.log("subcategoriasAll:", subcategoriasAll);
      return [];
    }

    const catById = new Map(categorias.map((c: any) => [s(c.ID), c]));

    const base: TreeOption[] = subcategoriasAll.map((sub: any) => {
      const catIdRaw = pick(sub, ["Id_categoria", "Id_Categoria", "CategoriaId", "IdCategoria"]);
      const cat = catById.get(s(catIdRaw));

      const catTitle = cat?.Title ?? "(Sin categorÃ­a)";
      const subTitle = sub?.Title ?? "(Sin subcategorÃ­a)";

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

    return [...base].sort((x, y) => x.label.localeCompare(y.label));
  }, [categorias, subcategoriasAll]);

  const treeValue: TreeOption | null = React.useMemo(() => {
    if (!TicketState.Categoria || !TicketState.SubCategoria) return null;

    const nCat = norm(TicketState.Categoria || "");
    const nSub = norm(TicketState.SubCategoria || "");

    return (
      treeOptions.find(
        (o) => o.meta.kind === "sub" && norm(o.meta.catTitle) === nCat && norm(o.meta.subTitle) === nSub
      ) ?? null
    );
  }, [TicketState.Categoria, TicketState.SubCategoria, treeOptions]);

  const onSubmit = async (e: React.FormEvent) => {
    if (!TicketState.Categoria || !TicketState.SubCategoria) {
      alert("Debe seleccionar una categoria");
      return;
    }

    await handleSubmit(e, TicketState.ANS ?? "");
    setField("Actor", auth.account?.name ?? "");
    setField("CorreoActor", auth.account?.username ?? "");
    setField(
      "Descripcion",
      `Se cierra el ticket porque se ha creado un ticket hijo con <strong>${ticket.ID}</strong> como continuaciÃ³n del mismo`
    );
    setField("Tipo_de_accion", "solucion");
    setField("Title", ticket.ID ?? "");
    setPendingClose(true);
  };

  return (
    <div className="relc">
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
            <h3 className="ntk-section__title">Descripción del caso</h3>
            <p className="ntk-section__hint">
              Explica el problema con el mayor contexto posible. Puedes pegar capturas directamente.
            </p>
          </div>

          <div className={`ntk-field ${errors.Descripcion ? "has-error" : ""}`}>
            <div className="ntk-editor-wrap">
              <RichTextBase64
                value={TicketState.Descripcion ?? ""}
                onChange={(html) => setTicketField("Descripcion", html)}
                placeholder="Describe el problema y pega capturas (Ctrl+V)..."
              />
            </div>

            {errors.Descripcion && <small className="ntk-error">{errors.Descripcion}</small>}
          </div>
        </section>

        <section className="ntk-section">
          <div className="ntk-section__head">
            <h3 className="ntk-section__title">Clasificación</h3>
            <p className="ntk-section__hint">
              Selecciona la categoria correcta para calcular el ANS y enrutar el caso adecuadamente.
            </p>
          </div>

          <div className="ntk-grid ntk-grid--2 ntk-grid--align-start">
            <div className="ntk-field">
              <label className="ntk-label">Categoria</label>
              <Select<TreeOption, false>
                classNamePrefix="rs"
                placeholder={loadingCatalogos ? "Cargando catalogo..." : "Buscar categoria/subcategoria"}
                options={treeOptions}
                value={treeValue}
                onChange={onTreeChange}
                isClearable
              />
              {errors.Categoria && <small className="ntk-error">{errors.Categoria}</small>}
            </div>

            <div className="ntk-field">
              <label className="ntk-label" htmlFor="ans">
                ANS
              </label>

              <div className="ntk-ans-card" id="ans">
                <div className="ntk-ans-card__pill">{TicketState.ANS || "Sin definir"}</div>

                <div className="ntk-ans-card__meta">
                  {TicketState.ANS
                    ? `${horasPorANS[TicketState.ANS ?? ""]} horas hÃ¡biles para resoluciÃ³n`
                    : "Selecciona una categorÃ­a para calcular el ANS"}
                </div>
              </div>

              {errors.ANS && <small className="ntk-error">{errors.ANS}</small>}
            </div>
          </div>
        </section>

        <footer className="ntk-actions">
          <div className="ntk-actions__buttons">
            <button type="submit" disabled={loading || loadingCatalogos} className="ntk-btn ntk-btn--primary">
              {loading ? "Creando..." : "Crear Ticket"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              title="Cancelar"
              aria-label="Cancelar"
            >
              Cancelar
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}
