import { describe, expect, it } from "vitest";
import type { DependencySpec } from "@/shared/domain/manifest";
import { PackageNameSchema, SemverStringSchema } from "@/shared/schemas/primitives";
import { defaultFilters } from "@/shared/store/slices";
import { filterRows, sortRows, type RowModel } from "./row-model";

const v = (value: string) => SemverStringSchema.parse(value);

const spec = (name: string, group: DependencySpec["group"] = "dependencies"): DependencySpec => ({
  name: PackageNameSchema.parse(name),
  range: "^1.0.0",
  group,
});

function row(partial: Partial<RowModel> & { spec: DependencySpec }): RowModel {
  return {
    assessment: null,
    summary: undefined,
    downloads: undefined,
    advisories: [],
    isPending: false,
    isError: false,
    ...partial,
  };
}

describe("filterRows", () => {
  const rows = [
    row({ spec: spec("react"), assessment: { kind: "behind", bump: "major", current: v("18.0.0"), latest: v("19.0.0"), inRange: false } }),
    row({ spec: spec("zod", "devDependencies"), assessment: { kind: "behind", bump: "patch", current: v("3.24.0"), latest: v("3.24.2"), inRange: true } }),
    row({ spec: spec("next"), assessment: { kind: "current", current: v("16.4.3"), latest: v("16.4.3") } }),
  ];

  it("filters by search, group and bump", () => {
    expect(filterRows(rows, { ...defaultFilters, search: "re" }).map((item) => item.spec.name)).toEqual(["react"]);
    expect(filterRows(rows, { ...defaultFilters, group: "devDependencies" }).map((item) => item.spec.name)).toEqual(["zod"]);
    expect(filterRows(rows, { ...defaultFilters, bump: "major" }).map((item) => item.spec.name)).toEqual(["react"]);
  });
});

describe("sortRows", () => {
  it("puts majors first when sorting by bump descending", () => {
    const rows = [
      row({ spec: spec("a"), assessment: { kind: "current", current: v("1.0.0"), latest: v("1.0.0") } }),
      row({ spec: spec("b"), assessment: { kind: "behind", bump: "major", current: v("1.0.0"), latest: v("2.0.0"), inRange: false } }),
      row({ spec: spec("c"), assessment: { kind: "behind", bump: "patch", current: v("1.0.0"), latest: v("1.0.1"), inRange: true } }),
    ];
    expect(sortRows(rows, { key: "bump", direction: "desc" }).map((item) => item.spec.name)).toEqual(["b", "c", "a"]);
  });
});
