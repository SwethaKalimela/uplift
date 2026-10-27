"use client";

import { ClipboardList, Copy, FileText, Link2, Trash2 } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useMemo } from "react";
import type { RowModel } from "@/features/dependencies/row-model";
import { useStoreHydrated } from "@/shared/store/hydration";
import { Button } from "@/shared/ui/button";
import { Tooltip } from "@/shared/ui/tooltip";
import { toSpec } from "./export";
import { PlanPackageList, type PlanEntry } from "./plan-package-list";
import { usePlanSummary } from "./plan-summary";
import { usePlanRows } from "./use-plan-rows";

function PlanStats({ rows }: { rows: RowModel[] }) {
  if (!rows.some((row) => !row.isPending)) return null;

  const stats = { major: 0, minor: 0, patch: 0, advisories: 0, deprecated: 0 };
  for (const row of rows) {
    if (row.assessment?.kind === "behind") stats[row.assessment.bump] += 1;
    stats.advisories += row.advisories.length;
    if (row.summary?.deprecated) stats.deprecated += 1;
  }

  const items = [
    { value: stats.major, label: "Major", className: "text-major" },
    { value: stats.minor, label: "Minor", className: "text-minor" },
    { value: stats.patch, label: "Patch", className: "text-patch" },
    { value: stats.advisories, label: stats.advisories === 1 ? "Advisory" : "Advisories", className: "text-danger" },
    { value: stats.deprecated, label: "Deprecated", className: "text-danger" },
  ].filter((item) => item.value > 0);

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
      {items.map((item) => (
        <p key={item.label} className="flex items-baseline gap-1.5">
          <span className={`text-lg font-semibold tabular-nums ${item.className}`}>{item.value}</span>
          <span className="text-sm text-muted-foreground">{item.label}</span>
        </p>
      ))}
    </div>
  );
}

function sharePath(id: string) {
  return `/p/${id}` as Route;
}

export function PlanPageScreen() {
  const hydrated = useStoreHydrated();
  const { title, count, empty, draft, items, savedPlanId, exported, projectName, create, clearDraft, copy, patchItem, removeFromDraft } =
    usePlanSummary();

  const entries: PlanEntry[] = useMemo(
    () => draft.map((item) => ({ key: item.name, name: item.name, target: item.target })),
    [draft],
  );

  const names = useMemo(() => entries.map((entry) => entry.name), [entries]);
  const details = usePlanRows(names);
  const detailRows = useMemo(() => [...details.values()], [details]);
  const shareUrl = savedPlanId && hydrated ? `${window.location.origin}${sharePath(savedPlanId)}` : null;

  if (!hydrated) {
    return (
      <main className="mx-auto flex max-w-3xl flex-col gap-3 px-6 py-24">
        <div className="h-10 w-2/3 animate-pulse rounded-md bg-muted" />
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
      </main>
    );
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col px-5 pt-4">
        <div className="flex shrink-0 flex-col gap-4 pb-4">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Back to table
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 flex size-10 items-center justify-center rounded-lg border bg-surface">
                <FileText className="size-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                <p className="text-sm text-muted-foreground">
                  {empty ? "No packages yet" : `${count} package${count === 1 ? "" : "s"} to upgrade`}
                  {projectName ? ` in ${projectName}` : ""}
                </p>
              </div>
            </div>
            {draft.length > 0 && (
              <Button variant="ghost" size="sm" className="rounded-lg text-danger hover:bg-danger/20 hover:text-danger" onClick={clearDraft}>
                <Trash2 />
                Remove all
              </Button>
            )}
          </div>
          {!empty && <PlanStats rows={detailRows} />}
        </div>
        {empty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 text-center">
            <FileText className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Add outdated packages from the table, then come back here to review the plan.</p>
            <Link href="/" className="text-sm font-medium text-primary hover:underline">
              Go to table
            </Link>
          </div>
        ) : (
          <>
            <PlanPackageList
              entries={entries}
              details={details}
              onCopy={(entry) => void copy(toSpec(entry.name, entry.target), `Copied ${toSpec(entry.name, entry.target)}`)}
              onRemove={(entry) => {
                removeFromDraft(entry.name);
                const saved = items.find((item) => item.name === entry.name);
                if (saved) patchItem.mutate({ itemId: saved.id, status: "skipped" });
              }}
            />
            <div className="sticky bottom-0 z-10 shrink-0 border-t bg-background py-3">
              {exported.install && (
                <div className="mb-2 flex items-center gap-2 rounded-lg bg-muted/70 px-3 py-1.5">
                  <code className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">{exported.install}</code>
                  <Tooltip content="Copy install command">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Copy install command"
                      onClick={() => void copy(exported.install, "Install command copied")}
                    >
                      <Copy />
                    </Button>
                  </Tooltip>
                </div>
              )}
              {savedPlanId ? (
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <Button size="sm" className="shrink-0" onClick={() => void copy(shareUrl ?? "", "Share link copied")}>
                    <Copy />
                    Copy share link
                  </Button>
                  <Button variant="secondary" size="sm" className="shrink-0" onClick={() => void copy(exported.markdown, "Markdown copied")}>
                    <ClipboardList />
                    Copy checklist
                  </Button>
                  {shareUrl && (
                    <Link href={sharePath(savedPlanId)} className="min-w-0 truncate font-mono text-xs text-muted-foreground hover:text-foreground">
                      {shareUrl}
                    </Link>
                  )}
                </div>
              ) : (
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" onClick={() => create.mutate()} disabled={create.isPending}>
                      <Link2 />
                      {create.isPending ? "Creating link" : "Create share link"}
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => void copy(exported.markdown, "Markdown copied")}>
                      <ClipboardList />
                      Copy checklist
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Public, read-only page anyone with the link can open.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
