"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { Chrome } from "@/features/shell/chrome";
import { QueryProvider } from "@/shared/query/query-provider";
import { WorkspaceHydrator } from "@/shared/store/hydration";
import { TooltipProvider } from "@/shared/ui/tooltip";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryProvider>
        <WorkspaceHydrator />
        <TooltipProvider delayDuration={300}>
          {children}
          <Chrome />
          <Toaster position="bottom-center" richColors closeButton />
        </TooltipProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
