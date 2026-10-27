import { describe, expect, it } from "vitest";
import { parseManifest } from "./manifest";

describe("parseManifest", () => {
  it("collects dependencies from every group and keeps the first occurrence", () => {
    const result = parseManifest(
      JSON.stringify({
        name: "shop",
        dependencies: { react: "^19.0.0", zod: "^3.23.0" },
        devDependencies: { typescript: "^5.6.0", react: "^18.0.0" },
        peerDependencies: { "@types/react": "^19.0.0" },
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.manifest.projectName).toBe("shop");
    expect(result.manifest.dependencies.map((d) => [d.name, d.group])).toEqual([
      ["react", "dependencies"],
      ["zod", "dependencies"],
      ["typescript", "devDependencies"],
      ["@types/react", "peerDependencies"],
    ]);
  });

  it("skips names npm would reject", () => {
    const result = parseManifest(JSON.stringify({ dependencies: { "Bad Name": "1.0.0", lodash: "^4.17.21" } }));
    expect(result.ok && result.manifest.skipped).toEqual(["Bad Name"]);
  });

  it("explains invalid JSON and empty manifests", () => {
    expect(parseManifest("{ nope")).toMatchObject({ ok: false });
    expect(parseManifest(JSON.stringify({ name: "empty" }))).toMatchObject({ ok: false });
  });

  it("rejects dependency maps that are not strings", () => {
    expect(parseManifest(JSON.stringify({ dependencies: { react: 19 } }))).toMatchObject({ ok: false });
  });
});
