"use client";

import { Button } from "@/components/ui/button";
import {
  GripVertical,
  AlertTriangle,
  Lightbulb,
  UserIcon,
  ExternalLink,
} from "lucide-react";
import type { StepGuide } from "@/types/trick-form";
import type { TrickData } from "@/types/trick";

interface AddSectionButtonsProps {
  mode: "view" | "edit" | "create";
  showPrerequisites: boolean;
  showStepGuide: boolean;
  showTipsAndTricks: boolean;
  showInventor: boolean;
  showSources: boolean;
  onShowPrerequisites: () => void;
  onShowStepGuide: () => void;
  onShowTipsAndTricks: () => void;
  onShowInventor: () => void;
  onShowSources: () => void;
  onSetFormData: React.Dispatch<React.SetStateAction<TrickData>>;
}

export function AddSectionButtons({
  mode,
  showPrerequisites,
  showStepGuide,
  showTipsAndTricks,
  showInventor,
  showSources,
  onShowPrerequisites,
  onShowStepGuide,
  onShowTipsAndTricks,
  onShowInventor,
  onShowSources,
  onSetFormData,
}: AddSectionButtonsProps) {
  if (mode === "view") return null;

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {!showPrerequisites && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onShowPrerequisites}
          className="flex items-center gap-2"
        >
          <GripVertical className="h-4 w-4" />
          Add Prerequisites
        </Button>
      )}

      {!showStepGuide && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            onShowStepGuide();
            // Initialize with one empty step if none exist
            onSetFormData((prev) => {
              if (!prev.step_by_step_guide || !prev.step_by_step_guide.length) {
                return {
                  ...prev,
                  step_by_step_guide: [
                    {
                      step: 1,
                      title: "",
                      description: "",
                      tips: [""],
                    },
                  ],
                };
              }
              return prev;
            });
          }}
          className="flex items-center gap-2"
        >
          <Lightbulb className="h-4 w-4" />
          Add Step Guide
        </Button>
      )}

      {!showTipsAndTricks && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onShowTipsAndTricks}
          className="flex items-center gap-2"
        >
          <AlertTriangle className="h-4 w-4" />
          Add Tips & Safety
        </Button>
      )}

      {!showInventor && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onShowInventor}
          className="flex items-center gap-2"
        >
          <UserIcon className="h-4 w-4" />
          Add Inventor
        </Button>
      )}

      {!showSources && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            onShowSources();
            // Initialize with one empty source URL if none exist
            onSetFormData((prev) => {
              if (
                !prev.source_urls?.length ||
                prev.source_urls.every((url) => !url.trim())
              ) {
                return {
                  ...prev,
                  source_urls: [""],
                };
              }
              return prev;
            });
          }}
          className="flex items-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Add Sources
        </Button>
      )}
    </div>
  );
}
