import * as React from "react";
import type { Ticket } from "../../../Models/Tickets";
import type { TreeOption } from "../../NuevoTicket/NuevoTicket";
import { useGraphServices } from "../../../graph/GrapServicesContext";
import { useTicketCatalogos } from "../../../Funcionalidades/Tickets/hooks/shared/useTicketCatalogos";
import { useANS } from "../../../Funcionalidades/Tickets/utils/Ans";
import { norm, pick, s } from "../../../utils/Commons";
import SelectActionForm from "./SelectActionForm";
import { horasPorANS } from "../../../Funcionalidades/Tickets/utils/ticketConstants";
import { calcularFechaSolucion } from "../../../utils/Ans";
import type { Holiday } from "festivos-colombianos";
import { useTicketHolidays } from "../../../Funcionalidades/Tickets/hooks/shared/useTicketHolidays";
import { toGraphDateTime } from "../../../utils/Date";

type Props = {
  ticket: Ticket;
  onDone: () => void | Promise<void>;
};

type FormErrors = {
  categoria?: string;
  general?: string;
};

export default function RecategorizarTicket({ ticket, onDone }: Props) {
  const graph = useGraphServices();
  const { categorias, subcategorias, loadingCatalogos, errorCatalogos } = useTicketCatalogos();
  const { obtainANS } = useANS(graph.ANS);

  const [value, setValue] = React.useState<TreeOption | null>(null);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const { holidays } = useTicketHolidays();

  const treeOptions: TreeOption[] = React.useMemo(() => {
    if (!categorias.length || !subcategorias.length) return [];

    const catById = new Map(categorias.map((c: any) => [s(c.ID), c]));

    return subcategorias
      .map((sub: any) => {
        const catIdRaw = pick(sub, ["Id_categoria", "Id_Categoria", "CategoriaId", "IdCategoria"]);
        const cat = catById.get(s(catIdRaw));

        const catTitle = cat?.Title ?? "(Sin categoría)";
        const subTitle = sub?.Title ?? "(Sin subcategoría)";

        return {
          value: `sub:${s(sub.ID)}`,
          label: `${catTitle} > ${subTitle}`,
          meta: {
            kind: "sub" as const,
            catId: catIdRaw ?? "",
            subId: sub.ID ?? "",
            catTitle,
            subTitle,
            artTitle: "",
          },
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [categorias, subcategorias]);

  React.useEffect(() => {
    if (!ticket.Categoria || !ticket.SubCategoria) {
      setValue(null);
      return;
    }

    const nCat = norm(ticket.Categoria || "");
    const nSub = norm(ticket.SubCategoria || "");
    const current =
      treeOptions.find(
        (o) => o.meta.kind === "sub" && norm(o.meta.catTitle) === nCat && norm(o.meta.subTitle) === nSub
      ) ?? null;

    setValue(current);
  }, [ticket.Categoria, ticket.SubCategoria, treeOptions]);

  const onSubmit = React.useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!value) {
        console.log("Not value")
        setErrors({ categoria: "Seleccione una categoría." });
        return;
      }

      setSubmitting(true);
      setErrors({});
      let solucion
      try {
        const ans = await obtainANS(String(value.meta.catId), String(value.meta.subId));

        if(!ans) return 

        const horasAns = horasPorANS[ans.Title] ?? 0;
        if (horasAns > 0) {
          solucion = calcularFechaSolucion(new Date(ticket.FechaApertura!), horasAns, holidays as Holiday[]);
        }
  

        await graph.Tickets.update(ticket.ID ?? "", {
          Categoria: value.meta.catTitle,
          SubCategoria: value.meta.subTitle,
          id_Categoria: String(value.meta.catId),
          Id_Subcategoria: String(value.meta.subId),
          ANS: ans?.Title ?? "",
          TiempoSolucion: toGraphDateTime(solucion)
        });

        onDone();
      } catch (err: any) {
        setErrors({ general: err?.message ?? "Error recategorizando ticket" });
      } finally {
        setSubmitting(false);
      }
    },
    [graph.Tickets, obtainANS, onDone, ticket.ID, value]
  );

  return (
    <SelectActionForm<TreeOption>
      label="Categoría"
      options={treeOptions}
      value={value}
      onChange={(opt) => setValue(opt)}
      onSubmit={onSubmit}
      placeholder={loadingCatalogos ? "Cargando catálogo..." : "Buscar categoría/subcategoría"}
      error={errors.categoria}
      generalError={errors.general ?? errorCatalogos ?? undefined}
      submitting={submitting}
      loading={loadingCatalogos}
      submitText={submitting ? "Recategorizando..." : "Aceptar"}
      noOptionsMessage={() => (errorCatalogos ? "Error cargando opciones" : "Sin coincidencias")}
    />
  );
}
