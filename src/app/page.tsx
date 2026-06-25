"use client";

import { useMemo, useState } from "react";
import {
  AREA_LABELS,
  DOMAIN_LABELS,
  FORM_LABELS,
  areasForBand,
  areasForDomain,
  formMeta,
  monthsToBandKey,
  rawToScaled,
  sumToStandardScore,
  type AreaCode,
  type DomainCode,
  type FormId,
} from "@/lib/norms";
import ProfileChart from "@/components/ProfileChart";
import IndicesChart from "@/components/IndicesChart";

const DOMAINS: DomainCode[] = ["CON", "SO", "PR", "GAC"];

export default function Home() {
  const [name, setName] = useState("");
  const [years, setYears] = useState(0);
  const [months, setMonths] = useState(6);
  const [formId, setFormId] = useState<FormId>("parent_0_5");
  const [raw, setRaw] = useState<Partial<Record<AreaCode, string>>>({});

  const totalMonths = years * 12 + months;
  const bandKey = monthsToBandKey(formId, totalMonths);
  const areas = useMemo(() => areasForBand(formId, bandKey), [formId, bandKey]);
  const meta = formMeta(formId);

  const results = useMemo(() => {
    return areas.map((area) => {
      const rawVal = parseInt(raw[area] ?? "", 10);
      if (isNaN(rawVal)) return { area, scaled: null, note: undefined as string | undefined, tableUsed: "" };
      const r = rawToScaled(formId, area, rawVal, totalMonths);
      return { area, scaled: r.scaled, note: r.note, tableUsed: r.tableUsed };
    });
  }, [formId, areas, raw, totalMonths]);

  const scaledByArea = useMemo(() => {
    const map: Partial<Record<AreaCode, number>> = {};
    for (const r of results) if (r.scaled !== null) map[r.area] = r.scaled;
    return map;
  }, [results]);

  const indexResults = useMemo(() => {
    return DOMAINS.map((domain) => {
      const domainAreaList = areasForDomain(formId, domain, bandKey);
      const values = domainAreaList.map((a) => scaledByArea[a]);
      if (domainAreaList.length === 0 || values.some((v) => v === undefined)) {
        return { domain, standard: null, note: undefined as string | undefined, tableUsed: "", areasUsed: domainAreaList };
      }
      const sum = (values as number[]).reduce((acc, v) => acc + v, 0);
      const r = sumToStandardScore(formId, domain, sum, totalMonths);
      return { domain, standard: r.standard, note: r.note, tableUsed: r.tableUsed, areasUsed: domainAreaList, sum };
    });
  }, [formId, bandKey, scaledByArea, totalMonths]);

  const chartPoints = results.map((r) => ({
    label: AREA_LABELS[r.area],
    code: r.area,
    scaled: r.scaled,
  }));

  const indexChartPoints = indexResults.map((r) => ({
    label: DOMAIN_LABELS[r.domain],
    code: r.domain,
    standard: r.standard,
  }));

  const tableUsed = results.find((r) => r.tableUsed)?.tableUsed || `${meta.form} — Ages ${bandKey}`;
  const indexTableUsed = indexResults.find((r) => r.tableUsed)?.tableUsed;

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-zinc-200 p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 inline-block px-2 py-1 rounded">
            Padres/Cuidador (0-5): Tablas A.1+A.2 completas · Padres Escolar (5-21): Tabla A.4 en progreso
          </p>
          <h1 className="text-2xl font-bold text-zinc-900 mt-3">ABAS-3 · Captura y perfil de conducta adaptativa</h1>
          <p className="text-zinc-500 text-sm mt-1">{meta.form}</p>
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
              value={formId}
              onChange={(e) => setFormId(e.target.value as FormId)}
            >
              {Object.entries(FORM_LABELS).map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
              <option disabled>Adulto — Autoinforme (pendiente de digitalizar)</option>
              <option disabled>Adulto — Otro informante (pendiente de digitalizar)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Edad — años</label>
            <input
              type="number"
              min={0}
              max={21}
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

        <div className="border-t border-zinc-200 pt-6 mt-6">
          <IndicesChart points={indexChartPoints} title="Índices (puntaje típico, media=100, DE=15)" />
        </div>

        <div className="mt-6 text-xs text-zinc-500 bg-zinc-50 border border-zinc-200 rounded-md p-3 space-y-2">
          <div>
            <strong>Tabla utilizada:</strong> {tableUsed}
            {results.some((r) => r.note) && (
              <ul className="mt-1 list-disc list-inside">
                {results.filter((r) => r.note).map((r) => (
                  <li key={r.area}>{AREA_LABELS[r.area]}: {r.note}</li>
                ))}
              </ul>
            )}
          </div>
          {indexTableUsed && (
            <div>
              <strong>Tabla A.2 utilizada:</strong> {indexTableUsed}
            </div>
          )}
          {indexResults.some((r) => r.note) && (
            <ul className="list-disc list-inside">
              {indexResults.filter((r) => r.note).map((r) => (
                <li key={r.domain}>{DOMAIN_LABELS[r.domain]}: {r.note}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
