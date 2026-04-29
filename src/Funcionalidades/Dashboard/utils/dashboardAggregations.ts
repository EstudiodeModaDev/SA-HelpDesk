import type { DailyPoint, ResolutorAgg, TopCategoria } from "../../../Models/Dashboard";
import type { Ticket } from "../../../Models/Tickets";
import { toDayKey, toMonthKey } from "./dashboardDates";
import { classifyEstado, getFechaApertura, getTicketEstado, getTicketField, } from "./dashboardMapper";

export type DashboardMetrics = {
  totalCasos: number;
  totalEnCurso: number;
  totalFueraTiempo: number;
  totalFinalizados: number;
  porcentajeCumplimiento: number;
};

//Función que construye las métricas principales del dashboard a partir de la lista de tickets, contando estados y calculando porcentaje de cumplimiento
export function buildMetrics(list: Ticket[]): DashboardMetrics {
  const buckets = { at: 0, late: 0, inprog: 0, otros: 0 };

  for (const t of list as any[]) {
    const cls = classifyEstado(getTicketEstado(t));
    if (cls.isAt) buckets.at++;
    else if (cls.isLate) buckets.late++;
    else if (cls.isProg) buckets.inprog++;
    else buckets.otros++;
  }

  const total = list.length;

  return {
    totalCasos: total,
    totalEnCurso: buckets.inprog,
    totalFueraTiempo: buckets.late,
    totalFinalizados: buckets.at,
    porcentajeCumplimiento: total ? buckets.at / total : 0,
  };
}

export function countBy(list: Ticket[], keySelector: (t: Ticket) => string): TopCategoria[] {
  const map = new Map<string, number>();

  for (const item of list) {
    const key = keySelector(item) || "(En blanco)";
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  return Array.from(map, ([nombre, total]) => ({ nombre, total }))
    .sort((a, b) => b.total - a.total);
}

export function buildTopCategorias(list: Ticket[], top = 5): TopCategoria[] {
  return countBy(list, (t: any) => getTicketField(t, "SubCategoria")).slice(0, top);
}

export function buildAllCategorias(list: Ticket[]): TopCategoria[] {
  return countBy(list, (t: any) => getTicketField(t, "SubCategoria"));
}

export function buildTopSolicitantes(list: Ticket[], top = 5): TopCategoria[] {
  return countBy(list, (t: any) => getTicketField(t, "Solicitante")).slice(0, top);
}
export function buildCasosPorDia(list: Ticket[]): DailyPoint[] {
  const map = new Map<string, number>();

  for (const t of list as any[]) {
    const fecha = getFechaApertura(t);
    const key = toDayKey(fecha || new Date());
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  return Array.from(map, ([fecha, total]) => ({ fecha, total }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export function buildConteoPorMes(list: Ticket[]): Array<{ mes: string; total: number }> {
  const map = new Map<string, number>();

  for (const t of list as any[]) {
    const fecha = getFechaApertura(t);
    const key = toMonthKey(fecha || new Date());
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  return Array.from(map, ([mes, total]) => ({ mes, total }))
    .sort((a, b) => a.mes.localeCompare(b.mes));
}

export function buildResolutores(list: Ticket[]): ResolutorAgg[] {
  const byRes = new Map<
    string,
    { nombre: string; email: string; total: number; at: number; vencidos: number; enCurso: number }
  >();

  const getResolvers = (t: any): Array<{ email: string; name: string }> => {
    const out: Array<{ email: string; name: string }> = [];
    const direct = t?.CorreoResolutor ?? t?.Correoresolutor ?? "";
    const nombreResolutor = t?.Nombreresolutor ?? "";

    if (direct) {
      const parts = String(direct).split(/[;,]/).map((s) => s.trim()).filter(Boolean);

      for (const p of parts) {
        const m = p.match(/<?([\w.+-]+@[\w.-]+\.\w+)>?/);
        const email = (m ? m[1] : "").toLowerCase();
        const name =
          nombreResolutor ||
          p.replace(/<.*?>/, "").trim() ||
          (email ? email.split("@")[0] : "") ||
          "(En blanco)";

        out.push({ email, name });
      }
    }

    if (!out.length) {
      out.push({ email: "", name: nombreResolutor || "(En blanco)" });
    }

    const seen = new Set<string>();
    return out.filter((r) => {
      const key = r.email || r.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  for (const t of list as any[]) {
    const cls = classifyEstado(getTicketEstado(t));

    for (const r of getResolvers(t)) {
      const key = r.email || r.name.toLowerCase();

      const rec = byRes.get(key) ?? {
        nombre: r.name,
        email: r.email,
        total: 0,
        at: 0,
        vencidos: 0,
        enCurso: 0,
      };

      rec.total++;
      if (cls.isAt) rec.at++;
      if (cls.isLate) rec.vencidos++;
      if (cls.isProg) rec.enCurso++;

      byRes.set(key, rec);
    }
  }

  return Array.from(byRes.values())
    .map((v) => ({
      correo: v.email,
      nombre: v.nombre,
      total: v.total,
      at: v.at,
      vencidos: v.vencidos,
      enCurso: v.enCurso,
      porcentaje: v.total ? v.at / v.total : 0,
    }))
    .sort((a, b) => b.total - a.total);
}