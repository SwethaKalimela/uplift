"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { Copy, X } from "lucide-react";
import Link from "next/link";
import { useRef, type CSSProperties } from "react";
import { BumpBadge } from "@/features/dependencies/bump-badge";
import { RiskCell } from "@/features/dependencies/risk-cell";
import type { RowModel } from "@/features/dependencies/row-model";
import { formatDownloads, formatGroup, formatRelativeDate } from "@/shared/lib/format";
import { packageHref } from "@/shared/lib/package-path";
import type { PackageName, SemverString } from "@/shared/schemas/primitives";
import type { PlanItemStatus } from "@/shared/schemas/plan";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { Tooltip } from "@/shared/ui/tooltip";
import { toSpec } from "./export";

export type PlanEntry = {
  key: string;
  name: PackageName;
  target: SemverString;
  itemId?: string;
  status?: PlanItemStatus;
};

const ROW_ESTIMATE = 88;

function VersionPath({ row, target }: { row: RowModel | undefined; target: SemverString }) {
  const current = row?.assessment && row.assessment.kind !== "unsupported" ? row.assessment.current : null;
  if (current && current !== target) {
    return (
      <>
        <span>{current}</span>
        <span className="mx-1.5 opacity-50">→</span>
        <span>{target}</span>
      </>
    );
  }
  return <>{target}</>;
}

function PlanRow({
  entry,
  index,
  row,
  onCopy,
  onRemove,
}: {
  entry: PlanEntry;
  index: number;
  row: RowModel | undefined;
  onCopy: () => void;
  onRemove: () => void;
}) {
  const spec = toSpec(entry.name, entry.target);
  const group = row ? formatGroup(row.spec.group) : "prod";
  const downloads = formatDownloads(row?.downloads);
  const published = formatRelativeDate(row?.summary?.latestPublishedAt);
  const meta = [row?.downloads != null ? `${downloads}/wk` : null, published !== "—" ? `published ${published}` : null, row?.summary?.license].filter(
    Boolean,
  );

  return (
    <div className="flex items-start gap-3 border-b py-3">
      <span className="mt-1 w-6 shrink-0 text-xs tabular-nums text-muted-foreground">{index + 1}</span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={packageHref(entry.name)} prefetch={false} className="truncate font-medium hover:underline">
            {entry.name}
          </Link>
          {group !== "prod" && <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">{group}</span>}
          <BumpBadge assessment={row?.assessment ?? null} pending={Boolean(row?.isPending)} />
          {row && <RiskCell advisories={row.advisories} deprecated={Boolean(row.summary?.deprecated)} failed={row.isError} />}
        </div>
        {row?.isPending ? (
          <Skeleton className="mt-1.5 h-4 w-2/3" />
        ) : (
          row?.summary?.description && <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{row.summary.description}</p>
        )}
        <p className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">
          <VersionPath row={row} target={entry.target} />
          {meta.length > 0 && (
            <>
              <span className="mx-1.5 font-sans opacity-40">·</span>
              <span className="font-sans">{meta.join(" · ")}</span>
            </>
          )}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <Tooltip content={`Copy ${spec}`}>
          <Button variant="ghost" size="icon-sm" aria-label={`Copy ${spec}`} onClick={onCopy}>
            <Copy />
          </Button>
        </Tooltip>
        <Button variant="ghost" size="icon-sm" aria-label={`Remove ${entry.name}`} onClick={onRemove}>
          <X />
        </Button>
      </div>
    </div>
  );
}

export function PlanPackageList({
  entries,
  details,
  onCopy,
  onRemove,
}: {
  entries: readonly PlanEntry[];
  details: ReadonlyMap<PackageName, RowModel>;
  onCopy: (entry: PlanEntry) => void;
  onRemove: (entry: PlanEntry) => void;
}) {
  "use no memo";
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: entries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_ESTIMATE,
    overscan: 8,
    measureElement:
      typeof window !== "undefined" && navigator.userAgent.indexOf("Firefox") === -1
        ? (element) => element.getBoundingClientRect().height
        : undefined,
  });

  return (
    <div ref={parentRef} role="list" aria-label="Packages in this plan" className="min-h-0 flex-1 overflow-auto">
      <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((item) => {
          const entry = entries[item.index];
          if (!entry) return null;
          const style: CSSProperties = {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            transform: `translateY(${item.start}px)`,
          };
          return (
            <div key={entry.key} ref={virtualizer.measureElement} data-index={item.index} role="listitem" style={style}>
              <PlanRow
                entry={entry}
                index={item.index}
                row={details.get(entry.name)}
                onCopy={() => onCopy(entry)}
                onRemove={() => onRemove(entry)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
