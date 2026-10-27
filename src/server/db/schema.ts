import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const plans = pgTable("plans", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  projectName: text("project_name"),
  snapshot: jsonb("snapshot").notNull(),
  editTokenHash: text("edit_token_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const planItems = pgTable("plan_items", {
  id: text("id").primaryKey(),
  planId: text("plan_id")
    .notNull()
    .references(() => plans.id, { onDelete: "cascade" }),
  packageName: text("package_name").notNull(),
  target: text("target").notNull(),
  position: integer("position").notNull(),
  note: text("note").notNull().default(""),
  status: text("status").notNull().default("todo"),
});
