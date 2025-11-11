"use client";

import { useState } from "react";
import type { ScheduleEvent } from "@/types/gym/scheduling";
import { RecurringEventManager } from "./recurring-event-manager";
import { generateRecurringEvents } from "@/lib/gym/scheduling-utils";

// Sample recurring events
const sampleRecurringEvents: ScheduleEvent[] = [
  {
    id: "recurring-1",
    title: "Weekly Gymnastics Class",
    description: "Beginner gymnastics for ages 6-12",
    startTime: new Date(2024, 11, 30, 10, 0),
    endTime: new Date(2024, 11, 30, 11, 0),
    instructors: ["instructor-1"],
    resources: ["gym-floor-1"],
    capacity: 12,
    enrolled: 8,
    students: [],
    type: "class",
    level: "Beginner",
    status: "scheduled",
    price: 25,
    duration: 60,
    recurring: {
      frequency: "weekly",
      interval: 1,
      daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
      endDate: new Date(2025, 2, 30), // End in March 2025
    },
  },
  {
    id: "recurring-2",
    title: "Monthly Climbing Competition",
    description: "Open climbing competition for all levels",
    startTime: new Date(2024, 11, 15, 14, 0),
    endTime: new Date(2024, 11, 15, 17, 0),
    instructors: ["instructor-2", "instructor-3"],
    resources: ["climbing-wall-1", "climbing-wall-2"],
    capacity: 24,
    enrolled: 18,
    students: [],
    type: "competition",
    status: "scheduled",
    price: 15,
    duration: 180,
    recurring: {
      frequency: "monthly",
      interval: 1,
      endDate: new Date(2025, 11, 31), // End in December 2025
    },
  },
];

export default function RecurringEventsTab() {
  const [events, setEvents] = useState<ScheduleEvent[]>(() => {
    // Generate all recurring events for display
    const allEvents: ScheduleEvent[] = [];
    sampleRecurringEvents.forEach((baseEvent) => {
      const generatedEvents = generateRecurringEvents(baseEvent, 20);
      allEvents.push(...generatedEvents);
    });
    return allEvents;
  });

  const handleUpdateEvent = (
    eventId: string,
    updates: Partial<ScheduleEvent>
  ) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId ? { ...event, ...updates } : event
      )
    );
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== eventId));
  };

  const handleDeleteSeries = (seriesId: string) => {
    setEvents((prev) => prev.filter((event) => !event.id.startsWith(seriesId)));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Recurring Events</h1>
          <p className="text-muted-foreground">
            Manage recurring classes, events, and competitions
          </p>
        </div>

        <RecurringEventManager
          events={events}
          onUpdateEvent={handleUpdateEvent}
          onDeleteEvent={handleDeleteEvent}
          onDeleteSeries={handleDeleteSeries}
        />
      </div>
    </div>
  );
}
