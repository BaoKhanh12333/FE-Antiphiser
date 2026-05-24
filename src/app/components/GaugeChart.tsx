import { useId, useEffect, useState } from "react";

interface GaugeChartProps {
  value: number; // 0-100
  size?: number;
}

function getColor(value: number) {
  if (value >= 75) return "#10B981";
  if (value >= 45) return "#F59E0B";
  return "#EF4444";
}

function getLabel(value: number) {
  if (value >= 75) return "Đáng tin cậy";
  if (value >= 45) return "Cần cải thiện";
  return "Nguy hiểm";
}

export function GaugeChart({ value, size = 200 }: GaugeChartProps) {
  const uid = useId().replace(/:/g, "");
  const [percent, setPercent] = useState(0); // Dùng để chạy hiệu ứng từ 0 -> value

  const color = getColor(value);
  const label = getLabel(value);

  // Khôi phục logic hình học chuẩn của bạn
  const padding = 14; 
  const outerR = (size - padding * 2) / 2;
  const innerR = outerR * 0.62;
  const midR = (outerR + innerR) / 2;
  const thickness = outerR - innerR;
  const circumference = Math.PI * midR;

  const cx = size / 2;
  const cy = size / 2 + (size * 0.12);

  useEffect(() => {
    const timer = setTimeout(() => setPercent(value), 150);
    return () => clearTimeout(timer);
  }, [value]);

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const polarToXY = (angle: number, r: number) => ({
    x: cx + r * Math.cos(toRad(angle)),
    y: cy - r * Math.sin(toRad(angle)),
  });

  const bgStart = polarToXY(180, midR);
  const bgEnd = polarToXY(0, midR);
  const bgPath = `M ${bgStart.x} ${bgStart.y} A ${midR} ${midR} 0 0 1 ${bgEnd.x} ${bgEnd.y}`;

  // Tính toán vị trí kim dựa trên percent đang chạy
  const endAngle = 180 - (percent / 100) * 180;
  const needleAngleRad = toRad(endAngle);
  const tipX = cx + (midR - 8) * Math.cos(needleAngleRad);
  const tipY = cy - (midR - 8) * Math.sin(needleAngleRad);
  const perpAngle = needleAngleRad + Math.PI / 2;

  const base1X = cx + 4 * Math.cos(perpAngle);
  const base1Y = cy - 4 * Math.sin(perpAngle);
  const base2X = cx - 4 * Math.cos(perpAngle);
  const base2Y = cy + 4 * Math.sin(perpAngle);

  // Khôi phục đầy đủ các ID cho filter
  const glowId = `glow-${uid}`;
  const needleGlowId = `nglow-${uid}`;
  const gradId = `grad-${uid}`;
  const outerGlowId = `oglow-${uid}`;

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="relative flex items-center justify-center overflow-visible" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          <defs>
            {/* Khôi phục nguyên vẹn các bộ lọc phức tạp của bạn */}
            <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur1" />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id={needleGlowId} x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="40%" stopColor="#6366F1" />
              <stop offset="75%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <radialGradient id={outerGlowId}>
              <stop offset="0%" stopColor={color} stopOpacity="0.12" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Ambient glow - Giữ nguyên logic thiết kế ban đầu */}
          <circle cx={cx} cy={cy} r={outerR + 12} fill={`url(#${outerGlowId})`} />

          {/* Background track */}
          <path d={bgPath} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={thickness} strokeLinecap="round" />

          {/* Progress Arc với Stroke Animation */}
          <path
            d={bgPath}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={thickness}
            strokeLinecap="round"
            filter={`url(#${glowId})`}
            style={{
              strokeDasharray: `${(percent / 100) * circumference} ${circumference}`,
              transition: "stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
              opacity: 0.8
            }}
          />

          {/* Ticks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = 180 - (tick / 100) * 180;
            const s = polarToXY(angle, outerR + 4);
            const e = polarToXY(angle, outerR + 10);
            return (
              <line key={tick} x1={s.x} y1={s.y} x2={e.x} y2={e.y} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
            );
          })}

          
        

          {/* Text Position - Đã căn chỉnh để không đè lên kim ở góc 90 độ */}
          <text
            x={cx} y={cy - 10}
            textAnchor="middle" fill={color}
            style={{ fontSize: size * 0.18, fontWeight: 800, fontFamily: "'Inter', sans-serif" }}
          >
            {value}
          </text>
          <text
            x={cx} y={cy + 5}
            textAnchor="middle" fill="#A5B4FC" opacity={1}
            style={{ fontSize: size * 0.075, fontWeight: 600 }}
          >
            / 100
          </text>
        </svg>
      </div>

      {/* Label dưới biểu đồ */}
      <div className="flex items-center justify-center gap-2 mt-[-5px]">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
        <span style={{ color, fontWeight: 700, fontSize: "0.95rem" }}>{label}</span>
      </div>
    </div>
  );
}