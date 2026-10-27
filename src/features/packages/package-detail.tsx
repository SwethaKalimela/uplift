"use client";

import { QueryErrorResetBoundary, useSuspenseQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { Suspense, type ReactNode } from "react";
import { formatRelativeDate } from "@/shared/lib/format";
import { ApiError } from "@/shared/query/errors";
import { packageQuery } from "@/shared/query/options";
import type { PackageName } from "@/shared/schemas/primitives";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ErrorBoundary, type FallbackProps } from "@/shared/ui/error-boundary";
import { Skeleton } from "@/shared/ui/skeleton";
import { ReleaseList } from "./release-list";

function DetailFallback({ error, resetErrorBoundary }: FallbackProps) {
  const notFound = error instanceof ApiError && error.isNotFound;
  return (
    <div className="flex flex-col gap-3 p-2">
      <AlertTriangle className="size-5 text-danger" />
      <p className="font-medium">{notFound ? "Package not found on npm" : "Could not load this package"}</p>
      <p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : "Unknown error"}</p>
      {!notFound && (
        <Button size="sm" variant="secondary" onClick={resetErrorBoundary}>
          Retry
        </Button>
      )}
    </div>
  );
}

function PackageBody({ name }: { name: PackageName }) {
  const { data } = useSuspenseQuery(packageQuery(name));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold tracking-tight">{data.name}</h2>
          <Badge tone="outline">{data.latest}</Badge>
          {data.deprecated && <Badge tone="danger">Deprecated</Badge>}
        </div>
        {data.description && <p className="text-sm text-muted-foreground">{data.description}</p>}
        <p className="text-xs text-muted-foreground">
          {data.license ?? "No license"} · published {formatRelativeDate(data.latestPublishedAt)} · {data.versionCount} versions
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          {data.homepage && (
            <a href={data.homepage} target="_blank" rel="noreferrer" className="text-primary hover:underline">
              Homepage
            </a>
          )}
          {data.repository && (
            <a
              href={`https://github.com/${data.repository.owner}/${data.repository.repo}`}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              {data.repository.owner}/{data.repository.repo}
            </a>
          )}
        </div>
      </div>
      {data.deprecated && (
        <p className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{data.deprecated}</p>
      )}
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Recent versions</h3>
        <ul className="flex flex-col gap-1 font-mono text-xs">
          {data.versions.slice(0, 12).map((entry) => (
            <li key={entry.version} className="flex justify-between gap-3">
              <span>{entry.version}</span>
              <span className="text-muted-foreground">{formatRelativeDate(entry.publishedAt)}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Release notes</h3>
        {data.repository ? (
          <ReleaseList repo={data.repository} />
        ) : (
          <p className="text-sm text-muted-foreground">No GitHub repository listed on this package.</p>
        )}
      </section>
    </div>
  );
}

export function PackageDetail({ name, footer }: { name: PackageName; footer?: ReactNode }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary fallbackRender={DetailFallback} onReset={reset}>
          <Suspense
            fallback={
              <div className="flex flex-col gap-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-20" />
                <Skeleton className="h-40" />
              </div>
            }
          >
            <PackageBody name={name} />
            {footer}
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
