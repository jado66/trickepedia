"use client";

import type { ScheduleEvent } from "@/types/gym/scheduling";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DraggableEvent } from "./draggable-event";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EventTemplatesProps {
  templates: Omit<
    ScheduleEvent,
    "startTime" | "endTime" | "students" | "enrolled"
  >[];
  onCreateTemplate: () => void;
}

export function EventTemplates({
  templates,
  onCreateTemplate,
}: EventTemplatesProps) {
  // Convert templates to full events for dragging (with placeholder times)
  const templateEvents: ScheduleEvent[] = templates.map((template) => ({
    ...template,
    startTime: new Date(),
    endTime: new Date(),
    students: [],
    enrolled: 0,
  }));

  return (
    <Card className="w-80 flex-shrink-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Event Templates</CardTitle>
          <Button size="sm" onClick={onCreateTemplate}>
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {templateEvents.map((template) => (
            <DraggableEvent key={template.id} event={template} isTemplate />
          ))}
          {templates.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No templates yet. Create your first template to get started.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
