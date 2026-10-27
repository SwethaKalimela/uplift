"use client";

import { ImportScreen } from "@/features/import/import-screen";
import { useStoreHydrated } from "@/shared/store/hydration";
import { useWorkspace } from "@/shared/store/workspace";

export default function HomePage() {
  const hydrated = useStoreHydrated();
  const project = useWorkspace((state) => state.project);

  if (!hydrated) {
    return (
      <main className="mx-auto flex max-w-3xl flex-col gap-3 px-6 py-24">
        <div className="h-10 w-2/3 animate-pulse rounded-md bg-muted" />
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
      </main>
    );
  }

  if (!project) return <ImportScreen />;

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">{project.name ?? "Untitled project"}</h1>
      <p className="text-muted-foreground">
        {project.dependencies.length} packages from {project.source}. The table lands in the next commit.
      </p>
    </main>
  );
}
