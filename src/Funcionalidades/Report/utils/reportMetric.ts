import type { Ticket } from "../../../Models/Tickets";

export type ComplianceMetrics = {
  total: number;
  closed: number;
  open: number;
  compliancePct: number;

  closedOnTime: number;
  closedLate: number;
  closedWithoutDates: number;

  openOverdue: number;
  openWithinTime: number;
  openWithoutDates: number;

  byTecnico: Array<{
    tecnico: string;
    total: number;
    closed: number;
    onTime: number;
    late: number;
    compliancePct: number;
  }>;

  byCategoria: Array<{
    categoria: string;
    total: number;
    closed: number;
    onTime: number;
    late: number;
    compliancePct: number;
  }>;
};

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date && !isNaN(value.getTime())) return value;

  const parsed = new Date(value as string);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeText(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

function isClosedStatus(value?: string | null) {
  const status = normalizeText(value);

  return [
    "cerrado",
    "cerrada",
    "closed",
    "solucionado",
    "resuelto",
    "finalizado",
    "completado",
    "cerrado fuera de tiempo"
  ].includes(status);
}

function getCategoria(ticket: Ticket) {
  if (ticket.Categoria && ticket.SubCategoria) {
    return `${ticket.Categoria} > ${ticket.SubCategoria}`;
  }
  return ticket.Categoria ?? "Sin categoría";
}

function safePct(num: number, den: number) {
  if (!den) return 0;
  return Number(((num / den) * 100).toFixed(2));
}

export function calculateComplianceMetrics(rows: Ticket[]): ComplianceMetrics {
  const now = new Date();

  let closed = 0;
  let open = 0;

  let closedOnTime = 0;
  let closedLate = 0;
  let closedWithoutDates = 0;

  let openOverdue = 0;
  let openWithinTime = 0;
  let openWithoutDates = 0;

  const tecnicoMap = new Map<string, { total: number; closed: number; onTime: number; late: number }>();

  const categoriaMap = new Map<string, { total: number; closed: number; onTime: number; late: number }>();

  for (const row of rows) {
    const closedStatus = isClosedStatus(row.Estadodesolicitud?.toLocaleLowerCase());
    const deadline = toDate(row.TiempoSolucion);
    const updatedAt = toDate(row.UltimaActualizacion);

    const tecnico = row.Nombreresolutor?.trim() || "Sin técnico";
    const categoria = getCategoria(row);

    if (!tecnicoMap.has(tecnico)) {
      tecnicoMap.set(tecnico, { total: 0, closed: 0, onTime: 0, late: 0 });
    }

    if (!categoriaMap.has(categoria)) {
      categoriaMap.set(categoria, { total: 0, closed: 0, onTime: 0, late: 0 });
    }

    tecnicoMap.get(tecnico)!.total += 1;
    categoriaMap.get(categoria)!.total += 1;

    if (closedStatus) {
      closed += 1;
      tecnicoMap.get(tecnico)!.closed += 1;
      categoriaMap.get(categoria)!.closed += 1;

      if (deadline && updatedAt) {
        if (updatedAt.getTime() <= deadline.getTime()) {
          closedOnTime += 1;
          tecnicoMap.get(tecnico)!.onTime += 1;
          categoriaMap.get(categoria)!.onTime += 1;
        } else {
          closedLate += 1;
          tecnicoMap.get(tecnico)!.late += 1;
          categoriaMap.get(categoria)!.late += 1;
        }
      } else {
        closedWithoutDates += 1;
      }
    } else {
      open += 1;

      if (!deadline) {
        openWithoutDates += 1;
      } else if (deadline.getTime() < now.getTime()) {
        openOverdue += 1;
      } else {
        openWithinTime += 1;
      }
    }
  }

  const compliancePct = safePct(closedOnTime, closed);

  const byTecnico = [...tecnicoMap.entries()]
    .map(([tecnico, data]) => ({
      tecnico,
      total: data.total,
      closed: data.closed,
      onTime: data.onTime,
      late: data.late,
      compliancePct: safePct(data.onTime, data.closed),
    }))
    .sort((a, b) => b.compliancePct - a.compliancePct);

  const byCategoria = [...categoriaMap.entries()]
    .map(([categoria, data]) => ({
      categoria,
      total: data.total,
      closed: data.closed,
      onTime: data.onTime,
      late: data.late,
      compliancePct: safePct(data.onTime, data.closed),
    }))
    .sort((a, b) => b.total - a.total);

  return {
    total: rows.length,
    closed,
    open,
    compliancePct,

    closedOnTime,
    closedLate,
    closedWithoutDates,

    openOverdue,
    openWithinTime,
    openWithoutDates,

    byTecnico,
    byCategoria,
  };
}