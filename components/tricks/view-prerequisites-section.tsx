// components/tricks/view-prerequisites-section.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, ExternalLink } from "lucide-react";
import { PrerequisitesDisplay } from "@/components/prerequisites-display";
import { TrickWithLinkedPrerequisites } from "@/types/trick";

interface ViewPrerequisitesSectionProps {
  trick: TrickWithLinkedPrerequisites;
}

export function ViewPrerequisitesSection({
  trick,
}: ViewPrerequisitesSectionProps) {
  // Check if there are prerequisites
  if (!trick.prerequisite_ids || trick.prerequisite_ids.length === 0) {
    return null;
  }

  // Filter out empty prerequisite IDs
  const validPrerequisiteIds = trick.prerequisite_ids.filter(
    (id) => id && id.trim() !== ""
  );

  if (validPrerequisiteIds.length === 0) {
    return null;
  }

  return (
    <Card className="border-emerald-200 dark:border-emerald-800">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
          <CheckCircle className="h-6 w-6" />
          Prerequisites
        </CardTitle>
        <CardDescription className="text-emerald-600 dark:text-emerald-400">
          Master these skills before attempting this trick
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Pass both prerequisite_ids AND prerequisiteTricks to PrerequisitesDisplay */}
        <PrerequisitesDisplay
          prerequisite_ids={validPrerequisiteIds}
          prerequisiteTricks={trick.prerequisite_tricks}
        />
        {validPrerequisiteIds.length > 0 && (
          <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            Click on linked prerequisites to view their details
          </p>
        )}
      </CardContent>
    </Card>
  );
}
