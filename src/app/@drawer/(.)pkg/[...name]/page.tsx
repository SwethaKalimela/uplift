import { connection } from "next/server";
import { PackageDrawer } from "@/features/packages/package-drawer";
import { parsePackageSegments } from "@/shared/lib/package-path";

export const instant = false;

export default async function InterceptedPackagePage({ params }: { params: Promise<{ name: string[] }> }) {
  await connection();
  const { name } = await params;
  return <PackageDrawer rawName={parsePackageSegments(name)} />;
}
