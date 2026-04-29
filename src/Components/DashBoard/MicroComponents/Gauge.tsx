export function Gauge({ value }: { value: number }) {
  const v = Math.max(0, Math.min(1, value));
  const size = 200,
  stroke = 20;
  const R = (size - stroke) / 2;
  const C = Math.PI * R;
  const off = C * (1 - v);
  return (
    <svg width={size} height={size / 2} viewBox={`0 0 ${size} ${size / 2}`} className="gauge-svg">
      <path d={`M ${stroke / 2} ${size / 2} A ${R} ${R} 0 0 1 ${size - stroke / 2} ${size / 2}`} stroke="#374151" strokeWidth={stroke} fill="none"/>
      <path d={`M ${stroke / 2} ${size / 2} A ${R} ${R} 0 0 1 ${size - stroke / 2} ${size / 2}`} stroke="#22c55e" strokeWidth={stroke} fill="none" strokeDasharray={C} strokeDashoffset={off}/>
      <text x="50%" y="70%" textAnchor="middle" className="gauge-txt">
        {(v * 100).toFixed(2)}%
      </text>
    </svg>
  );
}