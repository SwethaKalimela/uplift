import { z } from "zod";
import { DependencyGroupSchema, type DependencyGroup, type PackageName, toPackageName } from "@/shared/schemas/primitives";

export type DependencySpec = {
  name: PackageName;
  range: string;
  group: DependencyGroup;
};

export type Manifest = {
  projectName: string | null;
  dependencies: DependencySpec[];
  skipped: string[];
};

export type ParseResult = { ok: true; manifest: Manifest } | { ok: false; error: string };

const DependencyMapSchema = z.record(z.string(), z.string()).optional();

const ManifestSchema = z.object({
  name: z.string().optional(),
  dependencies: DependencyMapSchema,
  devDependencies: DependencyMapSchema,
  peerDependencies: DependencyMapSchema,
  optionalDependencies: DependencyMapSchema,
});

export const MAX_DEPENDENCIES = 400;

export function parseManifest(text: string): ParseResult {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: "That is not valid JSON. Paste the full contents of a package.json file." };
  }

  const parsed = ManifestSchema.safeParse(json);
  if (!parsed.success) {
    return { ok: false, error: "Dependency fields must map package names to version ranges." };
  }

  const seen = new Set<string>();
  const dependencies: DependencySpec[] = [];
  const skipped: string[] = [];

  for (const group of DependencyGroupSchema.options) {
    const entries = parsed.data[group];
    if (!entries) continue;
    for (const [rawName, range] of Object.entries(entries)) {
      const name = toPackageName(rawName);
      if (name === null) {
        skipped.push(rawName);
        continue;
      }
      if (seen.has(name)) continue;
      seen.add(name);
      dependencies.push({ name, range, group });
    }
  }

  if (dependencies.length === 0) {
    return { ok: false, error: "No dependencies found. Uplift reads dependencies, devDependencies, peerDependencies and optionalDependencies." };
  }

  if (dependencies.length > MAX_DEPENDENCIES) {
    return { ok: false, error: `That manifest has ${dependencies.length} dependencies. Uplift handles up to ${MAX_DEPENDENCIES} at once.` };
  }

  return {
    ok: true,
    manifest: {
      projectName: parsed.data.name ?? null,
      dependencies,
      skipped,
    },
  };
}
