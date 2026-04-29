import { useDashboardRange } from "./useDashboardRange";
import { useDashboardData } from "./useDashboardData";
import type { TicketsService } from "../../../services/Tickets.service";

export function useDashboardDetallado(TicketsSvc: TicketsService) {
  const { range, setRange } = useDashboardRange();

  const data = useDashboardData({
    TicketsSvc,
    range,
    mode: "detalle",
  });

  return {
    range,
    setRange,
    ...data,
  };
}