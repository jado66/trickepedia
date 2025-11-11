"use client";

import { useDraggable } from "@dnd-kit/core";
import type { ScheduleEvent } from "@/types/gym/scheduling";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTimeRange } from "@/lib/gym/scheduling-utils";
import { GripVertical } from "lucide-react";

interface DraggableEventProps {
  event: ScheduleEvent;
  isTemplate?: boolean;
}

export function DraggableEvent({
  event,
  isTemplate = false,
}: DraggableEventProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: event.id,
      data: {
        event,
        isTemplate,
      },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const getEventTypeColor = (type: ScheduleEvent["type"]) => {
    switch (type) {
      case "class":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "event":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "competition":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-3 cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? "opacity-50 shadow-lg scale-105" : "hover:shadow-md"
      } ${getEventTypeColor(event.type)}`}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{event.title}</div>
          {!isTemplate && (
            <div className="text-xs text-muted-foreground">
              {formatTimeRange(event.startTime, event.endTime)}
            </div>
          )}
          {isTemplate && event.duration && (
            <div className="text-xs text-muted-foreground">
              {event.duration}min duration
            </div>
          )}
          <div className="flex gap-1 mt-1">
            <Badge variant="outline" className="text-xs">
              {event.type}
            </Badge>
            {event.level && (
              <Badge variant="outline" className="text-xs">
                {event.level}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
