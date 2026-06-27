"use client";

import { useMemo, useRef, useState } from "react";
import {
  AREA_LABELS,
  DOMAIN_LABELS,
  FORM_LABELS,
  areaVisualCategory,
  areasForBand,
  areasForDomain,
  formMeta,
  formatBandKey,
  interpretScaled,
  interpretStandard,
  monthsToBandKey,
  rawToScaled,
  sumToStandardScore,
  type AreaCode,
  type DomainCode,
  type FormId,
} from "@/lib/norms";
import ReportProfile, { type DomainRow, type SkillRow } from "@/components/ReportProfile";
import { logout } from "@/lib/auth";

const DOMAINS: DomainCode[] = ["CON", "SO", "PR", "GAC"];

function todayLabel() {
  const d = new Date();
  return d.toLocaleDateString("es-MX");
}

export default function HomeClient() {
  const [name, setName] = useState("");
  const [professional, setProfessional] = useState("");
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0, 10));
  const [years, setYears] = useState(0);
  const [months, setMonths] = useState(6);
  const [days, setDays] = useState(0);
  const [formId, setFormId] = useState<FormId>("parent_0_5");
  const [raw, setRaw] = useState<Partial<Record<AreaCode, string>>>({});
  const reportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const totalMonths = years * 12 + months;
  const bandKey = monthsToBandKey(formId, totalMonths);
  const areas = useMemo(() => areasForBand(formId, bandKey), [formId, bandKey]);
  const meta = formMeta(formId);

  const results = useMemo(() => {
    return areas.map((area) => {
      const rawVal = parseInt(raw[area] ?? "", 10);
      if (isNaN(rawVal)) return { area, raw: null as number | null, scaled: null, note: undefined as string | undefined, tableUsed: "" };
      const r = rawToScaled(formId, area, rawVal, totalMonths);
      return { area, raw: rawVal, scaled: r.scaled, note: r.note, tableUsed: r.tableUsed };
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
        return { domain, standard: null, note: undefined as string | undefined, tableUsed: "", areasUsed: domainAreaList, sum: null as number | null };
      }
      const sum = (values as number[]).reduce((acc, v) => acc + v, 0);
      const r = sumToStandardScore(formId, domain, sum, totalMonths);
      return { domain, standard: r.standard, note: r.note, tableUsed: r.tableUsed, areasUsed: domainAreaList, sum };
    });
  }, [formId, bandKey, scaledByArea, totalMonths]);

  const skillRows: SkillRow[] = results.map((r) => ({
    code: r.area,
    label: AREA_LABELS[r.area],
    category: areaVisualCategory(r.area),
    pd: r.raw,
    pe: r.scaled,
    interpretation: interpretScaled(r.scaled),
  }));

  const domainRows: DomainRow[] = indexResults
    .filter((r) => r.domain !== "GAC")
    .map((r) => ({
      code: r.domain,
      label: DOMAIN_LABELS[r.domain],
      spe: r.sum,
      pt: r.standard,
      interpretation: interpretStandard(r.standard),
    }));
  const gacResult = indexResults.find((r) => r.domain === "GAC");
  if (gacResult) {
    domainRows.push({
      code: "CAG",
      label: DOMAIN_LABELS.GAC,
      spe: gacResult.sum,
      pt: gacResult.standard,
      interpretation: interpretStandard(gacResult.standard),
    });
  }

  const tableUsed = results.find((r) => r.tableUsed)?.tableUsed || `${meta.form} — Ages ${bandKey}`;
  const indexTableUsed = indexResults.find((r) => r.tableUsed)?.tableUsed;

  const ageLabel = `${years} años, ${months} meses, ${days} días`;
  const groupLabel = formatBandKey(bandKey);
  const dateLabel = dateStr
    ? new Date(dateStr + "T00:00:00").toLocaleDateString("es-MX")
    : todayLabel();

  async function handleDownloadPng() {
    if (!reportRef.current) return;
    setDownloading(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(reportRef.current, { pixelRatio: 2, backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = `ABAS3_Perfil_${(name || "paciente").replace(/\s+/g, "_")}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-zinc-200 p-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Contenido con fines académicos sin comercialización</h1>
            <p className="text-zinc-500 text-sm mt-1">{meta.form}</p>
          </div>
          <form action={logout}>
            <button type="submit" className="text-sm text-zinc-500 hover:text-zinc-800 underline">
              Cerrar sesión
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
            <label className="block text-sm font-medium text-zinc-700 mb-1">Profesional</label>
            <input
              className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm bg-white text-zinc-900"
              value={professional}
              onChange={(e) => setProfessional(e.target.value)}
              placeholder="Nombre del profesional"
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
              <option disabled>Adulto — Otro informante (pendiente de digitalizar)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Fecha</label>
            <input
              type="date"
              className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm bg-white text-zinc-900"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Edad — años</label>
            <input
              type="number"
              min={0}
              max={89}
              className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm bg-white text-zinc-900"
              value={years}
              onChange={(e) => setYears(parseInt(e.target.value || "0", 10))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Edad — días</label>
              <input
                type="number"
                min={0}
                max={30}
                className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm bg-white text-zinc-900"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value || "0", 10))}
              />
            </div>
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

        <div className="flex justify-end mb-3">
          <button
            onClick={handleDownloadPng}
            disabled={downloading}
            className="bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-md"
          >
            {downloading ? "Generando…" : "Descargar PNG"}
          </button>
        </div>

        <div className="border-t border-zinc-200 pt-6">
          <ReportProfile
            ref={reportRef}
            patientName={name}
            professional={professional}
            ageLabel={ageLabel}
            groupLabel={groupLabel}
            dateLabel={dateLabel}
            skills={skillRows}
            domains={domainRows}
          />
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
              <strong>Tabla de índices utilizada:</strong> {indexTableUsed}
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
