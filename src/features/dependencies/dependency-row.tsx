"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { memo, type CSSProperties } from "react";
import { cn } from "@/shared/lib/cn";
import { formatDownloads, formatGroup, formatRelativeDate } from "@/shared/lib/format";
import { packageHref } from "@/shared/lib/package-path";
import { packageQuery, releasesQuery } from "@/shared/query/options";
import { Skeleton } from "@/shared/ui/skeleton";
import { BumpBadge } from "./bump-badge";
import { RiskCell } from "./risk-cell";
import { RowActions } from "./row-actions";
import { type RowModel } from "./row-model";
import { DEPENDENCY_GRID } from "./table-layout";

export const DependencyRow = memo(function DependencyRow({ row, style }: { row: RowModel; style: CSSProperties }) {
  const { spec, summary, assessment, downloads, advisories, isPending, isError } = row;
  const queryClient = useQueryClient();
  const current = assessment && assessment.kind !== "unsupported" ? assessment.current : null;
  const latest = summary?.latest;
  const group = formatGroup(spec.group);

  const prefetch = () => {
    void queryClient.prefetchQuery(packageQuery(spec.name));
    if (summary?.repository) void queryClient.prefetchInfiniteQuery(releasesQuery(summary.repository));
  };

  return (
    <div role="row" style={style} className={cn(DEPENDENCY_GRID, "border-b border-border/70 text-sm hover:bg-muted/40")}>
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href={packageHref(spec.name)}
            prefetch={false}
            onMouseEnter={prefetch}
            onFocus={prefetch}
            title={spec.range}
            className="truncate font-medium hover:underline"
          >
            {spec.name}
          </Link>
          {group !== "prod" && <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">{group}</span>}
        </div>
      </div>
      <span className="whitespace-nowrap font-mono text-xs tabular-nums text-muted-foreground">
        {isPending ? (
          <Skeleton className="h-4 w-28" />
        ) : current && latest && current !== latest ? (
          <>
            <span className="text-foreground">{current}</span>
            <span className="mx-1.5 opacity-50">→</span>
            <span className="text-foreground">{latest}</span>
          </>
        ) : (
          (latest ?? current ?? "—")
        )}
      </span>
      <BumpBadge assessment={assessment} pending={isPending} />
      <span className="flex items-center gap-2 whitespace-nowrap text-xs text-muted-foreground">
        <span className="tabular-nums">{formatDownloads(downloads)}</span>
        <span className="opacity-40">·</span>
        <span>{formatRelativeDate(summary?.latestPublishedAt)}</span>
      </span>
      <RiskCell advisories={advisories} deprecated={Boolean(summary?.deprecated)} failed={isError} />
      <div className="flex justify-end">
        <RowActions name={spec.name} assessment={assessment} />
      </div>
    </div>
  );
});
