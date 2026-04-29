import * as React from "react";
import type { RelacionadorState, SortDir, SortField, Ticket, ticketOption } from "../../../../Models/Tickets";
import { toISODateFlex } from "../../../../utils/Date";
import type { DateRange, } from "../../../../Models/Commons";
import { buildTicketsFilter } from "../shared/useTicketFilters";
import { useAuth } from "../../../../Auth/authContext";
import { useGraphServices } from "../../../../graph/GrapServicesContext";
import { relateTickets } from "../../utils/ticketRelation";
import { useFiles } from "../../../Commons/hooks/useFiles";
import { buildTicketsReportFilter } from "../../utils/ticketsFilters";
import { usePermissions } from "../../../usePermissions";

export function useTickets() {
  const auth = useAuth()
  const graph = useGraphServices();
  const files = useFiles()
  const {engine} = usePermissions()
  const viewAll = engine.can("tickets.view.all")
  const [rows, setRows] = React.useState<Ticket[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [filterMode, setFilterMode] = React.useState<string>("En curso");

  const today = React.useMemo(() => toISODateFlex(new Date()), []);
  const [range, setRange] = React.useState<DateRange>({ from: today, to: today });
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [pageIndex, setPageIndex] = React.useState<number>(1);
  const [nextLink, setNextLink] = React.useState<string | null>(null);
  const [sorts, setSorts] = React.useState<Array<{ field: SortField; dir: SortDir }>>([{ field: "id", dir: "desc" },]);

  const [state, setState] = React.useState<RelacionadorState>({TicketRelacionar: null,});

  const [ticketsAbiertos, setTicketsAbiertos] = React.useState<number>(0);
  const [ticketsFueraTiempo, setTicketsFueraTiempo] = React.useState<number>(0);
  const [espacio, setEspacio] = React.useState<string>("");

  const setField = <K extends keyof RelacionadorState>(k: K, v: RelacionadorState[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  const buildFilter = React.useCallback(() => {
    return buildTicketsFilter({
      view: viewAll,
      userMail: auth.account?.username!,
      filterMode,
      range,
      pageSize,
      sorts,
      espacio,
      servicio: graph.tiendasZonas,
    });
  }, [auth.account?.username, espacio, filterMode, graph.tiendasZonas, pageSize, range, sorts, viewAll]);

  const toTicketOptions = React.useCallback(
    async (opts?: {
      includeIdInLabel?: boolean;
      fallbackIfEmptyTitle?: string;
      idPrefix?: string;
    }): Promise<ticketOption[]> => {
      const {includeIdInLabel = true, fallbackIfEmptyTitle = "(Sin título)", idPrefix = "#",} = opts ?? {};

      const seen = new Set<string>();
      const { items } = await graph.Tickets.getAll({ orderby: "id desc" });

      return items
        .filter((t: any) => t && t.ID != null)
        .map((t: any): ticketOption => {
          const id = String(t.ID);
          const title = (t.Title ?? "").trim() || fallbackIfEmptyTitle;
          const label = includeIdInLabel ? `${title} — ID: ${idPrefix}${id}` : title;
          return { value: id, label };
        })
        .filter((opt) => {
          if (seen.has(opt.value)) return false;
          seen.add(opt.value);
          return true;
        });
    },
    []
  );

  const loadFirstPage = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filter = await buildFilter();
      const { items, nextLink } = await graph.Tickets.getAll(filter);
      setRows(items);
      setNextLink(nextLink ?? null);
      setPageIndex(1);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando tickets");
      setRows([]);
      setNextLink(null);
      setPageIndex(1);
    } finally {
      setLoading(false);
    }
  }, [buildFilter, graph.Tickets]);

  const allTickets = React.useCallback(async (filter: string): Promise<Ticket[]> => {
    setLoading(true);
    setError(null);

    try {
      let nextPage: string | null = null;
      const foundedTickets: Ticket[] = [];
      const { items, nextLink } = await graph.Tickets.getAll({filter});
      if(items?.length) foundedTickets.push(...items);
      nextPage = nextLink ?? null;
      while (nextPage) {
        const { items: newItems, nextLink: n2 } = await graph.Tickets.getByNextLink(nextPage);
        if(newItems?.length) foundedTickets.push(...newItems);
        nextPage = n2 ?? null;
      }
      return foundedTickets;
    } catch (e: any) {
      setError(e?.message ?? "Error cargando tickets");
      return [];
    } finally {
      setLoading(false);
    }
  }, [buildFilter]);

  const loadCantidadResolutor = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { items: itemsAbiertos } = await graph.Tickets.getAll({
        filter: `(fields/CorreoSolicitante eq '${auth.account?.username}' or fields/CorreoObservador eq '${auth.account?.username}' or fields/Correoresolutor eq '${auth.account?.username}') and fields/Estadodesolicitud eq 'En Atención'`,
      });

      const { items: itemsFueraTiempo } = await graph.Tickets.getAll({
        filter: `(fields/CorreoSolicitante eq '${auth.account?.username}' or fields/CorreoObservador eq '${auth.account?.username}' or fields/Correoresolutor eq '${auth.account?.username}') and fields/Estadodesolicitud eq 'Fuera de tiempo'`,
      });

      setTicketsAbiertos(itemsAbiertos.length);
      setTicketsFueraTiempo(itemsFueraTiempo.length);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando tickets");
      setRows([]);
      setNextLink(null);
      setPageIndex(1);
    } finally {
      setLoading(false);
    }
  }, [graph.Tickets, auth.account?.username]);

  React.useEffect(() => {
    loadFirstPage();
    loadCantidadResolutor();
  }, [loadFirstPage, loadCantidadResolutor]);

  const updateSelectedTicket = React.useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        return await graph.Tickets.get(id);
      } catch (e: any) {
        setError(e?.message ?? "Error cargando ticket");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [graph.Tickets]
  );

  const handleConfirm = React.useCallback(
    async (actualId: string | number, relatedId: string | number, type: "padre" | "hijo") => {
      setLoading(true);
      setError(null);

      try {
        const res = await relateTickets(graph.Tickets, actualId, relatedId, type);
        if (!res.ok) setError(res.message ?? "Error actualizando relación del ticket");
        return { ok: res.ok };
      } catch (e: any) {
        setError(e?.message ?? "Error actualizando relación del ticket");
        return { ok: false };
      } finally {
        setLoading(false);
      }
    },
    [graph.Tickets]
  );

  const hasNext = !!nextLink;

  const nextPage = React.useCallback(async () => {
    if (!nextLink) return;

    setLoading(true);
    setError(null);

    try {
      const { items, nextLink: n2 } = await graph.Tickets.getByNextLink(nextLink);
      setRows(items);
      setNextLink(n2 ?? null);
      setPageIndex((i) => i + 1);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando más tickets");
    } finally {
      setLoading(false);
    }
  }, [nextLink, graph.Tickets]);

  const applyRange = React.useCallback(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const toggleSort = React.useCallback((field: SortField, additive = false) => {
    setSorts((prev) => {
      const idx = prev.findIndex((s) => s.field === field);

      if (!additive) {
        if (idx >= 0) {
          const dir: SortDir = prev[idx].dir === "desc" ? "asc" : "desc";
          return [{ field, dir }];
        }
        return [{ field, dir: "asc" }];
      }

      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { field, dir: copy[idx].dir === "desc" ? "asc" : "desc" };
        return copy;
      }

      return [...prev, { field, dir: "asc" }];
    });
  }, []);

  const loadToReport = React.useCallback(async (from: string, to: string,): Promise<Ticket[]> => {
      setLoading(true);

      try {
        const { items, } = await graph.Tickets.getAll( buildTicketsReportFilter(from, to,));
        return items
      } catch (e: any) {
        return []
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const addObservador = React.useCallback(async (ticketId: string, correo: string, nombre: string) => {
    setLoading(true);
    setError(null);
    try{
      await graph.Tickets.update(ticketId, {
        CorreoObservador: correo,
        Observador: nombre,
      })
    } catch(e: any) {
      setError(e?.message ?? "Error asignando observador");
    } finally {
      setLoading(false);
    }
  }, [])

  const addProveedor = React.useCallback(async (ticketId: string, proveedorName: string) => {
    setLoading(true);
    setError(null);
    try{
      await graph.Tickets.update(ticketId, {Proveedor: proveedorName})
    } catch(e: any) {
      setError(e?.message ?? "Error asignando el proveedor");
    } finally {
      setLoading(false);
    }
  }, [])

  return {
    rows,
    ticketsAbiertos,
    ticketsFueraTiempo,
    loading,
    error,
    pageSize,
    pageIndex,
    hasNext,
    filterMode,
    sorts,
    range,
    state,
    espacio,

    nextPage,
    setPageSize,
    setFilterMode,
    setRange,
    applyRange,
    loadFirstPage,
    toggleSort,
    setField,
    setState,
    toTicketOptions,
    handleConfirm,
    updateSelectedTicket,
    allTickets,
    loadToReport,
    addObservador,
    ...files,
    addProveedor,
    setEspacio
  };
}
