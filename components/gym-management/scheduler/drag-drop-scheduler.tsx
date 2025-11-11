"use client";

import { useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type {
  ScheduleEvent,
  CalendarView,
  Resource,
  Instructor,
} from "@/types/gym/scheduling";
import { CalendarHeader } from "@/components/gym-management/calendar/calendar-header";
import { DroppableTimeSlot } from "./droppable-time-slot";
import { DraggableEvent } from "./draggable-event";
import { EventTemplates } from "./event-templates";
import { ResourceAvailability } from "../resources/resource-availability";
import { getWeekDates } from "@/lib/gym/scheduling-utils";
import { EventForm } from "./event-form";
import { InstructorScheduleView } from "./instructor-schedule-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DragDropSchedulerProps {
  events: ScheduleEvent[];
  templates: Omit<
    ScheduleEvent,
    "startTime" | "endTime" | "students" | "enrolled"
  >[];
  resources: Resource[];
  instructors: Instructor[];
  onEventMove: (eventId: string, newStartTime: Date, newEndTime: Date) => void;
  onEventCreate: (
    template: Omit<
      ScheduleEvent,
      "startTime" | "endTime" | "students" | "enrolled"
    >,
    startTime: Date,
    endTime: Date
  ) => void;
  onEventClick?: (event: ScheduleEvent) => void;
  onCreateTemplate: () => void;
}

export function DragDropScheduler({
  events,
  templates,
  resources,
  instructors,
  onEventMove,
  onEventCreate,
  onEventClick,
  onCreateTemplate,
}: DragDropSchedulerProps) {
  const [view, setView] = useState<CalendarView>({
    type: "week",
    date: new Date(),
  });
  const [activeEvent, setActiveEvent] = useState<ScheduleEvent | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [newEventDate, setNewEventDate] = useState<Date | null>(null);
  const [newEventTime, setNewEventTime] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const timeSlots = Array.from({ length: 16 }, (_, i) => {
    const hour = i + 6;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  const handleNavigate = (direction: "prev" | "next" | "today") => {
    const newDate = new Date(view.date);

    switch (direction) {
      case "prev":
        if (view.type === "day") {
          newDate.setDate(newDate.getDate() - 1);
        } else if (view.type === "week") {
          newDate.setDate(newDate.getDate() - 7);
        }
        break;
      case "next":
        if (view.type === "day") {
          newDate.setDate(newDate.getDate() + 1);
        } else if (view.type === "week") {
          newDate.setDate(newDate.getDate() + 7);
        }
        break;
      case "today":
        setView({ ...view, date: new Date() });
        return;
    }

    setView({ ...view, date: newDate });
  };

  const getEventsForTimeSlot = (date: Date, time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    const slotStart = new Date(date);
    slotStart.setHours(hour, minute, 0, 0);
    const slotEnd = new Date(slotStart);
    slotEnd.setHours(hour + 1, minute, 0, 0);

    return events.filter((event) => {
      const eventStart = new Date(event.startTime);
      return (
        eventStart.toDateString() === date.toDateString() &&
        eventStart >= slotStart &&
        eventStart < slotEnd
      );
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const eventData = active.data.current?.event as ScheduleEvent;
    setActiveEvent(eventData);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveEvent(null);

    if (!over) return;

    const eventData = active.data.current?.event as ScheduleEvent;
    const isTemplate = active.data.current?.isTemplate as boolean;
    const dropData = over.data.current as { date: Date; time: string };

    if (!eventData || !dropData) return;

    const [hour, minute] = dropData.time.split(":").map(Number);
    const newStartTime = new Date(dropData.date);
    newStartTime.setHours(hour, minute, 0, 0);

    // Calculate duration and end time
    let duration: number;
    if (isTemplate) {
      // For templates, use the template's duration or default to 60 minutes
      duration = eventData.duration || 60;
    } else {
      // For existing events, preserve the original duration
      duration =
        (eventData.endTime.getTime() - eventData.startTime.getTime()) /
        (1000 * 60);
    }

    const newEndTime = new Date(newStartTime.getTime() + duration * 60 * 1000);

    // Update selected time range for availability checking
    setSelectedTimeRange({ start: newStartTime, end: newEndTime });

    if (isTemplate) {
      // Create new event from template
      onEventCreate(eventData, newStartTime, newEndTime);
    } else {
      // Move existing event
      onEventMove(eventData.id, newStartTime, newEndTime);
    }
  };

  const handleTimeSlotClick = (date: Date, time: string) => {
    setNewEventDate(date);
    setNewEventTime(time);
    setEditingEvent(null);
    setIsEventFormOpen(true);
  };

  const handleEventClick = (event: ScheduleEvent) => {
    setEditingEvent(event);
    setNewEventDate(null);
    setNewEventTime(null);
    setIsEventFormOpen(true);
  };

  const handleEventFormSubmit = (eventData: Partial<ScheduleEvent>) => {
    if (editingEvent) {
      // Update existing event
      onEventMove(editingEvent.id, eventData.startTime!, eventData.endTime!);
    } else {
      // Create new event
      const newEvent: ScheduleEvent = {
        id: `event-${Date.now()}`,
        title: eventData.title!,
        description: eventData.description || "",
        startTime: eventData.startTime!,
        endTime: eventData.endTime!,
        instructors: eventData.instructors || [],
        resources: eventData.resources || [],
        capacity: eventData.capacity!,
        enrolled: 0,
        students: [],
        type: eventData.type!,
        level: eventData.level,
        status: "scheduled",
        price: eventData.price,
        duration: eventData.duration || 60, // Default to 60 minutes if not provided
      };
      onEventCreate(newEvent, newEvent.startTime, newEvent.endTime);
    }
  };

  const weekDates =
    view.type === "week" ? getWeekDates(view.date) : [view.date];

  return (
    <div className="min-h-screen bg-background">
      <CalendarHeader
        view={view}
        onViewChange={setView}
        onNavigate={handleNavigate}
      />

      <div className="p-6">
        <Tabs defaultValue="scheduler" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scheduler">Drag & Drop Scheduler</TabsTrigger>
            <TabsTrigger value="instructors">Instructor Schedules</TabsTrigger>
          </TabsList>

          <TabsContent value="scheduler">
            <div className="flex gap-6">
              <EventTemplates
                templates={templates}
                onCreateTemplate={onCreateTemplate}
              />

              <div className="flex-1">
                <DndContext
                  sensors={sensors}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  {view.type === "week" ? (
                    <div className="grid grid-cols-8 gap-2">
                      {/* Header */}
                      <div className="font-medium text-sm text-muted-foreground p-2">
                        Time
                      </div>
                      {weekDates.map((date, index) => (
                        <div key={index} className="text-center p-2">
                          <div className="font-medium text-sm">
                            {date.toLocaleDateString("en-US", {
                              weekday: "short",
                            })}
                          </div>
                          <div className="text-lg font-semibold">
                            {date.getDate()}
                          </div>
                        </div>
                      ))}

                      {/* Time slots */}
                      {timeSlots.map((time) => (
                        <>
                          <div
                            key={`time-${time}`}
                            className="text-sm text-muted-foreground p-2 border-r border-border"
                          >
                            {time}
                          </div>
                          {weekDates.map((date, dateIndex) => {
                            const slotEvents = getEventsForTimeSlot(date, time);
                            return (
                              <div
                                key={`${time}-${dateIndex}`}
                                className="cursor-pointer"
                                onClick={() => handleTimeSlotClick(date, time)}
                              >
                                <DroppableTimeSlot
                                  date={date}
                                  time={time}
                                  events={slotEvents}
                                  onEventClick={handleEventClick}
                                />
                              </div>
                            );
                          })}
                        </>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {timeSlots.map((time) => {
                        const slotEvents = getEventsForTimeSlot(
                          view.date,
                          time
                        );
                        return (
                          <div key={time} className="flex gap-4">
                            <div className="w-16 text-sm text-muted-foreground font-medium p-2">
                              {time}
                            </div>
                            <div className="flex-1">
                              <div
                                onClick={() =>
                                  handleTimeSlotClick(view.date, time)
                                }
                              >
                                <DroppableTimeSlot
                                  date={view.date}
                                  time={time}
                                  events={slotEvents}
                                  onEventClick={handleEventClick}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <DragOverlay>
                    {activeEvent ? (
                      <DraggableEvent event={activeEvent} />
                    ) : null}
                  </DragOverlay>
                </DndContext>
              </div>

              <div className="w-80 flex-shrink-0">
                <ResourceAvailability
                  resources={resources}
                  instructors={instructors}
                  events={events}
                  selectedDate={view.date}
                  selectedTimeRange={selectedTimeRange || undefined}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="instructors">
            <InstructorScheduleView
              instructors={instructors}
              events={events}
              view={view}
              onEventClick={handleEventClick}
            />
          </TabsContent>
        </Tabs>

        <EventForm
          isOpen={isEventFormOpen}
          onClose={() => setIsEventFormOpen(false)}
          onSubmit={handleEventFormSubmit}
          event={editingEvent}
          resources={resources}
          instructors={instructors}
          selectedDate={newEventDate || undefined}
          selectedTime={newEventTime || undefined}
        />
      </div>
    </div>
  );
}
