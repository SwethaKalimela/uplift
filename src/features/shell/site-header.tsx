"use client";

import { Activity, ArrowUpCircle, Search } from "lucide-react";
import Link from "next/link";
import { useStoreHydrated } from "@/shared/store/hydration";
import { useWorkspace } from "@/shared/store/workspace";
import { Button } from "@/shared/ui/button";
import { Kbd } from "@/shared/ui/kbd";
import { ThemeToggle } from "@/shared/ui/theme-toggle";

export function SiteHeader() {
  const hydrated = useStoreHydrated();
  const project = useWorkspace((state) => state.project);
  const clearProject = useWorkspace((state) => state.clearProject);
  const clearDraft = useWorkspace((state) => state.clearDraft);
  const setCommandOpen = useWorkspace((state) => state.setCommandOpen);
  const setInspectorOpen = useWorkspace((state) => state.setInspectorOpen);

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <ArrowUpCircle className="size-5 text-primary" />
          Uplift
        </Link>
        {hydrated && project ? (
          <span className="hidden truncate text-sm text-muted-foreground sm:inline">{project.name ?? "Untitled project"}</span>
        ) : (
          <span className="hidden text-sm text-muted-foreground sm:inline">Plan dependency upgrades before you run them</span>
        )}
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setCommandOpen(true)} className="hidden sm:inline-flex">
            <Search />
            Search
            <Kbd>⌘K</Kbd>
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Open cache inspector" onClick={() => setInspectorOpen(true)}>
            <Activity />
          </Button>
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
