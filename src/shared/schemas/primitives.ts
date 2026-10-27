import { z } from "zod";

const NPM_NAME = /^(?:@[a-z0-9][a-z0-9._~-]*\/)?[a-z0-9][a-z0-9._~-]*$/;

export const PackageNameSchema = z.string().trim().toLowerCase().max(214).regex(NPM_NAME).brand<"PackageName">();
export type PackageName = z.infer<typeof PackageNameSchema>;

export const SemverStringSchema = z
  .string()
  .regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/)
  .brand<"SemverString">();
export type SemverString = z.infer<typeof SemverStringSchema>;

export const PlanIdSchema = z.string().regex(/^[A-Za-z0-9_-]{10,32}$/).brand<"PlanId">();
export type PlanId = z.infer<typeof PlanIdSchema>;

export const DependencyGroupSchema = z.enum(["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]);
export type DependencyGroup = z.infer<typeof DependencyGroupSchema>;

export function toPackageName(value: string): PackageName | null {
  const result = PackageNameSchema.safeParse(value);
  return result.success ? result.data : null;
}
