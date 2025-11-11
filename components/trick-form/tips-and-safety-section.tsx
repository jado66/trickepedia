"use client";

import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Lightbulb } from "lucide-react";
import type { TrickFormSectionProps } from "@/types/trick-form";

export function TipsAndSafetySection({
  formData,
  mode,
  onFieldChange,
}: TrickFormSectionProps) {
  return (
    <AccordionItem value="tips-safety" className="border rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold">Tips & Safety</h3>
            <p className="text-sm text-muted-foreground">
              Important advice and safety considerations
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="space-y-6">
          {["tips_and_tricks", "common_mistakes", "safety_notes"].map(
            (field) => {
              const fieldValue = formData[
                field as keyof typeof formData
              ] as string;
              const icons = {
                tips_and_tricks: <Lightbulb className="h-4 w-4" />,
                common_mistakes: <AlertTriangle className="h-4 w-4" />,
                safety_notes: <AlertTriangle className="h-4 w-4" />,
              };

              if (mode === "view" && !fieldValue?.trim()) return null;

              return (
                <div key={field} className="space-y-2">
                  <div className="flex items-center gap-2">
                    {icons[field as keyof typeof icons]}
                    <Label className="text-sm font-medium">
                      {field
                        .split("_")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </Label>
                  </div>
                  {mode === "view" ? (
                    fieldValue && (
                      <div className="p-4 bg-muted/50 rounded-lg whitespace-pre-wrap text-pretty">
                        {fieldValue}
                      </div>
                    )
                  ) : (
                    <Textarea
                      value={fieldValue}
                      onChange={(e) =>
                        onFieldChange(
                          field as keyof typeof formData,
                          e.target.value
                        )
                      }
                      placeholder={`Enter ${field.replace(/_/g, " ")}...`}
                      rows={3}
                    />
                  )}
                </div>
              );
            }
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
