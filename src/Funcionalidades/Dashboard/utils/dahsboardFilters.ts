import type { DateRange, GetAllOpts } from "../../../Models/Commons";
import { escapeOData } from "../../../utils/Commons";
import { getCurrentMonthGraphRange, toUtcDayEnd, toUtcDayStart } from "./dashboardDates";

type BuildDashboardFilterArgs = {
  range: DateRange;
  mode?: "resumen" | "detalle";
  username?: string;
};

export function buildDashboardTicketsFilter({range, mode, username,}: BuildDashboardFilterArgs): GetAllOpts {
  const filters: string[] = [];

  if (mode === "resumen" && username) {
    filters.push(`fields/Correoresolutor eq '${escapeOData(username)}'`);

    const month = getCurrentMonthGraphRange();
    filters.push(`fields/FechaApertura ge '${month.from}'`);
    filters.push(`fields/FechaApertura le '${month.to}'`);

    return { filter: filters.join(" and ") };
  }

  if (range?.from && range?.to && range.from <= range.to) {
    filters.push(`fields/FechaApertura ge '${toUtcDayStart(range.from)}'`);
    filters.push(`fields/FechaApertura le '${toUtcDayEnd(range.to)}'`);
  } else {
    const month = getCurrentMonthGraphRange();
    filters.push(`fields/FechaApertura ge '${month.from}'`);
    filters.push(`fields/FechaApertura le '${month.to}'`);
  }

  return { filter: filters.join(" and ") };
}