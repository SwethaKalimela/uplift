"use client";

import { useCallback, useState } from "react";
import { parseManifest } from "@/shared/domain/manifest";
import { useWorkspace } from "@/shared/store/workspace";
import type { ProjectSource } from "@/shared/store/types";

export function useImport() {
  const [error, setError] = useState<string | null>(null);
  const [skipped, setSkipped] = useState<string[]>([]);
  const setProject = useWorkspace((state) => state.setProject);

  const importText = useCallback(
    (text: string, source: ProjectSource, nameHint?: string) => {
      const result = parseManifest(text);
      if (!result.ok) {
        setError(result.error);
        setSkipped([]);
        return false;
      }

      setError(null);
      setSkipped(result.manifest.skipped);
      setProject({
        name: result.manifest.projectName ?? nameHint ?? null,
        dependencies: result.manifest.dependencies,
        source,
      });
      return true;
    },
    [setProject],
  );

  const importFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith(".json") && file.type !== "application/json") {
        setError("Drop a package.json file.");
        return false;
      }
      return importText(await file.text(), "file", file.name.replace(/\.json$/, ""));
    },
    [importText],
  );

  return { error, skipped, importText, importFile, clearError: () => setError(null) };
}
