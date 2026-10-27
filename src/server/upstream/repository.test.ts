import { describe, expect, it } from "vitest";
import { parseGitHubRepo } from "./repository";

describe("parseGitHubRepo", () => {
  it.each([
    ["git+https://github.com/vercel/next.js.git", { owner: "vercel", repo: "next.js" }],
    ["https://github.com/TanStack/query/tree/main/packages/react-query", { owner: "TanStack", repo: "query" }],
    ["git@github.com:pmndrs/zustand.git", { owner: "pmndrs", repo: "zustand" }],
    ["github:colinhacks/zod", { owner: "colinhacks", repo: "zod" }],
    ["facebook/react", { owner: "facebook", repo: "react" }],
  ])("reads %s", (input, expected) => {
    expect(parseGitHubRepo(input)).toEqual(expected);
  });

  it("accepts the object form and ignores other hosts", () => {
    expect(parseGitHubRepo({ url: "https://github.com/npm/cli" })).toEqual({ owner: "npm", repo: "cli" });
    expect(parseGitHubRepo("https://gitlab.com/group/project")).toBeNull();
    expect(parseGitHubRepo(undefined)).toBeNull();
  });
});
