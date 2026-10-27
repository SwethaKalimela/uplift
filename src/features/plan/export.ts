import type { Plan } from "@/shared/schemas/plan";
import type { DraftItem } from "@/shared/store/types";

type Line = { name: string; target: string; note?: string; status?: string };

function linesFromPlan(plan: Plan): Line[] {
  return plan.items.map((item) => ({ name: item.name, target: item.target, note: item.note, status: item.status }));
}

function linesFromDraft(draft: readonly DraftItem[]): Line[] {
  return draft.map((item) => ({ name: item.name, target: item.target, note: item.note }));
}

export function toSpec(name: string, target: string) {
  return `${name}@${target}`;
}

export function toInstallCommand(items: readonly Line[]) {
  const specs = items.filter((item) => item.status !== "skipped").map((item) => toSpec(item.name, item.target));
  return specs.length > 0 ? `npm install ${specs.join(" ")}` : "";
}

export function toMarkdown(title: string, items: readonly Line[]) {
  const rows = items.map((item) => {
    const checked = item.status === "upgraded" ? "x" : " ";
    const note = item.note ? ` — ${item.note}` : "";
    return `- [${checked}] \`${item.name}@${item.target}\`${note}`;
  });
  return [`# ${title}`, "", ...rows, ""].join("\n");
}

export function exportPlan(plan: Plan) {
  return { install: toInstallCommand(linesFromPlan(plan)), markdown: toMarkdown(plan.name, linesFromPlan(plan)) };
}

export function exportDraft(name: string, draft: readonly DraftItem[]) {
  const items = linesFromDraft(draft);
  return { install: toInstallCommand(items), markdown: toMarkdown(name, items) };
}
