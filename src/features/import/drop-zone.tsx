"use client";

import { Upload } from "lucide-react";
import { type DragEvent, type FormEvent, useRef, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/input";
import { useImport } from "./use-import";

export function DropZone() {
  const { error, skipped, importText, importFile } = useImport();
  const [draft, setDraft] = useState("");
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setOver(false);
    const file = event.dataTransfer.files[0];
    if (file) void importFile(file);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    importText(draft, "paste");
  };

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      className={cn(
        "rounded-xl border border-dashed bg-surface p-5 shadow-sm transition-colors",
        over && "border-primary bg-accent",
      )}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <Upload className="mt-0.5 size-5 text-primary" />
          <div>
            <p className="font-medium">Paste a package.json, or drop the file here</p>
            <p className="text-sm text-muted-foreground">Reads dependencies, devDependencies, peerDependencies and optionalDependencies.</p>
          </div>
        </div>
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          spellCheck={false}
          rows={10}
          className="font-mono text-xs"
          placeholder='{ "dependencies": { "next": "^15.0.0" } }'
          aria-label="package.json contents"
        />
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        {skipped.length > 0 && (
          <p className="text-sm text-muted-foreground">Skipped invalid names: {skipped.join(", ")}</p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={draft.trim().length === 0}>
            Scan dependencies
          </Button>
          <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
            Choose file
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void importFile(file);
              event.target.value = "";
            }}
          />
        </div>
      </form>
    </div>
  );
}
