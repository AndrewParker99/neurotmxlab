"use client";

interface IndexPoint {
  label: string;
  code: string;
  standard: number | null;
}

const ZONES = [
  { label: "Muy Baja", from: 50, to: 70, color: "#c9d6ec" },
  { label: "Baja", from: 70, to: 80, color: "#9fb6dd" },
  { label: "Media-baja", from: 80, to: 90, color: "#8fb89a" },
  { label: "Media", from: 90, to: 110, color: "#6fa37e" },
  { label: "Media-alta", from: 110, to: 120, color: "#e8d9a8" },
  { label: "Alta", from: 120, to: 130, color: "#e3c46e" },
  { label: "Muy alta", from: 130, to: 150, color: "#cf9f4a" },
];

const MIN = 50;
const MAX = 150;

function pct(value: number) {
  return ((value - MIN) / (MAX - MIN)) * 100;
}

export default function IndicesChart({ points, title }: { points: IndexPoint[]; title: string }) {
  const valid = points.filter((p) => p.standard !== null) as { label: string; code: string; standard: number }[];

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-zinc-700 mb-2">{title}</h3>
      <div className="flex">
        <div className="flex flex-col justify-between pr-3 pt-6" style={{ width: 160 }}>
          {points.map((p) => (
            <div key={p.code} className="h-9 flex items-center text-sm text-zinc-700">
              <span className="font-medium">{p.code}</span>
              <span className="ml-1 text-zinc-400 text-xs">{p.label}</span>
            </div>
          ))}
        </div>

        <div className="relative flex-1">
          <div className="flex text-[9px] text-zinc-500 mb-1">
            {ZONES.map((z) => (
              <div key={z.label} style={{ width: `${pct(z.to) - pct(z.from)}%` }} className="text-center truncate px-0.5">
                {z.label}
              </div>
            ))}
          </div>

          <div className="relative" style={{ height: points.length * 36 }}>
            <div className="absolute inset-0 flex">
              {ZONES.map((z) => (
                <div key={z.label} style={{ width: `${pct(z.to) - pct(z.from)}%`, backgroundColor: z.color, opacity: 0.35 }} className="h-full" />
              ))}
            </div>

            <div className="absolute top-0 bottom-0 border-l border-dashed border-zinc-500" style={{ left: `${pct(100)}%` }} />

            {points.map((p, i) => (
              <div key={p.code} className="absolute flex items-center" style={{ top: i * 36, height: 36, left: 0, right: 0 }}>
                {p.standard !== null && (
                  <div
                    className="w-3 h-3 rounded-full bg-zinc-900 border-2 border-white shadow"
                    style={{ position: "absolute", left: `calc(${pct(p.standard)}% - 6px)` }}
                    title={`${p.code}: ${p.standard}`}
                  />
                )}
              </div>
            ))}

            {valid.length > 1 && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <polyline
                  fill="none"
                  stroke="#18181b"
                  strokeWidth={1.5}
                  points={points
                    .map((p, i) => (p.standard !== null ? `${pct(p.standard)}%,${i * 36 + 18}` : null))
                    .filter(Boolean)
                    .join(" ")}
                />
              </svg>
            )}
          </div>

          <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
            {[50, 70, 80, 90, 100, 110, 120, 130, 150].map((v) => (
              <span key={v}>{v}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
