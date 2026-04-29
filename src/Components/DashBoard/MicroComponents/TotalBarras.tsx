import type { TopCategoria } from "../../../Models/Dashboard";

export function TotalBarras({data,}: {data: TopCategoria[]; total: number;}) {
  if (!data?.length) {
    return <div className="hint">Sin datos para el período seleccionado</div>;
  }

  const max = Math.max(...data.map((d) => d.total), 1);

  return (
    <ul className="topcats">
      {data.map((c) => {
        const w = Math.max(4, Math.round((c.total / max) * 100)); // ancho 4–100%
        return (
          <li key={c.nombre} className="topcats-row">
            <div className="topcats-left">
              <span className="topcats-name" title={c.nombre}>{c.nombre.slice(0, 17)}...</span>
            </div>
            <div className="topcats-bar">
              <div className="topcats-fill" style={{ width: `${w}%` }} />
            </div>
            <div className="topcats-right">
              <span className="topcats-count" title={`${c.total} casos`}>
                {c.total.toLocaleString("es-CO")}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}