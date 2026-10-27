import { describeAssessment, type Assessment } from "@/shared/domain/bump";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";

export function BumpBadge({ assessment, pending }: { assessment: Assessment | null; pending: boolean }) {
  if (pending) return <Skeleton className="h-5 w-16" />;
  if (!assessment) return <Badge>Unknown</Badge>;
  if (assessment.kind === "current") return <Badge tone="success">Up to date</Badge>;
  if (assessment.kind === "ahead") return <Badge tone="outline">Ahead</Badge>;
  if (assessment.kind === "unsupported") return <Badge>{describeAssessment(assessment)}</Badge>;
  return <Badge tone={assessment.bump}>{assessment.bump}</Badge>;
}
