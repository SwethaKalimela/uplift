import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap w-fit",
  {
    variants: {
      tone: {
        neutral: "bg-muted text-muted-foreground border-transparent",
        patch: "border-patch/30 bg-patch/10 text-patch",
        minor: "border-minor/30 bg-minor/10 text-minor",
        major: "border-major/30 bg-major/10 text-major",
        danger: "border-danger/30 bg-danger/10 text-danger",
        success: "border-success/30 bg-success/10 text-success",
        outline: "bg-transparent text-foreground",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

type BadgeProps = ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
