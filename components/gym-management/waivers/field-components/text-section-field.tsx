"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface TextSectionFieldProps {
  field: {
    id: string;
    label: string;
    validation_rules?: {
      content?: string;
    };
  };
}

export function TextSectionField({ field }: TextSectionFieldProps) {
  const content = field.validation_rules?.content || field.label;

  return (
    <Card className="bg-muted/30 border-border">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <h4 className="font-medium text-card-foreground">{field.label}</h4>
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {content}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
