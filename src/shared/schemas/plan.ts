import { z } from "zod";
import { PackageNameSchema, PlanIdSchema, SemverStringSchema } from "./primitives";

export const PlanItemStatusSchema = z.enum(["todo", "upgraded", "skipped"]);
export type PlanItemStatus = z.infer<typeof PlanItemStatusSchema>;

export const PlanItemSchema = z.object({
  id: z.string().min(8),
  name: PackageNameSchema,
  target: SemverStringSchema,
  position: z.number().int().nonnegative(),
  note: z.string().max(500),
  status: PlanItemStatusSchema,
});
export type PlanItem = z.infer<typeof PlanItemSchema>;

export const PlanSchema = z.object({
  id: PlanIdSchema,
  name: z.string().min(1).max(80),
  projectName: z.string().nullable(),
  items: z.array(PlanItemSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Plan = z.infer<typeof PlanSchema>;

export const CreatePlanInputSchema = z.object({
  name: z.string().min(1).max(80).default("Upgrade plan"),
  projectName: z.string().nullable(),
  items: z
    .array(
      z.object({
        name: PackageNameSchema,
        target: SemverStringSchema,
        note: z.string().max(500).default(""),
      }),
    )
    .min(1)
    .max(400),
  fault: z.boolean().optional(),
});
export type CreatePlanInput = z.infer<typeof CreatePlanInputSchema>;

export const CreatePlanResultSchema = z.object({
  plan: PlanSchema,
  editToken: z.string(),
});
export type CreatePlanResult = z.infer<typeof CreatePlanResultSchema>;
