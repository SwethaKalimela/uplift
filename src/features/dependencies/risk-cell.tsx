"use client";

import { ShieldAlert } from "lucide-react";
import { worstSeverity } from "@/shared/domain/severity";
import type { Advisory, AdvisorySeverity } from "@/shared/schemas/registry";
import { Badge } from "@/shared/ui/badge";
import { Tooltip } from "@/shared/ui/tooltip";
import { advisoryTone } from "./row-model";

function formatSeverity(severity: AdvisorySeverity) {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

function AdvisoryHint({ advisories }: { advisories: readonly Advisory[] }) {
  const worst = worstSeverity(advisories);
  const extra = advisories.length - 3;

  return (
    <div className="flex flex-col gap-1">
      <p>
        {advisories.length === 1 ? "1 security advisory" : `${advisories.length} security advisories`}
        {worst ? ` · ${formatSeverity(worst)}` : ""}
      </p>
      <ul className="flex flex-col gap-0.5 text-background/80">
        {advisories.slice(0, 3).map((advisory) => (
          <li key={advisory.id} className="truncate">
            {formatSeverity(advisory.severity)}: {advisory.title}
          </li>
        ))}
      </ul>
      {extra > 0 && <p>+{extra} more</p>}
    </div>
  );
}

export function RiskCell({
  advisories,
  deprecated,
  failed,
}: {
  advisories: readonly Advisory[];
  deprecated: boolean;
  failed: boolean;
}) {
  const tone = advisoryTone(advisories);

  if (failed) return <Badge tone="danger">Failed</Badge>;
  if (!deprecated && !tone) return <span className="text-xs text-muted-foreground">—</span>;

  return (
    <div className="flex items-center gap-1">
      {deprecated && (
        <Tooltip content="This package is marked deprecated on npm">
          <Badge tone="danger" tabIndex={0}>
            Deprecated
          </Badge>
        </Tooltip>
      )}
      {tone && (
        <Tooltip content={<AdvisoryHint advisories={advisories} />} className="max-w-xs text-left leading-snug">
          <Badge
            tone={tone}
            tabIndex={0}
            aria-label={`${advisories.length} security ${advisories.length === 1 ? "advisory" : "advisories"}`}
          >
            <ShieldAlert className="size-3" />
            {advisories.length}
          </Badge>
        </Tooltip>
      )}
    </div>
  );
}
