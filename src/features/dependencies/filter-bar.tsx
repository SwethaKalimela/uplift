"use client";

import { useWorkspaceShallow } from "@/shared/store/workspace";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { countByBump, type RowModel } from "./row-model";

const BUMPS = [
  { id: "all", label: "All" },
  { id: "outdated", label: "Outdated" },
  { id: "major", label: "Major" },
  { id: "minor", label: "Minor" },
  { id: "patch", label: "Patch" },
] as const;

export function FilterBar({ rows, fetching }: { rows: readonly RowModel[]; fetching: number }) {
  const { filters, setSearch, setBumpFilter, toggleRiskyOnly, resetFilters, addManyToDraft } = useWorkspaceShallow((state) => ({
    filters: state.filters,
    setSearch: state.setSearch,
    setBumpFilter: state.setBumpFilter,
    toggleRiskyOnly: state.toggleRiskyOnly,
    resetFilters: state.resetFilters,
    addManyToDraft: state.addManyToDraft,
  }));
  const counts = countByBump(rows);
  const majors = rows.flatMap((row) =>
    row.assessment?.kind === "behind" && row.assessment.bump === "major"
      ? [{ name: row.spec.name, target: row.assessment.latest }]
      : [],
  );

  return (
    <div className="flex flex-col gap-3 border-b bg-surface px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={filters.search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Filter packages"
          aria-label="Filter packages"
          className="max-w-xs"
        />
        {BUMPS.map((bump) => (
          <Button
            key={bump.id}
            size="sm"
            variant={filters.bump === bump.id ? "primary" : "secondary"}
            onClick={() => setBumpFilter(bump.id)}
          >
            {bump.label}
            {bump.id === "major" && counts.major > 0 ? ` ${counts.major}` : null}
          </Button>
        ))}
        <Button size="sm" variant={filters.riskyOnly ? "primary" : "ghost"} onClick={toggleRiskyOnly}>
          Risky only
        </Button>
        <Button size="sm" variant="ghost" onClick={resetFilters}>
          Reset
        </Button>
        <span className="ml-auto text-xs text-muted-foreground">
          {fetching > 0 ? `Loading ${fetching} packages` : `${rows.length} packages`}
        </span>
      </div>
      {majors.length > 0 && (
        <Button size="sm" variant="secondary" className="self-start" onClick={() => addManyToDraft(majors)}>
          Add {majors.length} major{majors.length === 1 ? "" : "s"} to plan
        </Button>
      )}
    </div>
  );
}
