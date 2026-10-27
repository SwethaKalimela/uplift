"use client";

import { useRouter } from "next/navigation";
import { PackageNameSchema } from "@/shared/schemas/primitives";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/ui/sheet";
import { PackageDetail } from "./package-detail";

export function PackageDrawer({ rawName }: { rawName: string }) {
  const router = useRouter();
  const parsed = PackageNameSchema.safeParse(rawName);

  return (
    <Sheet open onOpenChange={(open) => { if (!open) router.back(); }}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {parsed.success ? (
          <>
            <SheetHeader>
              <SheetTitle>{parsed.data}</SheetTitle>
              <SheetDescription>Registry metadata and GitHub release notes.</SheetDescription>
            </SheetHeader>
            <div className="px-6 py-5">
              <PackageDetail name={parsed.data} />
            </div>
          </>
        ) : (
          <div className="p-6">
            <SheetTitle>Invalid package name</SheetTitle>
            <SheetDescription>{rawName}</SheetDescription>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
