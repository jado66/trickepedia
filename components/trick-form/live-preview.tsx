"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { MediaPreview } from "./media-preview";
import { getDifficultyColor, getDifficultyLabel } from "@/lib/trick-form-utils";
import type { TrickData } from "@/types/trick";

interface LivePreviewProps {
  formData: TrickData;
  mode: "view" | "edit" | "create";
}

export function LivePreview({ formData, mode }: LivePreviewProps) {
  if (mode === "view") return null;

  return (
    <Card className="mb-6 border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Live Preview</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <MediaPreview formData={formData} mode={mode} />

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-balance">
                {formData.name || "Untitled Trick"}
              </h3>
              {formData.description && (
                <p className="text-sm text-muted-foreground mt-1 text-pretty">
                  {formData.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                {formData.difficulty_level > 0 && (
                  <Badge
                    className={getDifficultyColor(formData.difficulty_level)}
                  >
                    {getDifficultyLabel(formData.difficulty_level)}
                  </Badge>
                )}
                {formData.tags
                  ?.filter(Boolean)
                  .slice(0, 3)
                  .map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
