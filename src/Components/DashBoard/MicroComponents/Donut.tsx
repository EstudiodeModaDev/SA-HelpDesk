export function Donut({value, size = 160, stroke = 12, ring = "#0ea5e9",}: {
  value: number; 
  size?: number;
  stroke?: number;
  ring?: string;
}) {
  const v = Math.max(0, Math.min(1, value));
  const R = (size - stroke) / 2;
  const C = 2 * Math.PI * R;
  const off = C * (1 - v);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut">
      <circle cx={size / 2} cy={size / 2} r={R} stroke="#1f2937" strokeWidth={stroke} fill="none" />
      <circle cx={size / 2} cy={size / 2} r={R} stroke={ring} strokeWidth={stroke} fill="none" strokeDasharray={C} strokeDashoffset={off} transform={`rotate(-90 ${size / 2} ${size / 2})`}/>
    </svg>
  );
}
