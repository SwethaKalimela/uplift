import { z } from "zod";
import { fromError, json } from "@/server/http/respond";
import { getWeeklyDownloads } from "@/server/upstream/downloads";
import { PackageNameSchema } from "@/shared/schemas/primitives";

const BodySchema = z.object({
  names: z.array(PackageNameSchema).min(1).max(400),
});

export async function POST(request: Request) {
  try {
    const { names } = BodySchema.parse(await request.json());
    const unique = [...new Set(names)].sort();
    return json(await getWeeklyDownloads(unique));
  } catch (error) {
    return fromError(error);
  }
}
