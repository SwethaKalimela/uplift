import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-9 w-full rounded-md border bg-surface px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-2 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "w-full rounded-md border bg-surface px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-2 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
