import { useDashboardRange } from "./useDashboardRange";
import { useDashboardData } from "./useDashboardData";
import type { TicketsService } from "../../../services/Tickets.service";
import { useAuth } from "../../../Auth/authContext";


/**
 * Compone el rango de fechas y la consulta agregada del tablero resumen.
 */
export function useDashboard(TicketsSvc: TicketsService) {
  const { account } = useAuth();
  const { range, setRange } = useDashboardRange();

  const data = useDashboardData({TicketsSvc, range, mode: "resumen", username: account?.username,});

  return {
    range,
    setRange,
    ...data,
  };
}
