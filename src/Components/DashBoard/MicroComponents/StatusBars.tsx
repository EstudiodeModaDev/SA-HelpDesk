function formatShort(n: number) {
  if (n >= 1000) {
    const k = Math.round((n / 1000) * 10) / 10; // 1 decimal
    return `${k.toLocaleString("es-CO")} mil`;
  }
  return n.toLocaleString("es-CO");
}

export function StatusBars({total, at, late, inprog,}: {total: number; at: number; late: number; inprog: number;}) {
  const pct = (v: number) => (total > 0 ? Math.max(0, Math.min(100, (v / total) * 100)) : 0);

  const rows = [
    { color: "#10b981", label: "A tiempo", value: at, width: pct(at) },
    { color: "#ef4444", label: "Vencidos", value: late, width: pct(late) },
    { color: "#06b6d4", label: "En curso", value: inprog, width: pct(inprog) },
  ];

  return (
    <ul className="bullets bullets--barred">
      {rows.map((r) => (
        <li key={r.label} className="bullet-row">
          <span className="bullet-dot" style={{ backgroundColor: r.color }} />
          <span className="bullet-label">{r.label}</span>
          <div className="bullet-bar">
            <div className="bullet-fill" style={{ width: `${r.width}%`, backgroundColor: r.color }} />
          </div>
          <span className="bullet-val">{formatShort(r.value)}</span>
        </li>
      ))}
    </ul>
  );
}