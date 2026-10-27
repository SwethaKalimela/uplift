import { describeAssessment, type Assessment, type Bump } from "@/shared/domain/bump";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";

const BUMP_LABEL: Record<Bump, string> = {
  patch: "Patch",
  minor: "Minor",
  major: "Major",
};

export function BumpBadge({ assessment, pending }: { assessment: Assessment | null; pending: boolean }) {
  if (pending) return <Skeleton className="h-5 w-14" />;
  if (!assessment) return <span className="text-xs text-muted-foreground">—</span>;
  if (assessment.kind === "current") return <Badge tone="success">Current</Badge>;
  if (assessment.kind === "ahead") return <Badge tone="outline">Ahead</Badge>;
  if (assessment.kind === "unsupported") return <Badge>{describeAssessment(assessment)}</Badge>;
  return <Badge tone={assessment.bump}>{BUMP_LABEL[assessment.bump]}</Badge>;
}
