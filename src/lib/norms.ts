import parent0_5 from "@/data/norms/parent_0_5.json";
import parent0_5Indices from "@/data/norms/parent_0_5_indices.json";
import parent5_21 from "@/data/norms/parent_5_21.json";

export type AreaCode = "Com" | "CU" | "FA" | "HL" | "HS" | "LS" | "SC" | "SD" | "Soc" | "MO" | "WK";

export const AREA_LABELS: Record<AreaCode, string> = {
  Com: "Comunicación",
  CU: "Utiliz. recursos comunitarios",
  FA: "Académicas funcionales",
  HL: "Vida en el hogar",
  HS: "Salud y seguridad",
  LS: "Ocio",
  SC: "Autocuidado",
  SD: "Autodirección",
  Soc: "Social",
  MO: "Motor",
  WK: "Trabajo",
};

type AgeBandTable = Partial<Record<AreaCode, string[]>> & {
  verified?: boolean;
  areas?: AreaCode[];
};

interface NormsFile {
  form: string;
  sourcePage: string;
  areas: AreaCode[];
  ageBands: Record<string, AgeBandTable>;
}

interface IndicesFile {
  form: string;
  sourcePage: string;
  ageBands: Record<string, { verified?: boolean; ss: number[] } & Record<string, string[] | number[] | boolean | undefined>>;
}

export type FormId = "parent_0_5" | "parent_5_21";

export const FORM_LABELS: Record<FormId, string> = {
  parent_0_5: "Padre/Madre/Cuidador principal (0-5 años)",
  parent_5_21: "Padre/Madre (Escolar, 5-21 años)",
};

const NORMS_BY_FORM: Record<FormId, NormsFile> = {
  parent_0_5: parent0_5 as unknown as NormsFile,
  parent_5_21: parent5_21 as unknown as NormsFile,
};

const INDICES_BY_FORM: Partial<Record<FormId, IndicesFile>> = {
  parent_0_5: parent0_5Indices as unknown as IndicesFile,
};

/** Convierte una llave de banda ("2:3" o "2:3-2:5") al rango [minMeses, maxMeses] que cubre. */
function bandKeyToMonthsRange(key: string): [number, number] {
  const parts = key.split("-");
  const toMonths = (p: string) => {
    const [y, m] = p.split(":").map(Number);
    return y * 12 + m;
  };
  const min = toMonths(parts[0]);
  const max = parts.length > 1 ? toMonths(parts[1]) : min;
  return [min, max];
}

/** Busca, dentro de un set arbitrario de bandas (claves del JSON), la que contiene la edad dada en meses. */
function findBandKey(ageBands: Record<string, unknown>, totalMonths: number): string | null {
  for (const key of Object.keys(ageBands)) {
    const [min, max] = bandKeyToMonthsRange(key);
    if (totalMonths >= min && totalMonths <= max) return key;
  }
  return null;
}

/** Encuentra, entre las bandas de la Tabla A.1/A.4 ya digitalizadas del formulario, la que contiene la edad dada en meses. */
export function monthsToBandKey(formId: FormId, totalMonths: number): string {
  const norms = NORMS_BY_FORM[formId];
  const found = findBandKey(norms.ageBands, totalMonths);
  if (found) return found;
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return `${years}:${months}`;
}

export function areasForBand(formId: FormId, bandKey: string): AreaCode[] {
  const norms = NORMS_BY_FORM[formId];
  const band = norms.ageBands[bandKey];
  return band?.areas ?? norms.areas;
}

export function formMeta(formId: FormId) {
  const norms = NORMS_BY_FORM[formId];
  return { form: norms.form, sourcePage: norms.sourcePage };
}

export interface ConversionResult {
  scaled: number | null;
  raw: number;
  area: AreaCode;
  bandKey: string;
  tableUsed: string;
  note?: string;
}

function parseRange(cell: string): { min: number; max: number } | null {
  if (!cell || cell === "—" || cell === "-") return null;
  const parts = cell.split("-").map((p) => parseInt(p.trim(), 10));
  if (parts.length === 1) return { min: parts[0], max: parts[0] };
  return { min: parts[0], max: parts[1] };
}

export function rawToScaled(
  formId: FormId,
  area: AreaCode,
  raw: number,
  totalMonths: number
): ConversionResult {
  const norms = NORMS_BY_FORM[formId];
  const bandKey = monthsToBandKey(formId, totalMonths);
  const band = norms.ageBands[bandKey];

  if (!band || !band[area]) {
    return {
      scaled: null,
      raw,
      area,
      bandKey,
      tableUsed: norms.sourcePage,
      note: `Banda de edad "${bandKey}" (o el área ${area}) aún no digitalizada en esta vista previa.`,
    };
  }

  const column = band[area]!;
  for (let ss = 1; ss <= 19; ss++) {
    const range = parseRange(column[ss - 1]);
    if (range && raw >= range.min && raw <= range.max) {
      return { scaled: ss, raw, area, bandKey, tableUsed: `${norms.form} — ${norms.sourcePage} — Ages ${bandKey}` };
    }
  }

  const firstDefined = column.findIndex((c) => parseRange(c));
  const lastDefined = column.length - 1 - [...column].reverse().findIndex((c) => parseRange(c));
  const lastRange = parseRange(column[lastDefined]);
  if (lastRange && raw > lastRange.max) {
    return { scaled: 19, raw, area, bandKey, tableUsed: `${norms.form} — ${norms.sourcePage} — Ages ${bandKey}`, note: "Por encima del techo tabulado, asignado 19." };
  }
  if (firstDefined >= 0) {
    return { scaled: firstDefined + 1, raw, area, bandKey, tableUsed: `${norms.form} — ${norms.sourcePage} — Ages ${bandKey}`, note: "Por debajo del rango tabulado, asignado el escalar mínimo disponible." };
  }

  return { scaled: null, raw, area, bandKey, tableUsed: norms.sourcePage, note: "Sin datos para esta combinación." };
}

export function getAvailableBands(formId: FormId): string[] {
  return Object.keys(NORMS_BY_FORM[formId].ageBands);
}

// --- Índices (Tabla A.2): CON, SO, PR, GAC ---

export type DomainCode = "CON" | "SO" | "PR" | "GAC";

export const DOMAIN_LABELS: Record<DomainCode, string> = {
  CON: "Conceptual",
  SO: "Social",
  PR: "Práctico",
  GAC: "Conducta adaptativa general",
};

/**
 * Composición de cada índice por áreas. El dominio Motor (MO) no integra ningún
 * índice — solo se suma al GAC general. FA solo se incluye cuando existe en la banda.
 */
function domainAreas(domain: Exclude<DomainCode, "GAC">, areas: AreaCode[]): AreaCode[] {
  const has = (a: AreaCode) => areas.includes(a);
  switch (domain) {
    case "CON":
      return (["Com", "FA", "SD"] as AreaCode[]).filter(has);
    case "SO":
      return (["LS", "Soc"] as AreaCode[]).filter(has);
    case "PR":
      return (["CU", "HL", "HS", "SC", "WK"] as AreaCode[]).filter(has);
  }
}

export function areasForDomain(formId: FormId, domain: DomainCode, bandKey: string): AreaCode[] {
  const areas = areasForBand(formId, bandKey);
  if (domain === "GAC") return areas;
  return domainAreas(domain, areas);
}

export interface IndexConversionResult {
  standard: number | null;
  sum: number;
  domain: DomainCode;
  bandKey: string;
  tableUsed: string;
  note?: string;
}

export function sumToStandardScore(formId: FormId, domain: DomainCode, sum: number, totalMonths: number): IndexConversionResult {
  const indices = INDICES_BY_FORM[formId];
  if (!indices) {
    const bandKey = monthsToBandKey(formId, totalMonths);
    return {
      standard: null,
      sum,
      domain,
      bandKey,
      tableUsed: "",
      note: `La Tabla de índices (A.2) para "${FORM_LABELS[formId]}" aún no ha sido digitalizada.`,
    };
  }

  const bandKey = findBandKey(indices.ageBands, totalMonths) ?? monthsToBandKey(formId, totalMonths);
  const band = indices.ageBands[bandKey];

  if (!band || !band[domain]) {
    return {
      standard: null,
      sum,
      domain,
      bandKey,
      tableUsed: indices.sourcePage,
      note: `Tabla A.2 para la banda "${bandKey}" aún no digitalizada en esta vista previa.`,
    };
  }

  const column = band[domain] as string[];
  const ssRow = band.ss as number[];
  for (let i = 0; i < column.length; i++) {
    const range = parseRange(column[i]);
    if (range && sum >= range.min && sum <= range.max) {
      return { standard: ssRow[i], sum, domain, bandKey, tableUsed: `${indices.form} — ${indices.sourcePage} — Ages ${bandKey}` };
    }
  }

  const firstDefined = column.findIndex((c) => parseRange(c));
  const lastDefinedIdx = column.length - 1 - [...column].reverse().findIndex((c) => parseRange(c));
  const lastRange = parseRange(column[lastDefinedIdx]);
  if (lastRange && sum > lastRange.max) {
    return { standard: ssRow[lastDefinedIdx], sum, domain, bandKey, tableUsed: `${indices.form} — ${indices.sourcePage} — Ages ${bandKey}`, note: "Por encima del techo tabulado." };
  }
  if (firstDefined >= 0) {
    return { standard: ssRow[firstDefined], sum, domain, bandKey, tableUsed: `${indices.form} — ${indices.sourcePage} — Ages ${bandKey}`, note: "Por debajo del rango tabulado." };
  }

  return { standard: null, sum, domain, bandKey, tableUsed: indices.sourcePage, note: "Sin datos para esta combinación." };
}
