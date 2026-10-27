import { bumpRank, type Assessment } from "@/shared/domain/bump";
import type { DependencySpec } from "@/shared/domain/manifest";
import { worstSeverity } from "@/shared/domain/severity";
import type { Advisory, PackageSummary } from "@/shared/schemas/registry";
import type { BumpFilter, Filters, Sort } from "@/shared/store/types";

export type RowModel = {
  spec: DependencySpec;
  assessment: Assessment | null;
  summary: PackageSummary | undefined;
  downloads: number | null | undefined;
  advisories: Advisory[];
  isPending: boolean;
  isError: boolean;
};

function matchesBump(filter: BumpFilter, assessment: Assessment | null) {
  if (filter === "all") return true;
  if (assessment === null) return false;
  if (filter === "outdated") return assessment.kind === "behind";
  return assessment.kind === "behind" && assessment.bump === filter;
}

export function isRisky(row: RowModel) {
  if (row.advisories.length > 0) return true;
  return Boolean(row.summary?.deprecated);
}

export function countRisky(rows: readonly RowModel[]) {
  return rows.filter(isRisky).length;
}

export function filterRows(rows: readonly RowModel[], filters: Filters) {
  const search = filters.search.trim().toLowerCase();
  return rows.filter((row) => {
    if (search && !row.spec.name.includes(search)) return false;
    if (filters.group !== "all" && row.spec.group !== filters.group) return false;
    if (!matchesBump(filters.bump, row.assessment)) return false;
    if (filters.riskyOnly && !isRisky(row)) return false;
    return true;
  });
}

function sortValue(row: RowModel, key: Sort["key"]): number | string {
  switch (key) {
    case "name":
      return row.spec.name;
    case "downloads":
      return row.downloads ?? -1;
    case "published":
      return row.summary?.latestPublishedAt ?? "";
    case "bump": {
      if (row.assessment?.kind === "behind") return 10 + bumpRank(row.assessment.bump);
      if (row.assessment?.kind === "ahead") return 1;
      if (row.assessment?.kind === "current") return 0;
      return -1;
    }
  }
}

export function sortRows(rows: readonly RowModel[], sort: Sort) {
  const copy = [...rows];
  copy.sort((a, b) => {
    const left = sortValue(a, sort.key);
    const right = sortValue(b, sort.key);
    const compared = typeof left === "number" && typeof right === "number" ? left - right : String(left).localeCompare(String(right));
    return sort.direction === "asc" ? compared : -compared;
  });
  return copy;
}

export function countByBump(rows: readonly RowModel[]) {
  const counts = { current: 0, patch: 0, minor: 0, major: 0, other: 0, pending: 0 };
  for (const row of rows) {
    if (row.isPending) counts.pending += 1;
    else if (row.assessment?.kind === "current") counts.current += 1;
    else if (row.assessment?.kind === "behind") counts[row.assessment.bump] += 1;
    else counts.other += 1;
  }
  return counts;
}

export function advisoryTone(advisories: readonly Advisory[]) {
  const worst = worstSeverity(advisories);
  return worst === "high" || worst === "critical" ? "danger" : worst ? "minor" : null;
}
