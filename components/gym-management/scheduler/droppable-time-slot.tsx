"use client";

import { useDroppable } from "@dnd-kit/core";
import type { ScheduleEvent } from "@/types/gym/scheduling";
import { DraggableEvent } from "./draggable-event";

interface DroppableTimeSlotProps {
  date: Date;
  time: string;
  events: ScheduleEvent[];
  onEventClick?: (event: ScheduleEvent) => void;
}

export function DroppableTimeSlot({
  date,
  time,
  events,
  onEventClick,
}: DroppableTimeSlotProps) {
  const slotId = `${date.toISOString().split("T")[0]}-${time}`;
  const { isOver, setNodeRef } = useDroppable({
    id: slotId,
    data: {
      date,
      time,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[80px] p-2 transition-colors ${
        isOver
          ? "bg-primary/20 border-primary/40"
          : "bg-card hover:bg-accent/50"
      } border border-border rounded-md`}
    >
      <div className="space-y-1">
        {events.map((event) => (
          <div key={event.id} onClick={() => onEventClick?.(event)}>
            <DraggableEvent event={event} />
          </div>
        ))}
      </div>
    </div>
  );
}
