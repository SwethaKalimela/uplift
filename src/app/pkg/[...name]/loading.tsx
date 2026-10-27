import { Skeleton } from "@/shared/ui/skeleton";

export default function PackageLoading() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-10 sm:px-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-24" />
      <Skeleton className="h-64" />
    </main>
  );
}
