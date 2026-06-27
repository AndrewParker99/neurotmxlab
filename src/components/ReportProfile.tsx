"use client";

import { forwardRef } from "react";
import type { VisualCategory } from "@/lib/norms";
import { VISUAL_CATEGORY_LABELS } from "@/lib/norms";

export interface SkillRow {
  code: string;
  label: string;
  category: VisualCategory;
  pd: number | null;
  pe: number | null;
  interpretation: string;
}

export interface DomainRow {
  code: string;
  label: string;
  spe: number | null;
  pt: number | null;
  interpretation: string;
}

interface ReportProfileProps {
  patientName: string;
  professional: string;
  ageLabel: string;
  groupLabel: string;
  dateLabel: string;
  skills: SkillRow[];
  domains: DomainRow[];
}

const ROW_H = 32;

const SKILL_ZONES = [
  { label: "Muy Baja", from: 1, to: 3, color: "#c9d6ec" },
  { label: "Baja", from: 3, to: 5, color: "#9fb6dd" },
  { label: "Media-baja", from: 5, to: 7, color: "#8fb89a" },
  { label: "Media", from: 7, to: 13, color: "#6fa37e" },
  { label: "Media-alta", from: 13, to: 15, color: "#e8d9a8" },
  { label: "Alta", from: 15, to: 19, color: "#e3c46e" },
];

const DOMAIN_ZONES = [
  { label: "Muy Baja", from: 50, to: 70, color: "#c9d6ec" },
  { label: "Baja", from: 70, to: 80, color: "#9fb6dd" },
  { label: "Media-baja", from: 80, to: 90, color: "#8fb89a" },
  { label: "Media", from: 90, to: 110, color: "#6fa37e" },
  { label: "Media-alta", from: 110, to: 120, color: "#e8d9a8" },
  { label: "Alta", from: 120, to: 130, color: "#e3c46e" },
  { label: "Muy alta", from: 130, to: 150, color: "#cf9f4a" },
];

const SKILL_MIN = 1;
const SKILL_MAX = 19;
const DOMAIN_MIN = 50;
const DOMAIN_MAX = 150;

const SKILL_TICKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
const DOMAIN_TICKS = [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150];

function pctFor(min: number, max: number, value: number) {
  return ((value - min) / (max - min)) * 100;
}

const CATEGORY_ORDER: VisualCategory[] = ["CON", "SOC", "PRA"];

function CategoryRail({ counts }: { counts: { category: VisualCategory; count: number }[] }) {
  return (
    <div className="flex flex-col" style={{ width: 22 }}>
      {counts.map(({ category, count }) => (
        <div
          key={category}
          className="flex items-center justify-center text-[10px] font-semibold text-zinc-600 border-r border-zinc-200"
          style={{ height: count * ROW_H }}
        >
          <span
            className="whitespace-nowrap"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            {VISUAL_CATEGORY_LABELS[category]}
          </span>
        </div>
      ))}
    </div>
  );
}

const ReportProfile = forwardRef<HTMLDivElement, ReportProfileProps>(function ReportProfile(
  { patientName, professional, ageLabel, groupLabel, dateLabel, skills, domains },
  ref
) {
  const orderedSkills = CATEGORY_ORDER.flatMap((cat) => skills.filter((s) => s.category === cat));
  const railCounts = CATEGORY_ORDER.map((category) => ({
    category,
    count: orderedSkills.filter((s) => s.category === category).length,
  })).filter((c) => c.count > 0);

  return (
    <div ref={ref} className="bg-white text-zinc-900" style={{ fontFamily: "Arial, sans-serif" }}>
      <div className="border border-zinc-300 rounded-md overflow-hidden mb-4">
        <div className="flex">
          <div className="bg-sky-100 flex items-center justify-center px-2 border-r border-zinc-300">
            <span
              className="text-xs font-semibold text-zinc-700 whitespace-nowrap"
              style={{ writingMode: "vertical-rl" }}
            >
              Perfil
            </span>
          </div>
          <div className="bg-sky-50 flex items-center justify-center px-4 py-2 border-r border-zinc-300" style={{ width: 100 }}>
            <div className="text-center">
              <div className="text-[9px] font-bold text-sky-800 leading-tight">ABAS-3</div>
              <div className="text-[7px] text-zinc-500 leading-tight mt-0.5">Sistema de Evaluación<br />de la Conducta Adaptativa</div>
            </div>
          </div>
          <div className="flex-1 bg-sky-50">
            <div className="grid grid-cols-4 text-sm">
              <div className="px-3 py-1.5 border-b border-r border-zinc-300 col-span-2">
                <span className="font-semibold">Nombre: </span>
                {patientName || "—"}
              </div>
              <div className="px-3 py-1.5 border-b border-r border-zinc-300">
                <span className="font-semibold">Edad: </span>
                {ageLabel}
              </div>
              <div className="px-3 py-1.5 border-b border-zinc-300">
                <span className="font-semibold">Grupo: </span>
                {groupLabel}
                <span className="ml-3 font-semibold">Fecha: </span>
                {dateLabel}
              </div>
              <div className="px-3 py-1.5 col-span-4">
                <span className="font-semibold">Profesional: </span>
                {professional || "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-sky-100 text-center text-sm font-semibold text-zinc-700 py-1.5 border border-zinc-300 rounded-t-md">
        Perfil Cuantitativo
      </div>

      <div className="border border-t-0 border-zinc-300 rounded-b-md mb-6 overflow-hidden">
        <div className="flex border-b border-zinc-200 bg-zinc-50 text-[11px] font-semibold text-zinc-600">
          <div style={{ width: 22 }} />
          <div style={{ width: 190 }} className="px-2 py-1.5">Habilidad</div>
          <div style={{ width: 40 }} className="px-1 py-1.5 text-center">PD</div>
          <div style={{ width: 36 }} className="px-1 py-1.5 text-center">PE</div>
          <div style={{ width: 110 }} className="px-1 py-1.5">Intepretación</div>
          <div className="flex-1 flex">
            {SKILL_TICKS.map((t) => (
              <div key={t} className="flex-1 text-center text-[9px] py-1.5">
                {String(t).padStart(2, "0")}
              </div>
            ))}
          </div>
        </div>

        <div className="flex">
          <CategoryRail counts={railCounts} />
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-0 flex pointer-events-none">
                <div style={{ width: 190 }} />
                <div style={{ width: 40 }} />
                <div style={{ width: 36 }} />
                <div style={{ width: 110 }} />
                <div className="relative flex-1">
                  <div className="absolute inset-0 flex">
                    {SKILL_ZONES.map((z) => (
                      <div
                        key={z.label}
                        style={{ width: `${pctFor(SKILL_MIN, SKILL_MAX, z.to) - pctFor(SKILL_MIN, SKILL_MAX, z.from)}%`, backgroundColor: z.color, opacity: 0.55 }}
                      />
                    ))}
                  </div>
                  <div
                    className="absolute top-0 bottom-0 border-l border-dashed border-zinc-500"
                    style={{ left: `${pctFor(SKILL_MIN, SKILL_MAX, 10)}%` }}
                  />
                </div>
              </div>

              {orderedSkills.map((s) => (
                <div key={s.code} className="flex items-center text-xs border-b border-zinc-100 last:border-b-0" style={{ height: ROW_H }}>
                  <div style={{ width: 190 }} className="px-2 flex items-center gap-1.5 truncate">
                    <span className="font-semibold text-zinc-700">{s.code}</span>
                    <span className="text-zinc-600 truncate">{s.label}</span>
                  </div>
                  <div style={{ width: 40 }} className="text-center">{s.pd ?? "—"}</div>
                  <div style={{ width: 36 }} className="text-center">{s.pe ?? (s.pd === null ? "—" : "N/A")}</div>
                  <div style={{ width: 110 }} className="px-1 text-[11px]">{s.interpretation}</div>
                  <div className="relative flex-1" style={{ height: ROW_H }}>
                    {s.pe !== null && (
                      <div
                        className="absolute rounded-full bg-zinc-900 border-2 border-white shadow"
                        style={{ width: 10, height: 10, top: ROW_H / 2 - 5, left: `calc(${pctFor(SKILL_MIN, SKILL_MAX, s.pe)}% - 5px)` }}
                      />
                    )}
                  </div>
                </div>
              ))}

              <div className="absolute inset-0 flex pointer-events-none">
                <div style={{ width: 190 }} />
                <div style={{ width: 40 }} />
                <div style={{ width: 36 }} />
                <div style={{ width: 110 }} />
                <svg
                  className="flex-1"
                  style={{ height: orderedSkills.length * ROW_H }}
                  preserveAspectRatio="none"
                  viewBox={`0 0 100 ${orderedSkills.length * ROW_H}`}
                >
                  <polyline
                    fill="none"
                    stroke="#18181b"
                    vectorEffect="non-scaling-stroke"
                    points={orderedSkills
                      .map((s, i) => (s.pe !== null ? `${pctFor(SKILL_MIN, SKILL_MAX, s.pe)},${i * ROW_H + ROW_H / 2}` : null))
                      .filter(Boolean)
                      .join(" ")}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-sky-100 text-center text-sm font-semibold text-zinc-700 py-1.5 border border-zinc-300 rounded-t-md">
        Índices Compuestos
      </div>
      <div className="border border-t-0 border-zinc-300 rounded-b-md overflow-hidden">
        <div className="flex border-b border-zinc-200 bg-zinc-50 text-[11px] font-semibold text-zinc-600">
          <div style={{ width: 190 }} className="px-2 py-1.5">Dominio</div>
          <div style={{ width: 40 }} className="px-1 py-1.5 text-center">SPE</div>
          <div style={{ width: 36 }} className="px-1 py-1.5 text-center">PT</div>
          <div style={{ width: 110 }} className="px-1 py-1.5">Intepretación</div>
          <div className="flex-1 flex">
            {DOMAIN_TICKS.map((t) => (
              <div key={t} className="flex-1 text-center text-[9px] py-1.5">{t}</div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex pointer-events-none">
            <div style={{ width: 190 }} />
            <div style={{ width: 40 }} />
            <div style={{ width: 36 }} />
            <div style={{ width: 110 }} />
            <div className="relative flex-1">
              <div className="absolute inset-0 flex">
                {DOMAIN_ZONES.map((z) => (
                  <div
                    key={z.label}
                    style={{ width: `${pctFor(DOMAIN_MIN, DOMAIN_MAX, z.to) - pctFor(DOMAIN_MIN, DOMAIN_MAX, z.from)}%`, backgroundColor: z.color, opacity: 0.55 }}
                  />
                ))}
              </div>
              <div
                className="absolute top-0 bottom-0 border-l border-dashed border-zinc-500"
                style={{ left: `${pctFor(DOMAIN_MIN, DOMAIN_MAX, 100)}%` }}
              />
            </div>
          </div>

          {domains.map((d) => (
            <div key={d.code} className="flex items-center text-xs border-b border-zinc-100 last:border-b-0" style={{ height: ROW_H }}>
              <div style={{ width: 190 }} className="px-2 flex items-center gap-1.5 truncate">
                <span className="font-semibold text-zinc-700">{d.code}</span>
                <span className="text-zinc-600 truncate">{d.label}</span>
              </div>
              <div style={{ width: 40 }} className="text-center">{d.spe ?? "—"}</div>
              <div style={{ width: 36 }} className="text-center">{d.pt ?? "—"}</div>
              <div style={{ width: 110 }} className="px-1 text-[11px]">{d.interpretation}</div>
              <div className="relative flex-1" style={{ height: ROW_H }}>
                {d.pt !== null && (
                  <div
                    className="absolute rounded-full bg-zinc-900 border-2 border-white shadow"
                    style={{ width: 10, height: 10, top: ROW_H / 2 - 5, left: `calc(${pctFor(DOMAIN_MIN, DOMAIN_MAX, d.pt)}% - 5px)` }}
                  />
                )}
              </div>
            </div>
          ))}

          <div className="absolute inset-0 flex pointer-events-none">
            <div style={{ width: 190 }} />
            <div style={{ width: 40 }} />
            <div style={{ width: 36 }} />
            <div style={{ width: 110 }} />
            <svg
              className="flex-1"
              style={{ height: domains.length * ROW_H }}
              preserveAspectRatio="none"
              viewBox={`0 0 100 ${domains.length * ROW_H}`}
            >
              <polyline
                fill="none"
                stroke="#18181b"
                vectorEffect="non-scaling-stroke"
                points={domains
                  .map((d, i) => (d.pt !== null ? `${pctFor(DOMAIN_MIN, DOMAIN_MAX, d.pt)},${i * ROW_H + ROW_H / 2}` : null))
                  .filter(Boolean)
                  .join(" ")}
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ReportProfile;
