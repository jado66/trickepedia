import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Lightbulb, Shield } from "lucide-react";
import { TrickWithLinkedPrerequisites } from "@/types/trick";

interface TrickContentSectionsProps {
  trick: TrickWithLinkedPrerequisites;
}

export function TrickContentSections({ trick }: TrickContentSectionsProps) {
  return (
    <>
      {trick.tips_and_tricks && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-amber-500" />
              Tips & Tricks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {trick.tips_and_tricks}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {trick.common_mistakes && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-6 w-6" />
              Common Mistakes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-amber-800 leading-relaxed">
                {trick.common_mistakes}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {trick.safety_notes && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2 text-red-700">
              <Shield className="h-6 w-6" />
              Safety Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-red-800 leading-relaxed">
                {trick.safety_notes}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
