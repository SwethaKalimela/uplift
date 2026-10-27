"use client";

import { memo, type CSSProperties } from "react";
import { formatDownloads, formatGroup, formatRelativeDate } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { BumpBadge } from "./bump-badge";
import { RowActions } from "./row-actions";
import { advisoryTone, type RowModel } from "./row-model";

export const DependencyRow = memo(function DependencyRow({ row, style }: { row: RowModel; style: CSSProperties }) {
  const { spec, summary, assessment, downloads, advisories, isPending, isError } = row;
  const tone = advisoryTone(advisories);

  return (
    <div
      role="row"
      style={style}
      className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,0.6fr)_auto] items-center gap-3 border-b px-4 text-sm"
    >
      <div className="min-w-0">
        <p className="truncate font-medium">{spec.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {formatGroup(spec.group)} · {spec.range}
        </p>
      </div>
      <span className="font-mono text-xs">{assessment && assessment.kind !== "unsupported" ? assessment.current : "—"}</span>
      <span className="font-mono text-xs">{isPending ? <Skeleton className="h-4 w-14" /> : (summary?.latest ?? "—")}</span>
      <BumpBadge assessment={assessment} pending={isPending} />
      <span className="text-xs text-muted-foreground">{formatDownloads(downloads)}</span>
      <span className="text-xs text-muted-foreground">{formatRelativeDate(summary?.latestPublishedAt)}</span>
      <div className="flex items-center justify-end gap-2">
        {summary?.deprecated && <Badge tone="danger">Deprecated</Badge>}
        {tone && <Badge tone={tone}>{advisories.length}</Badge>}
        {isError && <Badge tone="danger">Failed</Badge>}
        <RowActions name={spec.name} assessment={assessment} />
      </div>
    </div>
  );
});
