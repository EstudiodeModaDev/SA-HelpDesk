export function SmallDonut({ value }: { value: number }) {
  const v = Math.max(0, Math.min(1, value));
  const size = 68,
  stroke = 5;
  const R = (size - stroke) / 2;
  const C = 2 * Math.PI * R;
  const off = C * (1 - v);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut small">
      <circle cx={size / 2} cy={size / 2} r={R} stroke="#374151" strokeWidth={stroke} fill="none" />
      <circle cx={size / 2} cy={size / 2} r={R} stroke="#ef4444" strokeWidth={stroke} fill="none" strokeDasharray={C} strokeDashoffset={off} transform={`rotate(-90 ${size / 2} ${size / 2})`}/>
      <text x="50%" y="50%" dy="4" textAnchor="middle" className="donut-txt">
        {(v * 100).toFixed(2)}%
      </text>
    </svg>
  );
}