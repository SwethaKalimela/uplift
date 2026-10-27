import { connection } from "next/server";
import { Suspense } from "react";
import { PackageDrawer } from "@/features/packages/package-drawer";
import { parsePackageSegments } from "@/shared/lib/package-path";

export default function InterceptedPackagePage({ params }: { params: Promise<{ name: string[] }> }) {
  return (
    <Suspense fallback={null}>
      <InterceptedPackage params={params} />
    </Suspense>
  );
}

async function InterceptedPackage({ params }: { params: Promise<{ name: string[] }> }) {
  await connection();
  const { name } = await params;
  return <PackageDrawer rawName={parsePackageSegments(name)} />;
}
