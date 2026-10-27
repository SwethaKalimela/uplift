"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import { useWorkspace } from "@/shared/store/workspace";
import { DependencyRow } from "./dependency-row";
import { FilterBar } from "./filter-bar";
import { useDependencyRows } from "./use-dependency-rows";

const COLUMNS = ["Package", "Installed", "Latest", "Bump", "Downloads", "Published", ""];
const ROW_HEIGHT = 64;

export function DependencyTable() {
  "use no memo";
  const dependencies = useWorkspace((state) => state.project?.dependencies ?? []);
  const { rows, visible, fetchingPackages } = useDependencyRows(dependencies);
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: visible.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-surface">
      <FilterBar rows={rows} fetching={fetchingPackages} />
      <div role="table" aria-label="Dependencies" className="flex min-h-0 flex-1 flex-col">
        <div
          role="row"
          className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,0.6fr)_auto] gap-3 border-b bg-surface-raised px-4 py-2 text-xs font-medium text-muted-foreground"
        >
          {COLUMNS.map((column) => (
            <span key={column || "actions"}>{column}</span>
          ))}
        </div>
        <div ref={parentRef} className="min-h-0 flex-1 overflow-auto">
          {visible.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">No packages match these filters.</p>
          ) : (
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
          )}
        </div>
      </div>
    </section>
  );
}
