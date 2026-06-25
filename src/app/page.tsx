"use client";

import { useMemo, useState } from "react";
import {
  AREA_LABELS,
  PARENT_FORM_META,
  areasForBand,
  monthsToBandKey,
  rawToScaled,
  type AreaCode,
} from "@/lib/norms";
import ProfileChart from "@/components/ProfileChart";

export default function Home() {
  const [name, setName] = useState("");
  const [years, setYears] = useState(0);
  const [months, setMonths] = useState(6);
  const [respondent, setRespondent] = useState("Padre/Madre/Cuidador principal");
  const [raw, setRaw] = useState<Partial<Record<AreaCode, string>>>({});

  const totalMonths = years * 12 + months;
  const bandKey = monthsToBandKey(totalMonths);
  const areas = useMemo(() => areasForBand(bandKey), [bandKey]);

  const results = useMemo(() => {
    return areas.map((area) => {
      const rawVal = parseInt(raw[area] ?? "", 10);
      if (isNaN(rawVal)) return { area, scaled: null, note: undefined as string | undefined, tableUsed: "" };
      const r = rawToScaled(area, rawVal, totalMonths);
      return { area, scaled: r.scaled, note: r.note, tableUsed: r.tableUsed };
    });
  }, [areas, raw, totalMonths]);

  const chartPoints = results.map((r) => ({
    label: AREA_LABELS[r.area],
    code: r.area,
    scaled: r.scaled,
  }));

  const tableUsed = results.find((r) => r.tableUsed)?.tableUsed || `${PARENT_FORM_META.form} — Ages ${bandKey}`;

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-zinc-200 p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold text-amber-600 bg-amber-50 inline-block px-2 py-1 rounded">
            VISTA PREVIA — solo bandas de edad 0:0 a 1:3 digitalizadas y verificadas hasta ahora
          </p>
          <h1 className="text-2xl font-bold text-zinc-900 mt-3">ABAS-3 · Captura y perfil de conducta adaptativa</h1>
          <p className="text-zinc-500 text-sm mt-1">Formulario Padres/Cuidador principal (Ages 0–5)</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Nombre del paciente</label>
            <input
              className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm bg-white text-zinc-900"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre completo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">¿Quién contesta la escala?</label>
            <select
              className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm bg-white text-zinc-900"
              value={respondent}
              onChange={(e) => setRespondent(e.target.value)}
            >
              <option>Padre/Madre/Cuidador principal</option>
              <option disabled>Maestro/Cuidador diurno (pendiente de digitalizar)</option>
              <option disabled>Adulto — Autoinforme (pendiente de digitalizar)</option>
              <option disabled>Adulto — Otro informante (pendiente de digitalizar)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Edad — años</label>
            <input
              type="number"
              min={0}
              max={5}
              className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm bg-white text-zinc-900"
              value={years}
              onChange={(e) => setYears(parseInt(e.target.value || "0", 10))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Edad — meses</label>
            <input
              type="number"
              min={0}
              max={11}
              className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm bg-white text-zinc-900"
              value={months}
              onChange={(e) => setMonths(parseInt(e.target.value || "0", 10))}
            />
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-zinc-600 mb-3">
            Banda de edad seleccionada: <span className="font-mono font-semibold">{bandKey}</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {areas.map((area) => (
              <div key={area}>
                <label className="block text-xs font-medium text-zinc-600 mb-1">
                  {AREA_LABELS[area]} ({area}) · PD
                </label>
                <input
                  type="number"
                  min={0}
                  className="w-full border border-zinc-300 rounded-md px-2 py-1.5 text-sm bg-white text-zinc-900"
                  value={raw[area] ?? ""}
                  onChange={(e) => setRaw((prev) => ({ ...prev, [area]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-zinc-200 pt-6">
          <ProfileChart points={chartPoints} title="Perfil por área (puntaje escalar, media=10, DE=3)" />
        </div>

        <div className="mt-6 text-xs text-zinc-500 bg-zinc-50 border border-zinc-200 rounded-md p-3">
          <strong>Tabla utilizada:</strong> {tableUsed}
          {results.some((r) => r.note) && (
            <ul className="mt-1 list-disc list-inside">
              {results.filter((r) => r.note).map((r) => (
                <li key={r.area}>{AREA_LABELS[r.area]}: {r.note}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
