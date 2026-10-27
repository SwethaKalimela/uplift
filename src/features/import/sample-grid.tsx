"use client";

import { Button } from "@/shared/ui/button";
import { SAMPLE_PROJECTS } from "./samples";
import { useImport } from "./use-import";

export function SampleGrid() {
  const { importText } = useImport();

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {SAMPLE_PROJECTS.map((sample) => (
        <article key={sample.id} className="flex flex-col gap-3 rounded-xl border bg-surface p-4 shadow-sm">
          <div className="flex-1">
            <h3 className="font-medium">{sample.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{sample.description}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => importText(sample.text, "sample", sample.title)}>
            Open sample
          </Button>
        </article>
      ))}
    </div>
  );
}
