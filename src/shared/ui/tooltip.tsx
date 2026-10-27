"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export const TooltipProvider = TooltipPrimitive.Provider;

export function Tooltip({
  content,
  children,
  className,
  ...props
}: { content: ReactNode; children: ReactNode } & ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          sideOffset={6}
          className={cn("z-50 rounded-md bg-foreground px-2 py-1 text-xs text-background shadow-md", className)}
          {...props}
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
