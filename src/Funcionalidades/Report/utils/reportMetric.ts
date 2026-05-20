import type { Ticket } from "../../../Models/Tickets";

type ComplianceBucket = {
  total: number;
  closed: number;
  onTime: number;
  late: number;
};

type ComplianceGroup<TKey extends string> = ComplianceBucket &
  Record<TKey, string> & {
    compliancePct: number;
  };

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

  byTecnico: Array<ComplianceGroup<"tecnico">>;
  byCategoria: Array<ComplianceGroup<"categoria">>;
  byProveedor: Array<ComplianceGroup<"proveedor">>;
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
    "cerrado fuera de tiempo",
  ].includes(status);
}

function getCategoria(ticket: Ticket) {
  if (ticket.Categoria && ticket.SubCategoria) {
    return `${ticket.Categoria} > ${ticket.SubCategoria}`;
  }

  return ticket.Categoria ?? "Sin categoria";
}

function safePct(num: number, den: number) {
  if (!den) return 0;
  return Number(((num / den) * 100).toFixed(2));
}

function ensureBucket(map: Map<string, ComplianceBucket>, key: string) {
  if (!map.has(key)) {
    map.set(key, { total: 0, closed: 0, onTime: 0, late: 0 });
  }

  return map.get(key)!;
}

function buildGroupedMetrics<TKey extends string>(
  map: Map<string, ComplianceBucket>,
  keyName: TKey,
  sort: (a: ComplianceGroup<TKey>, b: ComplianceGroup<TKey>) => number
): Array<ComplianceGroup<TKey>> {
  const grouped = [...map.entries()].map(([label, data]) => ({
    [keyName]: label,
    total: data.total,
    closed: data.closed,
    onTime: data.onTime,
    late: data.late,
    compliancePct: safePct(data.onTime, data.closed),
  })) as Array<ComplianceGroup<TKey>>;

  return grouped.sort(sort);
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

  const tecnicoMap = new Map<string, ComplianceBucket>();
  const categoriaMap = new Map<string, ComplianceBucket>();
  const proveedorMap = new Map<string, ComplianceBucket>();

  for (const row of rows) {
    const closedStatus = isClosedStatus(row.Estadodesolicitud);
    const deadline = toDate(row.TiempoSolucion);
    const updatedAt = toDate(row.UltimaActualizacion);

    const tecnico = row.Nombreresolutor?.trim() || "Sin tecnico";
    const categoria = getCategoria(row);
    const proveedor = row.Proveedor?.trim() || "Sin proveedor";

    const tecnicoBucket = ensureBucket(tecnicoMap, tecnico);
    const categoriaBucket = ensureBucket(categoriaMap, categoria);
    const proveedorBucket = ensureBucket(proveedorMap, proveedor);

    tecnicoBucket.total += 1;
    categoriaBucket.total += 1;
    proveedorBucket.total += 1;

    if (closedStatus) {
      closed += 1;
      tecnicoBucket.closed += 1;
      categoriaBucket.closed += 1;
      proveedorBucket.closed += 1;

      if (deadline && updatedAt) {
        if (updatedAt.getTime() <= deadline.getTime()) {
          closedOnTime += 1;
          tecnicoBucket.onTime += 1;
          categoriaBucket.onTime += 1;
          proveedorBucket.onTime += 1;
        } else {
          closedLate += 1;
          tecnicoBucket.late += 1;
          categoriaBucket.late += 1;
          proveedorBucket.late += 1;
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

  return {
    total: rows.length,
    closed,
    open,
    compliancePct: safePct(closedOnTime, closed),
    closedOnTime,
    closedLate,
    closedWithoutDates,
    openOverdue,
    openWithinTime,
    openWithoutDates,
    byTecnico: buildGroupedMetrics(
      tecnicoMap,
      "tecnico",
      (a, b) => b.compliancePct - a.compliancePct
    ),
    byCategoria: buildGroupedMetrics(
      categoriaMap,
      "categoria",
      (a, b) => b.total - a.total
    ),
    byProveedor: buildGroupedMetrics(
      proveedorMap,
      "proveedor",
      (a, b) => b.total - a.total
    ),
  };
}
