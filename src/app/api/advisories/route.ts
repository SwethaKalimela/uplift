import { z } from "zod";
import { fromError, json } from "@/server/http/respond";
import { getAdvisories } from "@/server/upstream/advisories";
import { PackageNameSchema, SemverStringSchema } from "@/shared/schemas/primitives";

const BodySchema = z.object({
  installed: z.record(PackageNameSchema, SemverStringSchema),
});

export async function POST(request: Request) {
  try {
    const { installed } = BodySchema.parse(await request.json());
    const sorted = Object.fromEntries(Object.entries(installed).sort(([a], [b]) => a.localeCompare(b)));
    return json(await getAdvisories(sorted));
  } catch (error) {
    return fromError(error);
  }
}
