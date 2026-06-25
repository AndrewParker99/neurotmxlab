import parent0_5 from "@/data/norms/parent_0_5.json";

export type AreaCode = "Com" | "CU" | "FA" | "HL" | "HS" | "LS" | "SC" | "SD" | "Soc" | "MO";

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

const PARENT_0_5 = parent0_5 as unknown as NormsFile;

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

/** Encuentra, entre las bandas ya digitalizadas, la que contiene la edad dada en meses totales. */
export function monthsToBandKey(totalMonths: number): string {
  for (const key of Object.keys(PARENT_0_5.ageBands)) {
    const [min, max] = bandKeyToMonthsRange(key);
    if (totalMonths >= min && totalMonths <= max) return key;
  }
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return `${years}:${months}`;
}

export function areasForBand(bandKey: string): AreaCode[] {
  const band = PARENT_0_5.ageBands[bandKey];
  return band?.areas ?? PARENT_0_5.areas;
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
  area: AreaCode,
  raw: number,
  totalMonths: number
): ConversionResult {
  const bandKey = monthsToBandKey(totalMonths);
  const band = PARENT_0_5.ageBands[bandKey];

  if (!band || !band[area]) {
    return {
      scaled: null,
      raw,
      area,
      bandKey,
      tableUsed: PARENT_0_5.sourcePage,
      note: `Banda de edad "${bandKey}" (o el área ${area}) aún no digitalizada en esta vista previa.`,
    };
  }

  const column = band[area]!;
  for (let ss = 1; ss <= 19; ss++) {
    const range = parseRange(column[ss - 1]);
    if (range && raw >= range.min && raw <= range.max) {
      return { scaled: ss, raw, area, bandKey, tableUsed: `${PARENT_0_5.form} — ${PARENT_0_5.sourcePage} — Ages ${bandKey}` };
    }
  }

  const firstDefined = column.findIndex((c) => parseRange(c));
  const lastDefined = column.length - 1 - [...column].reverse().findIndex((c) => parseRange(c));
  const lastRange = parseRange(column[lastDefined]);
  if (lastRange && raw > lastRange.max) {
    return { scaled: 19, raw, area, bandKey, tableUsed: `${PARENT_0_5.form} — ${PARENT_0_5.sourcePage} — Ages ${bandKey}`, note: "Por encima del techo tabulado, asignado 19." };
  }
  if (firstDefined >= 0) {
    return { scaled: firstDefined + 1, raw, area, bandKey, tableUsed: `${PARENT_0_5.form} — ${PARENT_0_5.sourcePage} — Ages ${bandKey}`, note: "Por debajo del rango tabulado, asignado el escalar mínimo disponible." };
  }

  return { scaled: null, raw, area, bandKey, tableUsed: PARENT_0_5.sourcePage, note: "Sin datos para esta combinación." };
}

export function getAvailableBands(): string[] {
  return Object.keys(PARENT_0_5.ageBands);
}

export const PARENT_FORM_AREAS = PARENT_0_5.areas;
export const PARENT_FORM_META = { form: PARENT_0_5.form, sourcePage: PARENT_0_5.sourcePage };
