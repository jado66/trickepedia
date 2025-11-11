"use client";

import { useMemo } from "react";
import type {
  ScheduleEvent,
  Instructor,
  CalendarView,
} from "@/types/gym/scheduling";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTimeRange, getWeekDates } from "@/lib/gym/scheduling-utils";
import { Clock, Users } from "lucide-react";

interface InstructorScheduleViewProps {
  instructors: Instructor[];
  events: ScheduleEvent[];
  view: CalendarView;
  onEventClick?: (event: ScheduleEvent) => void;
}

export function InstructorScheduleView({
  instructors,
  events,
  view,
  onEventClick,
}: InstructorScheduleViewProps) {
  const instructorSchedules = useMemo(() => {
    const schedules = new Map<string, ScheduleEvent[]>();

    instructors.forEach((instructor) => {
      const instructorEvents = events.filter((event) =>
        event.instructors.includes(instructor.id)
      );
      schedules.set(instructor.id, instructorEvents);
    });

    return schedules;
  }, [instructors, events]);

  const getEventsForDay = (instructorId: string, date: Date) => {
    const instructorEvents = instructorSchedules.get(instructorId) || [];
    return instructorEvents.filter((event) => {
      return event.startTime.toDateString() === date.toDateString();
    });
  };

  const weekDates =
    view.type === "week" ? getWeekDates(view.date) : [view.date];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Instructor Schedules</h3>
      </div>

      {view.type === "week" ? (
        <div className="space-y-4">
          {instructors.map((instructor) => (
            <Card key={instructor.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: instructor.color }}
                  />
                  {instructor.name}
                  <Badge variant="outline" className="ml-auto">
                    {instructorSchedules.get(instructor.id)?.length || 0} events
                    this week
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {weekDates.map((date, index) => {
                    const dayEvents = getEventsForDay(instructor.id, date);
                    return (
                      <div key={index} className="space-y-1">
                        <div className="text-center text-sm font-medium text-muted-foreground">
                          {date.toLocaleDateString("en-US", {
                            weekday: "short",
                          })}
                          <div className="text-xs">{date.getDate()}</div>
                        </div>
                        <div className="space-y-1 min-h-[100px]">
                          {dayEvents.map((event) => (
                            <div
                              key={event.id}
                              className="p-2 bg-primary/10 border border-primary/20 rounded text-xs cursor-pointer hover:bg-primary/20 transition-colors"
                              onClick={() => onEventClick?.(event)}
                            >
                              <div className="font-medium truncate">
                                {event.title}
                              </div>
                              <div className="text-muted-foreground">
                                {formatTimeRange(
                                  event.startTime,
                                  event.endTime
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {instructors.map((instructor) => {
            const dayEvents = getEventsForDay(instructor.id, view.date);
            return (
              <Card key={instructor.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: instructor.color }}
                    />
                    {instructor.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dayEvents.length > 0 ? (
                      dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className="p-3 bg-primary/10 border border-primary/20 rounded cursor-pointer hover:bg-primary/20 transition-colors"
                          onClick={() => onEventClick?.(event)}
                        >
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeRange(event.startTime, event.endTime)}
                          </div>
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
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No events scheduled</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
