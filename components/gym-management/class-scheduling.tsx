"use client";

import { useState } from "react";
import type { CalendarView, ScheduleEvent } from "@/types/gym/scheduling";
import {
  SchedulerHeaderTabs,
  type SchedulerSection,
} from "@/components/gym-management/scheduler-header-tabs";
import { CalendarGrid } from "@/components/gym-management/calendar/calendar-grid";
import { CalendarHeader } from "@/components/gym-management/calendar/calendar-header";
import DashboardPage from "@/app/dashboard/page";
import ResourcesTab from "./resources/resoureces-tab";
import RecurringEventsTab from "./recurring/recurring-tab";
import DashboardTab from "./dashboard/dashboard-tab";

// Sample data for demonstration
const sampleEvents: ScheduleEvent[] = [
  {
    id: "1",
    title: "Beginner Gymnastics",
    description: "Introduction to basic gymnastics skills",
    startTime: new Date(2024, 11, 30, 9, 0),
    endTime: new Date(2024, 11, 30, 10, 0),
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
  },
  {
    id: "2",
    title: "Rock Climbing Competition",
    description: "Monthly climbing competition for all levels",
    startTime: new Date(2024, 11, 30, 14, 0),
    endTime: new Date(2024, 11, 30, 17, 0),
    instructors: ["instructor-2", "instructor-3"],
    resources: ["climbing-wall-1", "climbing-wall-2"],
    capacity: 24,
    enrolled: 18,
    students: [],
    type: "competition",
    status: "scheduled",
    price: 15,
    duration: 60,
  },
  {
    id: "3",
    title: "Advanced Trampoline",
    description: "Advanced trampoline techniques and routines",
    startTime: new Date(2024, 11, 31, 11, 0),
    endTime: new Date(2024, 11, 31, 12, 30),
    instructors: ["instructor-1"],
    resources: ["trampoline-area"],
    capacity: 8,
    enrolled: 6,
    students: [],
    type: "class",
    level: "Advanced",
    status: "scheduled",
    price: 35,
    duration: 60,
  },
];

export default function ClassScheduling() {
  // High-level SPA tabs for scheduler sections
  const [section, setSection] = useState<SchedulerSection>("dashboard");
  const [view, setView] = useState<CalendarView>({
    type: "week",
    date: new Date(),
  });

  const [events] = useState<ScheduleEvent[]>(sampleEvents);

  const handleNavigate = (direction: "prev" | "next" | "today") => {
    const newDate = new Date(view.date);

    switch (direction) {
      case "prev":
        if (view.type === "day") {
          newDate.setDate(newDate.getDate() - 1);
        } else if (view.type === "week") {
          newDate.setDate(newDate.getDate() - 7);
        } else if (view.type === "month") {
          newDate.setMonth(newDate.getMonth() - 1);
        }
        break;
      case "next":
        if (view.type === "day") {
          newDate.setDate(newDate.getDate() + 1);
        } else if (view.type === "week") {
          newDate.setDate(newDate.getDate() + 7);
        } else if (view.type === "month") {
          newDate.setMonth(newDate.getMonth() + 1);
        }
        break;
      case "today":
        setView({ ...view, date: new Date() });
        return;
    }

    setView({ ...view, date: newDate });
  };

  const handleEventClick = (event: ScheduleEvent) => {
    console.log("Event clicked:", event);
    // TODO: Open event details modal
  };

  const handleTimeSlotClick = (date: Date, time: string) => {
    console.log("Time slot clicked:", date, time);
    // TODO: Open create event modal
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <SchedulerHeaderTabs active={section} onChange={setSection} />
        {section === "calendar" && (
          <>
            <CalendarHeader
              view={view}
              onViewChange={setView}
              onNavigate={handleNavigate}
            />
            <div className="p-4 md:p-6">
              <CalendarGrid
                events={events}
                view={view}
                onEventClick={handleEventClick}
                onTimeSlotClick={handleTimeSlotClick}
              />
            </div>
          </>
        )}
        {section === "dashboard" && <DashboardTab />}
        {section === "resources" && <ResourcesTab />}
        {section === "recurring" && <RecurringEventsTab />}
      </div>
    </div>
  );
}
export { ClassScheduling };
