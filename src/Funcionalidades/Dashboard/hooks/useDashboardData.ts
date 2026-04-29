import React from "react";
import type { TicketsService } from "../../../services/Tickets.service";
import type { DateRange } from "../../../Models/Commons";
import type { Ticket } from "../../../Models/Tickets";
import type { DailyPoint, ResolutorAgg, TopCategoria } from "../../../Models/Dashboard";
import { buildDashboardTicketsFilter } from "../utils/dahsboardFilters";
import { useTickets } from "../../Tickets/hooks/Queries/useTickets";
import { buildAllCategorias, buildCasosPorDia, buildConteoPorMes, buildMetrics, buildResolutores, buildTopCategorias, buildTopSolicitantes } from "../utils/dashboardAggregations";

type Params = {
  TicketsSvc: TicketsService;
  range: DateRange;
  mode?: "resumen" | "detalle";
  username?: string;
};

export function useDashboardData({ TicketsSvc, range, mode = "detalle", username }: Params) {
  const ticketsController = useTickets()

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [metrics, setMetrics] = React.useState({
    totalCasos: 0,
    totalEnCurso: 0,
    totalFueraTiempo: 0,
    totalFinalizados: 0,
    porcentajeCumplimiento: 0,
  });

  const [topCategorias, setTopCategorias] = React.useState<TopCategoria[]>([]);
  const [totalCategorias, setTotalCategorias] = React.useState<TopCategoria[]>([]);
  const [topSolicitante, setTopSolicitante] = React.useState<any[]>([]);
  const [resolutores, setResolutores] = React.useState<ResolutorAgg[]>([]);
  const [casosPorDia, setCasosPorDia] = React.useState<DailyPoint[]>([]);
  const [conteoPorMes, setConteoPorMes] = React.useState<any[]>([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { filter } = buildDashboardTicketsFilter({ range, mode, username });
      if(!filter) return
      const list = await ticketsController.allTickets(filter);

      setTickets(list);
      setMetrics(buildMetrics(list));
      setTopCategorias(buildTopCategorias(list));
      setTotalCategorias(buildAllCategorias(list));
      setTopSolicitante(buildTopSolicitantes(list));
      setResolutores(buildResolutores(list));
      setCasosPorDia(buildCasosPorDia(list));
      setConteoPorMes(buildConteoPorMes(list));
    } catch (e: any) {
      setError(e?.message ?? "Error cargando dashboard");
    } finally {
      setLoading(false);
    }
  }, [TicketsSvc, range, mode, username]);

  return {
    load,
    loading,
    error,
    tickets,
    ...metrics,
    topCategorias,
    totalCategorias,
    topSolicitante,
    resolutores,
    casosPorDia,
    conteoPorMes,
  };
}