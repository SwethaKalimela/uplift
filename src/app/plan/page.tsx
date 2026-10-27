import type { Metadata } from "next";
import { PlanPageScreen } from "@/features/plan/plan-page-screen";

export const metadata: Metadata = {
  title: "Upgrade plan",
};

export default function PlanPage() {
  return <PlanPageScreen />;
}
