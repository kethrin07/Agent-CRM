import { leadQuality } from "@/lib/data";

const R = 42;
const C = 2 * Math.PI * R;

export function QualityDonut() {
  const total = leadQuality.reduce((sum, q) => sum + q.count, 0);

  let acc = 0;
  const segments = leadQuality.map((q) => {
    const dash = (q.pct / 100) * C;
    const seg = { dash, offset: -(acc / 100) * C, color: q.color };
    acc += q.pct;
    return seg;
  });

  return (
    <div className="flex flex-wrap items-center gap-5">
      <div className="relative h-[120px] w-[120px] flex-shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            className="stroke-track"
            strokeWidth="14"
          />
          {segments.map((s, i) => (
            <circle
              key={i}
              cx="50"
              cy="50"
              r={R}
              fill="none"
              strokeWidth="14"
              strokeDasharray={`${s.dash} ${C - s.dash}`}
              strokeDashoffset={s.offset}
              style={{ stroke: s.color }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold leading-none">
            {total.toLocaleString()}
          </span>
          <span className="text-[11px] text-muted">calls</span>
        </div>
      </div>

      <div className="flex flex-grow flex-col gap-2.5">
        {leadQuality.map((q) => (
          <div key={q.label} className="flex items-center gap-2.5 text-sm">
            <span
              className="h-2.5 w-2.5 flex-shrink-0 rounded-sm"
              style={{ background: q.color }}
            />
            <span className="flex-grow">{q.label}</span>
            <span className="font-mono text-muted2">
              {q.count.toLocaleString()} · {q.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
