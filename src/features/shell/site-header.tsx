import { ArrowUpCircle } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/shared/ui/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <ArrowUpCircle className="size-5 text-primary" />
          Uplift
        </Link>
        <span className="hidden text-sm text-muted-foreground sm:inline">Plan dependency upgrades before you run them</span>
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
