"use client";

import { Plus, Search } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { PackageName, SemverString } from "@/shared/schemas/primitives";
import { useWorkspaceShallow } from "@/shared/store/workspace";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Tooltip } from "@/shared/ui/tooltip";
import { countByBump, countRisky, type RowModel } from "./row-model";

const BUMPS = [
  { id: "all", label: "All" },
  { id: "outdated", label: "Outdated" },
  { id: "major", label: "Major" },
  { id: "minor", label: "Minor" },
  { id: "patch", label: "Patch" },
] as const;

export function FilterBar({
  rows,
  visibleCount,
  addable,
}: {
  rows: readonly RowModel[];
  visibleCount: number;
  addable: ReadonlyArray<{ name: PackageName; target: SemverString }>;
}) {
  const { filters, setSearch, setBumpFilter, toggleRiskyOnly, addManyToDraft } = useWorkspaceShallow((state) => ({
    filters: state.filters,
    setSearch: state.setSearch,
    setBumpFilter: state.setBumpFilter,
    toggleRiskyOnly: state.toggleRiskyOnly,
    addManyToDraft: state.addManyToDraft,
  }));
  const counts = countByBump(rows);
  const riskyCount = countRisky(rows);

  return (
    <div className="flex items-center gap-2 border-b px-5 py-2.5">
      <label className="relative w-52 shrink-0">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Filter packages"
          aria-label="Filter packages"
          className="h-8 border-transparent bg-muted pl-8"
        />
      </label>

      <div role="group" aria-label="Filter by bump" className="flex h-8 shrink-0 items-center rounded-md bg-muted p-0.5">
        {BUMPS.map((bump) => {
          const count = bump.id === "major" ? counts.major : bump.id === "outdated" ? counts.major + counts.minor + counts.patch : null;
          return (
            <button
              key={bump.id}
              type="button"
              onClick={() => setBumpFilter(bump.id)}
              className={cn(
                "h-7 rounded-[5px] px-2.5 text-xs font-medium transition-colors",
                filters.bump === bump.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {bump.label}
              {count ? <span className="ml-1 tabular-nums text-muted-foreground">{count}</span> : null}
            </button>
          );
        })}
      </div>

      <Tooltip content="Packages with npm security advisories or marked deprecated">
        <button
          type="button"
          aria-pressed={filters.riskyOnly}
          aria-label="Filter to risky packages"
          onClick={toggleRiskyOnly}
          className={cn(
            "h-8 rounded-md px-2.5 text-xs font-medium transition-colors",
            filters.riskyOnly ? "bg-major/15 text-major" : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          Risky
          {riskyCount > 0 && <span className="ml-1 tabular-nums text-muted-foreground">{riskyCount}</span>}
        </button>
      </Tooltip>

      <div className="ml-auto flex items-center gap-3">
        <span className="text-xs tabular-nums text-muted-foreground">{visibleCount} packages</span>
        {addable.length > 0 && (
          <Button size="sm" variant="secondary" onClick={() => addManyToDraft(addable)}>
            <Plus />
            Add {addable.length} to plan
          </Button>
        )}
      </div>
    </div>
  );
}
