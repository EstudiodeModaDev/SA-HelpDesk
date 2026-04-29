import type { TopCategoria } from "../../../Models/Dashboard";

function shorten(s: string, max = 5) {
  if (!s) return "";
  return s.length <= max ? s : s.slice(0, max - 1) + "…";
}

export function CategoriasChart({data, maxBars = 18, height = 160,}: {data: TopCategoria[]; maxBars?: number; height?: number;}) {
  const items = (data ?? []).slice(0, maxBars);
  const max = Math.max(...items.map((d) => d.total), 1);

  return (
    <div className="cats">
      <div className="cats__plot" style={{ height }}>
        <div className="cats__bars" role="list">
          {items.map((d) => {
            const h = Math.max(2, Math.round((d.total / max) * (height - 36))); // deja espacio para label superior
            return (
              <div key={d.nombre} className="cats__col" role="listitem">
                <div className="cats__val" aria-hidden="true">
                  {d.total.toLocaleString("es-CO")}
                </div>
                <div className="cats__bar" style={{ height: h }} title={d.nombre}/>
                <div className="cats__lbl" title={d.nombre}>
                  {shorten(d.nombre)}
                </div>
              </div>
            );
          })}
        </div>
        <div className="cats__baseline" />
      </div>
    </div>
  );
}