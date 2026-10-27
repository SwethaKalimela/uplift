"use client";

import { useWorkspace } from "@/shared/store/workspace";
import { DependencyTable } from "./dependency-table";

export function WorkspaceScreen() {
  const project = useWorkspace((state) => state.project);
  if (!project) return null;

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <DependencyTable />
    </main>
  );
}
