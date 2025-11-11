"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  ScheduleEvent,
  Resource,
  Instructor,
} from "@/types/gym/scheduling";
import { EventList } from "./event-list";
import { QuickActions } from "./quick-actions";
import { EventForm } from "../scheduler/event-form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Settings } from "lucide-react";
import { AnalyticsCards } from "./analytics-cards";

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
  {
    id: "3",
    title: "Advanced Trampoline",
    description: "Advanced trampoline techniques and routines",
    startTime: new Date(2024, 11, 28, 11, 0),
    endTime: new Date(2024, 11, 28, 12, 30),
    instructors: ["instructor-1"],
    resources: ["trampoline-area"],
    capacity: 8,
    enrolled: 6,
    students: [],
    type: "class",
    level: "Advanced",
    status: "completed",
    price: 35,
    duration: 90,
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
  {
    id: "trampoline-area",
    name: "Trampoline Area",
    type: "area",
    capacity: 8,
    description: "Dedicated trampoline training area",
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

export default function DashboardTab() {
  const router = useRouter();
  const [events, setEvents] = useState<ScheduleEvent[]>(sampleEvents);
  const [resources] = useState<Resource[]>(sampleResources);
  const [instructors] = useState<Instructor[]>(sampleInstructors);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(2024, 11, 1), // December 1, 2024
    end: new Date(2024, 11, 31), // December 31, 2024
  });
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setIsEventFormOpen(true);
  };

  const handleEditEvent = (event: ScheduleEvent) => {
    setEditingEvent(event);
    setIsEventFormOpen(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== eventId));
  };

  const handleEventFormSubmit = (eventData: Partial<ScheduleEvent>) => {
    if (editingEvent) {
      // Update existing event
      setEvents((prev) =>
        prev.map((event) =>
          event.id === editingEvent.id
            ? {
                ...event,
                ...eventData,
              }
            : event
        )
      );
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
        duration: eventData.duration || 60,
        recurring: eventData.recurring,
      };
      setEvents((prev) => [...prev, newEvent]);
    }
  };

  const handleDateRangeChange = (range: string) => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (range) {
      case "week":
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay()); // Start of week
        end = new Date(start);
        end.setDate(start.getDate() + 6); // End of week
        break;
      case "month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "quarter":
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        break;
      case "year":
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        return;
    }

    setDateRange({ start, end });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Event Management Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your gym&apos;s classes, events, and performance
              metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value="month" onValueChange={handleDateRangeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => router.push("/scheduler")}>
              <Calendar className="h-4 w-4 mr-2" />
              View Scheduler
            </Button>
            <Button variant="outline" onClick={() => router.push("/resources")}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        <AnalyticsCards
          events={events}
          instructors={instructors}
          resources={resources}
          dateRange={dateRange}
        />

        {/* Quick Actions */}
        <QuickActions
          onCreateEvent={handleCreateEvent}
          onViewScheduler={() => router.push("/scheduler")}
          onManageResources={() => router.push("/resources")}
          onManageInstructors={() => router.push("/resources")}
          onViewRecurring={() => router.push("/recurring")}
          onViewAnalytics={() => {
            /* TODO: Implement analytics page */
          }}
        />

        {/* Event List */}
        <EventList
          events={events}
          instructors={instructors}
          resources={resources}
          onEventEdit={handleEditEvent}
          onEventDelete={handleDeleteEvent}
        />

        {/* Event Form Modal */}
        <EventForm
          isOpen={isEventFormOpen}
          onClose={() => setIsEventFormOpen(false)}
          onSubmit={handleEventFormSubmit}
          event={editingEvent}
          instructors={instructors}
          resources={resources}
        />
      </div>
    </div>
  );
}
