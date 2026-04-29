import React from "react";
import { getCurrentMonthRange } from "../utils/dashboardDates";
import type { DateRange } from "../../../Models/Commons";

export function useDashboardRange(initial?: DateRange) {
  const [range, setRange] = React.useState<DateRange>(initial ?? getCurrentMonthRange());

  return {
    range,
    setRange,
  };
}