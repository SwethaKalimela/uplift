"use client";

import { DropZone } from "./drop-zone";
import { SampleGrid } from "./sample-grid";

export function ImportScreen() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-primary">Dependency planner</p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance">Know what an upgrade costs before you run it.</h1>
        <p className="text-lg text-muted-foreground text-pretty">
          Paste a package.json. Uplift checks the npm registry for latest versions, deprecations and advisories, then
          helps you turn the result into a plan.
        </p>
      </div>
      <DropZone />
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Or start from a sample</h2>
        <SampleGrid />
      </section>
    </main>
  );
}
