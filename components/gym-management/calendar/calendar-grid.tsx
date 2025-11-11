"use client";

import React from "react";
import type { ScheduleEvent, CalendarView } from "@/types/gym/scheduling";
import { formatTimeRange, getWeekDates } from "@/lib/gym/scheduling-utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CalendarGridProps {
  events: ScheduleEvent[];
  view: CalendarView;
  onEventClick?: (event: ScheduleEvent) => void;
  onTimeSlotClick?: (date: Date, time: string) => void;
}

export function CalendarGrid({
  events,
  view,
  onEventClick,
  onTimeSlotClick,
}: CalendarGridProps) {
  const timeSlots = Array.from({ length: 16 }, (_, i) => {
    const hour = i + 6;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  const getEventsForTimeSlot = (date: Date, time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    const slotStart = new Date(date);
    slotStart.setHours(hour, minute, 0, 0);
    const slotEnd = new Date(slotStart);
    slotEnd.setHours(hour + 1, minute, 0, 0);

    return events.filter((event) => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);

      return (
        eventStart.toDateString() === date.toDateString() &&
        eventStart >= slotStart &&
        eventStart < slotEnd
      );
    });
  };

  if (view.type === "week") {
    const weekDates = getWeekDates(view.date);

    return (
      <div className="grid grid-cols-8 gap-px bg-border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-card p-3 font-medium text-sm text-muted-foreground">
          Time
        </div>
        {weekDates.map((date, index) => (
          <div key={index} className="bg-card p-3 text-center">
            <div className="font-medium text-sm">
              {date.toLocaleDateString("en-US", { weekday: "short" })}
            </div>
            <div className="text-lg font-semibold">{date.getDate()}</div>
          </div>
        ))}

        {/* Time slots */}
        {timeSlots.map((time) => (
          <React.Fragment key={time}>
            <div className="bg-card p-3 text-sm text-muted-foreground border-r border-border">
              {time}
            </div>
            {weekDates.map((date, dateIndex) => {
              const slotEvents = getEventsForTimeSlot(date, time);

              return (
                <div
                  key={`${time}-${dateIndex}`}
                  className="bg-card p-1 min-h-[60px] cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => onTimeSlotClick?.(date, time)}
                >
                  {slotEvents.map((event) => (
                    <Card
                      key={event.id}
                      className="p-2 mb-1 cursor-pointer hover:shadow-md transition-shadow bg-primary/10 border-primary/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                    >
                      <div className="text-xs font-medium text-primary truncate">
                        {event.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTimeRange(event.startTime, event.endTime)}
                      </div>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {event.type}
                        </Badge>
                        {event.enrolled > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {event.enrolled}/{event.capacity}
                          </Badge>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // Day view
  if (view.type === "day") {
    return (
      <div className="space-y-px bg-border rounded-lg overflow-hidden">
        {timeSlots.map((time) => {
          const slotEvents = getEventsForTimeSlot(view.date, time);

          return (
            <div
              key={time}
              className="bg-card p-4 min-h-[80px] cursor-pointer hover:bg-accent/50 transition-colors flex gap-4"
              onClick={() => onTimeSlotClick?.(view.date, time)}
            >
              <div className="w-16 text-sm text-muted-foreground font-medium">
                {time}
              </div>
              <div className="flex-1 space-y-2">
                {slotEvents.map((event) => (
                  <Card
                    key={event.id}
                    className="p-3 cursor-pointer hover:shadow-md transition-shadow bg-primary/10 border-primary/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-primary">
                          {event.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatTimeRange(event.startTime, event.endTime)}
                        </div>
                        {event.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {event.description}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{event.type}</Badge>
                        <Badge variant="outline">
                          {event.enrolled}/{event.capacity}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
}
