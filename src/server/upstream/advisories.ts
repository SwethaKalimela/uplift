import "server-only";

import { cacheLife } from "next/cache";
import { z } from "zod";
import type { Advisories } from "@/shared/schemas/registry";
import { AdvisorySeveritySchema } from "@/shared/schemas/registry";
import { fetchUpstream, readJson } from "./http";

const ENDPOINT = "https://registry.npmjs.org/-/npm/v1/security/advisories/bulk";

const BulkAdvisorySchema = z.record(
  z.string(),
  z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      url: z.string(),
      severity: z.string(),
      vulnerable_versions: z.string(),
    }),
  ),
);

export async function getAdvisories(installed: Record<string, string>): Promise<Advisories> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 900, expire: 3600 });

  const body = Object.fromEntries(Object.entries(installed).map(([name, version]) => [name, [version]]));
  if (Object.keys(body).length === 0) return {};

  const response = await fetchUpstream(ENDPOINT, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });

  const parsed = BulkAdvisorySchema.parse(await readJson("npm advisories", response));

  return Object.fromEntries(
    Object.entries(parsed).map(([name, advisories]) => [
      name,
      advisories.flatMap((advisory) => {
        const severity = AdvisorySeveritySchema.safeParse(advisory.severity);
        if (!severity.success) return [];
        return [
          {
            id: advisory.id,
            title: advisory.title,
            url: advisory.url,
            severity: severity.data,
            vulnerableVersions: advisory.vulnerable_versions,
          },
        ];
      }),
    ]),
  );
}
