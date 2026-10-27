import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { getPlan, PlanError } from "@/server/db/plans";
import { Badge } from "@/shared/ui/badge";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const plan = await getPlan(id);
    const upgrades = plan.items.filter((item) => item.status !== "skipped").length;
    return {
      title: plan.name,
      description: `${upgrades} upgrades${plan.projectName ? ` for ${plan.projectName}` : ""}`,
    };
  } catch {
    return { title: "Plan" };
  }
}

async function loadPlan(id: string) {
  try {
    return { plan: await getPlan(id), error: null };
  } catch (error) {
    return { plan: null, error: error instanceof PlanError ? error.message : "Could not load this plan" };
  }
}

export default async function SharedPlanPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const { plan, error } = await loadPlan(id);

  if (!plan) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-xl font-semibold">Plan unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        Back to Uplift
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{plan.name}</h1>
        {plan.projectName && <p className="text-sm text-muted-foreground">{plan.projectName}</p>}
      </div>
      <ol className="flex flex-col gap-3">
        {plan.items.map((item) => (
          <li key={item.id} className="rounded-xl border bg-surface p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">{item.name}</p>
              <Badge tone={item.status === "upgraded" ? "success" : "outline"}>{item.status}</Badge>
            </div>
            <p className="font-mono text-xs text-muted-foreground">{item.target}</p>
            {item.note && <p className="mt-2 text-sm text-muted-foreground">{item.note}</p>}
          </li>
        ))}
      </ol>
    </main>
  );
}
