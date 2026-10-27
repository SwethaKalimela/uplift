"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { RowModel } from "@/features/dependencies/row-model";
import { assess } from "@/shared/domain/bump";
import type { DependencySpec } from "@/shared/domain/manifest";
import { advisoriesQuery, downloadsQuery, packageQuery } from "@/shared/query/options";
import type { PackageName, SemverString } from "@/shared/schemas/primitives";
import { useWorkspace } from "@/shared/store/workspace";

export function usePlanRows(names: readonly PackageName[]) {
  const dependencies = useWorkspace((state) => state.project?.dependencies);
  const specByName = useMemo(() => {
    const map = new Map<PackageName, DependencySpec>();
    for (const spec of dependencies ?? []) map.set(spec.name, spec);
    return map;
  }, [dependencies]);

  const packageQueries = useMemo(() => names.map((name) => packageQuery(name)), [names]);
  const packageResults = useQueries({ queries: packageQueries });
  const downloads = useQuery(downloadsQuery(names));

  const rows = useMemo(() => {
    const map = new Map<PackageName, RowModel>();
    names.forEach((name, index) => {
      const spec = specByName.get(name) ?? { name, range: "", group: "dependencies" as const };
      const result = packageResults[index];
      const summary = result?.data;
      const assessment = summary && specByName.has(name) ? assess(spec.range, summary.latest) : null;
      map.set(name, {
        spec,
        assessment,
        summary,
        downloads: undefined,
        advisories: [],
        isPending: result?.isPending ?? true,
        isError: result?.isError ?? false,
      });
    });
    return map;
  }, [names, specByName, packageResults]);

  const installed = useMemo(() => {
    const versions: Record<string, SemverString> = {};
    for (const row of rows.values()) {
      if (row.assessment && row.assessment.kind !== "unsupported") versions[row.spec.name] = row.assessment.current;
    }
    return versions;
  }, [rows]);

  const advisories = useQuery(advisoriesQuery(installed));

  return useMemo(() => {
    const map = new Map<PackageName, RowModel>();
    for (const [name, row] of rows) {
      map.set(name, {
        ...row,
        downloads: downloads.data?.[name],
        advisories: advisories.data?.[name] ?? [],
      });
    }
    return map;
  }, [rows, downloads.data, advisories.data]);
}
