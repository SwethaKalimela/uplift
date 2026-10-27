"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { assess } from "@/shared/domain/bump";
import type { DependencySpec } from "@/shared/domain/manifest";
import { advisoriesQuery, downloadsQuery, packageQuery } from "@/shared/query/options";
import type { SemverString } from "@/shared/schemas/primitives";
import { useWorkspace } from "@/shared/store/workspace";
import { filterRows, sortRows, type RowModel } from "./row-model";

function installedVersions(rows: readonly RowModel[]) {
  const installed: Record<string, SemverString> = {};
  for (const row of rows) {
    if (row.assessment && row.assessment.kind !== "unsupported") installed[row.spec.name] = row.assessment.current;
  }
  return installed;
}

export function useDependencyRows(dependencies: readonly DependencySpec[]) {
  const filters = useWorkspace((state) => state.filters);
  const sort = useWorkspace((state) => state.sort);
  const names = useMemo(() => dependencies.map((spec) => spec.name), [dependencies]);
  const packageQueries = useMemo(() => names.map((name) => packageQuery(name)), [names]);

  const packageResults = useQueries({
    queries: packageQueries,
    combine: (results) => results,
  });

  const downloads = useQuery(downloadsQuery(names));

  const rows: RowModel[] = useMemo(
    () =>
      dependencies.map((spec, index) => {
        const result = packageResults[index];
        const summary = result?.data;
        const assessment = summary ? assess(spec.range, summary.latest) : null;
        return {
          spec,
          assessment,
          summary,
          downloads: undefined,
          advisories: [],
          isPending: result?.isPending ?? true,
          isError: result?.isError ?? false,
        };
      }),
    [dependencies, packageResults],
  );

  const installed = useMemo(() => installedVersions(rows), [rows]);
  const advisories = useQuery(advisoriesQuery(installed));

  const withExtras: RowModel[] = useMemo(
    () =>
      rows.map((row) => ({
        ...row,
        downloads: downloads.data?.[row.spec.name],
        advisories: advisories.data?.[row.spec.name] ?? [],
      })),
    [rows, downloads.data, advisories.data],
  );

  const visible = useMemo(() => sortRows(filterRows(withExtras, filters), sort), [withExtras, filters, sort]);

  return {
    rows: withExtras,
    visible,
    fetchingPackages: packageResults.filter((result) => result.isFetching).length,
  };
}
