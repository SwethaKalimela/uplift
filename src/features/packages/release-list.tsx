"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { formatRelativeDate } from "@/shared/lib/format";
import { releasesQuery } from "@/shared/query/options";
import type { GitHubRepo } from "@/shared/schemas/registry";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

export function ReleaseList({ repo }: { repo: GitHubRepo }) {
  const query = useInfiniteQuery(releasesQuery(repo));
  const releases = query.data?.pages.flatMap((page) => page.releases) ?? [];

  if (query.isPending) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm">
        <p>Could not load release notes from GitHub.</p>
        <p className="mt-1 text-muted-foreground">{query.error.message}</p>
        <Button size="sm" variant="secondary" className="mt-2" onClick={() => query.refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (releases.length === 0) {
    return <p className="text-sm text-muted-foreground">No GitHub releases for this repository.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {releases.map((release) => (
        <article key={release.id} className="rounded-lg border p-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <a href={release.url} target="_blank" rel="noreferrer" className="font-medium hover:underline">
              {release.name ?? release.tagName}
            </a>
            <span className="text-xs text-muted-foreground">{formatRelativeDate(release.publishedAt)}</span>
          </div>
          {release.body ? (
            <pre className="mt-2 max-h-64 overflow-auto font-sans text-xs whitespace-pre-wrap text-muted-foreground">
              {release.body}
            </pre>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">No notes for {release.tagName}.</p>
          )}
        </article>
      ))}
      {query.hasNextPage && (
        <Button variant="secondary" size="sm" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>
          {query.isFetchingNextPage ? "Loading" : "Load older releases"}
        </Button>
      )}
    </div>
  );
}
