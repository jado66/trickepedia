"use client";

import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { GripVertical } from "lucide-react";
import { PrerequisitesFormField } from "@/components/prerequisites-form-field";
import type { TrickFormSectionProps } from "@/types/trick-form";

interface PrerequisitesSectionProps extends TrickFormSectionProps {
  currentTrick?: {
    id?: string;
    subcategory?: {
      name: string;
      slug: string;
      master_category: {
        name: string;
        slug: string;
        color: string | null;
      };
    };
  };
  prerequisiteTricks?: any[];
}

export function PrerequisitesSection({
  formData,
  mode,
  onFieldChange,
  currentTrick,
  prerequisiteTricks,
}: PrerequisitesSectionProps) {
  return (
    <AccordionItem value="prerequisites" className="border rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <GripVertical className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold">Prerequisites</h3>
            <p className="text-sm text-muted-foreground">
              Skills needed before attempting this trick
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <PrerequisitesFormField
          prerequisite_ids={formData.prerequisite_ids || []}
          prerequisiteTricks={prerequisiteTricks} // NEW: Pass to form field for display
          onChange={(newPrerequisiteIds) =>
            onFieldChange("prerequisite_ids", newPrerequisiteIds)
          }
          subcategoryId={formData.subcategory_id || undefined}
          currentTrickId={currentTrick?.id}
          currentCategorySlug={currentTrick?.subcategory?.master_category.slug}
          currentCategoryName={currentTrick?.subcategory?.master_category.name}
        />
      </AccordionContent>
    </AccordionItem>
  );
}
