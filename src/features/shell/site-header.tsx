"use client";

import { Activity, ArrowUpCircle, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { PlanCartButton } from "@/features/plan/plan-cart";
import { useStoreHydrated } from "@/shared/store/hydration";
import { useWorkspace } from "@/shared/store/workspace";
import { Button } from "@/shared/ui/button";
import { Kbd } from "@/shared/ui/kbd";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { Tooltip } from "@/shared/ui/tooltip";

export function SiteHeader() {
  const hydrated = useStoreHydrated();
  const pathname = usePathname();
  const project = useWorkspace((state) => state.project);
  const clearProject = useWorkspace((state) => state.clearProject);
  const clearDraft = useWorkspace((state) => state.clearDraft);
  const resetFilters = useWorkspace((state) => state.resetFilters);
  const setCommandOpen = useWorkspace((state) => state.setCommandOpen);
  const setInspectorOpen = useWorkspace((state) => state.setInspectorOpen);
  const previousPath = useRef(pathname);

  useEffect(() => {
    if (!hydrated) return;
    const previous = previousPath.current;
    previousPath.current = pathname;
    if (previous === pathname) return;
    resetFilters();
  }, [hydrated, pathname, resetFilters]);

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-5">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <ArrowUpCircle className="size-5 text-primary" />
          Uplift
        </Link>
        {hydrated && project ? (
          <>
            <span className="text-border">/</span>
            <h1 className="min-w-0 truncate text-sm font-medium">{project.name ?? "Untitled project"}</h1>
          </>
        ) : (
          <span className="hidden text-sm text-muted-foreground sm:inline">Plan dependency upgrades before you run them</span>
        )}
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCommandOpen(true)}
            className="hidden h-8 gap-2 border-transparent bg-muted text-muted-foreground hover:text-foreground sm:inline-flex"
          >
            <Search />
            Search
            <Kbd className="ml-4">⌘K</Kbd>
          </Button>
          {hydrated && project && <PlanCartButton />}
          <Tooltip content="Query cache">
            <Button variant="ghost" size="icon-sm" aria-label="Open cache inspector" onClick={() => setInspectorOpen(true)}>
              <Activity />
            </Button>
          </Tooltip>
          {hydrated && project && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearDraft();
                clearProject();
              }}
            >
              New project
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
