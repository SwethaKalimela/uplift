const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 365 * 24 * 60 * 60 * 1000],
  ["month", 30 * 24 * 60 * 60 * 1000],
  ["week", 7 * 24 * 60 * 60 * 1000],
  ["day", 24 * 60 * 60 * 1000],
];

export function formatDownloads(value: number | null | undefined) {
  if (value == null) return "—";
  return compact.format(value);
}

export function formatRelativeDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "—";
  const delta = then - Date.now();
  for (const [unit, ms] of UNITS) {
    if (Math.abs(delta) >= ms) return relative.format(Math.round(delta / ms), unit);
  }
  return "today";
}

export function formatGroup(group: string) {
  switch (group) {
    case "devDependencies":
      return "dev";
    case "peerDependencies":
      return "peer";
    case "optionalDependencies":
      return "optional";
    default:
      return "prod";
  }
}
