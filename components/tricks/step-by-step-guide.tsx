import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Lightbulb } from "lucide-react";
import { TrickWithLinkedPrerequisites } from "@/types/trick";

interface StepByStepGuideProps {
  trick: TrickWithLinkedPrerequisites;
}

export function StepByStepGuide({ trick }: StepByStepGuideProps) {
  if (
    !Array.isArray(trick.step_by_step_guide) ||
    trick.step_by_step_guide.length === 0 ||
    !trick.step_by_step_guide.some(
      (step) => step.title?.trim() || step.description?.trim()
    )
  ) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" />
          Step-by-Step Guide
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {trick.step_by_step_guide.map((step, index) => {
            const stepNum =
              typeof step.step === "number" ? step.step : index + 1;
            const title = step.title || `Step ${stepNum}`;
            const description = step.description || "";
            let tips = step.tips;
            if (!Array.isArray(tips)) {
              if (typeof tips === "string" && (tips as string).trim()) {
                tips = [tips];
              } else {
                tips = [];
              }
            }
            // Filter out empty or whitespace-only tips
            tips = tips.filter((tip) => typeof tip === "string" && tip.trim());
            return (
              <div key={stepNum} className="relative">
                {trick.step_by_step_guide &&
                  index < trick.step_by_step_guide.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-full bg-border" />
                  )}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                    {stepNum}
                  </div>
                  <div className="flex-1 space-y-3">
                    <h3 className="text-xl font-semibold leading-tight">
                      {title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {description}
                    </p>
                    {tips.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-blue-900">
                          <Lightbulb className="h-4 w-4" />
                          {tips.length === 1 ? "Pro Tip" : "Pro Tips"}
                        </h4>
                        <ul className="space-y-1">
                          {tips.map((tip, tipIndex) => (
                            <li
                              key={tipIndex}
                              className="text-sm text-blue-800 flex items-start gap-2"
                            >
                              <span className="text-blue-400 mt-1">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
