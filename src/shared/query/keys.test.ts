import { matchQuery, QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type { PackageName } from "@/shared/schemas/primitives";
import { isPackageKey, queryKeys } from "./keys";

const name = (value: string) => value as PackageName;

describe("queryKeys", () => {
  it("nests every package key under the packages prefix", () => {
    const client = new QueryClient();
    const query = client.getQueryCache().build(client, { queryKey: queryKeys.package(name("react")) });

    expect(matchQuery({ queryKey: queryKeys.packages() }, query)).toBe(true);
    expect(matchQuery({ queryKey: queryKeys.all() }, query)).toBe(true);
    expect(matchQuery({ queryKey: queryKeys.plans() }, query)).toBe(false);
  });

  it("gives the same downloads key regardless of input order", () => {
    expect(queryKeys.downloads([name("zod"), name("react")])).toEqual(queryKeys.downloads([name("react"), name("zod")]));
  });

  it("treats repository names case-insensitively", () => {
    expect(queryKeys.releases({ owner: "TanStack", repo: "Query" })).toEqual(queryKeys.releases({ owner: "tanstack", repo: "query" }));
  });

  it("recognises package keys", () => {
    expect(isPackageKey(queryKeys.package(name("zod")))).toBe(true);
    expect(isPackageKey(queryKeys.packages())).toBe(false);
  });
});
