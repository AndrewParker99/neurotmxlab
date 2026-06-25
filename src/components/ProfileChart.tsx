"use client";

interface ProfilePoint {
  label: string;
  code: string;
  scaled: number | null;
}

const ZONES = [
  { label: "Muy baja", from: 1, to: 3, color: "#c9d6ec" },
  { label: "Baja", from: 3, to: 5, color: "#9fb6dd" },
  { label: "Media-baja", from: 5, to: 7, color: "#8fb89a" },
  { label: "Media", from: 7, to: 13, color: "#6fa37e" },
  { label: "Media-alta", from: 13, to: 15, color: "#e8d9a8" },
  { label: "Alta", from: 15, to: 19, color: "#e3c46e" },
];

const MIN = 1;
const MAX = 19;

function pct(value: number) {
  return ((value - MIN) / (MAX - MIN)) * 100;
}

export default function ProfileChart({ points, title }: { points: ProfilePoint[]; title: string }) {
  const valid = points.filter((p) => p.scaled !== null) as { label: string; code: string; scaled: number }[];

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
          <div className="flex text-[10px] text-zinc-500 mb-1" style={{ marginLeft: 0 }}>
            {ZONES.map((z) => (
              <div
                key={z.label}
                style={{ width: `${pct(z.to) - pct(z.from)}%` }}
                className="text-center truncate px-0.5"
              >
                {z.label}
              </div>
            ))}
          </div>

          <div className="relative" style={{ height: points.length * 36 }}>
            <div className="absolute inset-0 flex">
              {ZONES.map((z) => (
                <div
                  key={z.label}
                  style={{ width: `${pct(z.to) - pct(z.from)}%`, backgroundColor: z.color, opacity: 0.35 }}
                  className="h-full"
                />
              ))}
            </div>

            <div
              className="absolute top-0 bottom-0 border-l border-dashed border-zinc-500"
              style={{ left: `${pct(10)}%` }}
            />

            {points.map((p, i) => (
              <div
                key={p.code}
                className="absolute flex items-center"
                style={{ top: i * 36, height: 36, left: 0, right: 0 }}
              >
                {p.scaled !== null && (
                  <div
                    className="w-3 h-3 rounded-full bg-zinc-900 border-2 border-white shadow"
                    style={{ position: "absolute", left: `calc(${pct(p.scaled)}% - 6px)` }}
                    title={`${p.code}: ${p.scaled}`}
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
                    .map((p, i) =>
                      p.scaled !== null ? `${pct(p.scaled)}%,${i * 36 + 18}` : null
                    )
                    .filter(Boolean)
                    .join(" ")}
                />
              </svg>
            )}
          </div>

          <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
            {[1, 3, 5, 7, 10, 13, 15, 19].map((v) => (
              <span key={v} style={{ position: "relative" }}>
                {v}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
