"use client";

import { useState } from "react";
import type {
  ScheduleEvent,
  Resource,
  Instructor,
} from "@/types/gym/scheduling";
import { DragDropScheduler } from "./drag-drop-scheduler";

// Sample data
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
    duration: 180,
  },
];

const sampleTemplates: Omit<
  ScheduleEvent,
  "startTime" | "endTime" | "students" | "enrolled"
>[] = [
  {
    id: "template-1",
    title: "Beginner Gymnastics",
    description: "Introduction to basic gymnastics skills",
    instructors: ["instructor-1"],
    resources: ["gym-floor-1"],
    capacity: 12,
    type: "class",
    level: "Beginner",
    status: "scheduled",
    price: 25,
    duration: 60,
  },
  {
    id: "template-2",
    title: "Advanced Climbing",
    description: "Advanced climbing techniques",
    instructors: ["instructor-2"],
    resources: ["climbing-wall-1"],
    capacity: 8,
    type: "class",
    level: "Advanced",
    status: "scheduled",
    price: 35,
    duration: 90,
  },
  {
    id: "template-3",
    title: "Open Gym",
    description: "Free practice time",
    instructors: [],
    resources: ["gym-floor-1"],
    capacity: 20,
    type: "event",
    status: "scheduled",
    price: 10,
    duration: 120,
  },
];

const sampleResources: Resource[] = [
  {
    id: "gym-floor-1",
    name: "Main Gym Floor",
    type: "area",
    capacity: 30,
    description: "Large open space for gymnastics and general fitness",
    available: true,
  },
  {
    id: "climbing-wall-1",
    name: "Climbing Wall A",
    type: "equipment",
    capacity: 12,
    description: "30-foot climbing wall with various routes",
    available: true,
  },
  {
    id: "climbing-wall-2",
    name: "Climbing Wall B",
    type: "equipment",
    capacity: 8,
    description: "Bouldering wall for beginners",
    available: true,
  },
];

const sampleInstructors: Instructor[] = [
  {
    id: "instructor-1",
    name: "Sarah Johnson",
    email: "sarah@gym.com",
    specialties: ["Gymnastics", "Tumbling"],
    available: true,
    color: "#3b82f6",
  },
  {
    id: "instructor-2",
    name: "Mike Chen",
    email: "mike@gym.com",
    specialties: ["Rock Climbing", "Bouldering"],
    available: true,
    color: "#10b981",
  },
  {
    id: "instructor-3",
    name: "Emma Davis",
    email: "emma@gym.com",
    specialties: ["Yoga", "Pilates", "Dance"],
    available: true,
    color: "#f59e0b",
  },
];

export default function SchedulerPage() {
  const [events, setEvents] = useState<ScheduleEvent[]>(sampleEvents);
  const [templates] = useState(sampleTemplates);
  const [resources] = useState<Resource[]>(sampleResources);
  const [instructors] = useState<Instructor[]>(sampleInstructors);

  const handleEventMove = (
    eventId: string,
    newStartTime: Date,
    newEndTime: Date
  ) => {
    setEvents(
      events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              startTime: newStartTime,
              endTime: newEndTime,
            }
          : event
      )
    );
  };

  const handleEventCreate = (
    template: Omit<
      ScheduleEvent,
      "startTime" | "endTime" | "students" | "enrolled"
    >,
    startTime: Date,
    endTime: Date
  ) => {
    const newEvent: ScheduleEvent = {
      ...template,
      id: `event-${Date.now()}`,
      startTime,
      endTime,
      students: [],
      enrolled: 0,
    };
    setEvents([...events, newEvent]);
  };

  const handleEventClick = (event: ScheduleEvent) => {
    console.log("Event clicked:", event);
    // TODO: Open event details modal
  };

  const handleCreateTemplate = () => {
    console.log("Create template clicked");
    // TODO: Open create template modal
  };

  return (
    <DragDropScheduler
      events={events}
      templates={templates}
      resources={resources}
      instructors={instructors}
      onEventMove={handleEventMove}
      onEventCreate={handleEventCreate}
      onEventClick={handleEventClick}
      onCreateTemplate={handleCreateTemplate}
    />
  );
}
