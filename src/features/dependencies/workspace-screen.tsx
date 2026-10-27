"use client";

import { PlanPanel } from "@/features/plan/plan-panel";
import { useWorkspace } from "@/shared/store/workspace";
import { DependencyTable } from "./dependency-table";

export function WorkspaceScreen() {
  const project = useWorkspace((state) => state.project);
  if (!project) return null;

  return (
    <main className="mx-auto flex h-[calc(100dvh-3.5rem)] max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{project.name ?? "Untitled project"}</h1>
        <p className="text-sm text-muted-foreground">{project.dependencies.length} packages</p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <DependencyTable />
        <PlanPanel />
      </div>
    </main>
  );
}
