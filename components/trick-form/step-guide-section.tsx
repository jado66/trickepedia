"use client";

import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import type { StepGuideSectionProps, StepGuide } from "@/types/trick-form";

export function StepGuideSection({
  formData,
  mode,
  onStepChange,
  onAddStep,
  onRemoveStep,
}: StepGuideSectionProps) {
  return (
    <AccordionItem value="steps" className="border rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold">Step by Step Guide</h3>
            <p className="text-sm text-muted-foreground">
              Break down the trick into detailed steps
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="space-y-4">
          {mode === "view" ? (
            formData.step_by_step_guide?.map((step, index) => (
              <div key={index} className="border rounded-lg p-4 bg-muted/30">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                    {step.step}
                  </div>
                  <div className="flex-1 space-y-2">
                    {step.title && (
                      <h4 className="font-medium">{step.title}</h4>
                    )}
                    {step.description && (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {step.description}
                      </p>
                    )}
                    {step.tips &&
                      step.tips.length > 0 &&
                      step.tips.some((tip) => tip.trim()) && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Tips:
                          </p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {step.tips
                              .filter((tip) => tip.trim())
                              .map((tip, tipIndex) => (
                                <li
                                  key={tipIndex}
                                  className="flex items-start gap-1"
                                >
                                  <span className="text-primary mt-0.5">•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <>
              {formData.step_by_step_guide?.map((step, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                        {step.step}
                      </div>
                      <Label className="font-medium">Step {step.step}</Label>
                    </div>
                    {(formData.step_by_step_guide?.length ?? 0) > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveStep(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label
                        htmlFor={`step-title-${index}`}
                        className="text-sm"
                      >
                        Step Title
                      </Label>
                      <Input
                        id={`step-title-${index}`}
                        value={step.title}
                        onChange={(e) =>
                          onStepChange(index, "title", e.target.value)
                        }
                        placeholder="Enter step title..."
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor={`step-description-${index}`}
                        className="text-sm"
                      >
                        Description
                      </Label>
                      <Textarea
                        id={`step-description-${index}`}
                        value={step.description}
                        onChange={(e) =>
                          onStepChange(index, "description", e.target.value)
                        }
                        placeholder="Describe what to do in this step..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label className="text-sm">Tips for this step</Label>
                      <div className="space-y-2 mt-2">
                        {step.tips.map((tip, tipIndex) => (
                          <div key={tipIndex} className="flex gap-2">
                            <Input
                              value={tip}
                              onChange={(e) => {
                                const newTips = [...step.tips];
                                newTips[tipIndex] = e.target.value;
                                onStepChange(index, "tips", newTips);
                              }}
                              placeholder="Enter a tip..."
                              className="flex-1"
                            />
                            {step.tips.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newTips = step.tips.filter(
                                    (_, i) => i !== tipIndex
                                  );
                                  onStepChange(index, "tips", newTips);
                                }}
                                className="text-destructive hover:text-destructive px-3"
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newTips = [...step.tips, ""];
                            onStepChange(index, "tips", newTips);
                          }}
                          className="text-sm"
                        >
                          + Add Tip
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={onAddStep}
                className="w-full"
              >
                + Add Another Step
              </Button>
            </>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
