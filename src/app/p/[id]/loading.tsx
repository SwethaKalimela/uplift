import { Skeleton } from "@/shared/ui/skeleton";

export default function PlanLoading() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-10">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
    </main>
  );
}
