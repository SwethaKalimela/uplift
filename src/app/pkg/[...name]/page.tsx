import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { PackageDetail } from "@/features/packages/package-detail";
import { parsePackageSegments } from "@/shared/lib/package-path";
import { PackageNameSchema } from "@/shared/schemas/primitives";

type PageProps = { params: Promise<{ name: string[] }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const raw = parsePackageSegments((await params).name);
  return { title: raw };
}

export default async function PackagePage({ params }: PageProps) {
  await connection();
  const raw = parsePackageSegments((await params).name);
  const parsed = PackageNameSchema.safeParse(raw);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        Back to Uplift
      </Link>
      {parsed.success ? (
        <PackageDetail name={parsed.data} />
      ) : (
        <p className="text-sm text-danger">That is not a valid npm package name.</p>
      )}
    </main>
  );
}
