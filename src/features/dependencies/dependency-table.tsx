"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef } from "react";
import { useWorkspace } from "@/shared/store/workspace";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { DependencyRow } from "./dependency-row";
import { FilterBar } from "./filter-bar";
import { DEPENDENCY_GRID } from "./table-layout";
import { useDependencyRows } from "./use-dependency-rows";

const COLUMNS = ["Package", "Version", "Bump", "Activity", "Risk", ""];
const ROW_HEIGHT = 52;

export function DependencyTable() {
  "use no memo";
  const dependencies = useWorkspace((state) => state.project?.dependencies ?? []);
  const draft = useWorkspace((state) => state.draft);
  const resetFilters = useWorkspace((state) => state.resetFilters);
  const { rows, visible, fetchingPackages } = useDependencyRows(dependencies);
  const parentRef = useRef<HTMLDivElement>(null);
  const inPlan = useMemo(() => new Set(draft.map((item) => item.name)), [draft]);
  const addable = useMemo(
    () =>
      visible.flatMap((row) =>
        row.assessment?.kind === "behind" && !inPlan.has(row.spec.name)
          ? [{ name: row.spec.name, target: row.assessment.latest }]
          : [],
      ),
    [visible, inPlan],
  );
  const virtualizer = useVirtualizer({
    count: visible.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <FilterBar rows={rows} visibleCount={visible.length} addable={addable} />
      <div role="table" aria-label="Dependencies" aria-busy={fetchingPackages > 0} className="flex min-h-0 flex-1 flex-col">
        {visible.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5">
            <p className="text-sm text-muted-foreground">No packages match these filters.</p>
            <Button size="sm" variant="secondary" onClick={resetFilters}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div ref={parentRef} className="min-h-0 flex-1 overflow-auto">
            <div role="row" className={cn(DEPENDENCY_GRID, "sticky top-0 z-10 h-8 bg-background text-xs text-muted-foreground")}>
              {COLUMNS.map((column) => (
                <span key={column || "actions"}>{column}</span>
              ))}
            </div>
            <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
              {virtualizer.getVirtualItems().map((item) => {
                const row = visible[item.index];
                if (!row) return null;
                return (
                  <DependencyRow
                    key={row.spec.name}
                    row={row}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: item.size,
                      transform: `translateY(${item.start}px)`,
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
