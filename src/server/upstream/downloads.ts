import "server-only";

import { cacheLife } from "next/cache";
import { z } from "zod";
import { mapWithLimit } from "@/shared/lib/limiter";
import type { PackageName } from "@/shared/schemas/primitives";
import type { Downloads } from "@/shared/schemas/registry";
import { fetchUpstream } from "./http";

const API = "https://api.npmjs.org/downloads/point/last-week";
const BULK_LIMIT = 128;

const PointSchema = z.object({ downloads: z.number(), package: z.string() });
const BulkSchema = z.record(z.string(), PointSchema.nullable());

async function fetchBulk(names: string[]): Promise<Downloads> {
  const response = await fetchUpstream(`${API}/${names.join(",")}`);
  if (!response.ok) return Object.fromEntries(names.map((name) => [name, null]));

  const json: unknown = await response.json();
  if (names.length === 1) {
    const point = PointSchema.safeParse(json);
    return { [names[0] as string]: point.success ? point.data.downloads : null };
  }

  const bulk = BulkSchema.safeParse(json);
  if (!bulk.success) return Object.fromEntries(names.map((name) => [name, null]));
  return Object.fromEntries(names.map((name) => [name, bulk.data[name]?.downloads ?? null]));
}

export async function getWeeklyDownloads(names: readonly PackageName[]): Promise<Downloads> {
  "use cache";
  cacheLife("days");

  const unscoped = names.filter((name) => !name.startsWith("@"));
  const scoped = names.filter((name) => name.startsWith("@"));

  const chunks: string[][] = [];
  for (let index = 0; index < unscoped.length; index += BULK_LIMIT) {
    chunks.push(unscoped.slice(index, index + BULK_LIMIT));
  }

  const results = await Promise.all([
    ...chunks.map((chunk) => fetchBulk(chunk)),
    mapWithLimit(scoped, 6, (name) => fetchBulk([name])).then((parts) => Object.assign({}, ...parts) as Downloads),
  ]);

  return Object.assign({}, ...results) as Downloads;
}
