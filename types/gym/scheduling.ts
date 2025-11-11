export interface Resource {
  id: string;
  name: string;
  type: "room" | "equipment" | "area";
  capacity: number;
  description?: string;
  available: boolean;
}

export interface Instructor {
  id: string;
  name: string;
  email: string;
  specialties: string[];
  available: boolean;
  color: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  instructors: string[];
  resources: string[];
  capacity: number;
  enrolled: number;
  students: string[];
  type: "class" | "event" | "competition";
  level?: string;
  recurring?: {
    frequency: "daily" | "weekly" | "monthly";
    interval: number;
    endDate?: Date;
    daysOfWeek?: number[];
  };
  status: "scheduled" | "cancelled" | "completed";
  price?: number;
  duration: number; // in minutes
}

export interface TimeSlot {
  start: string;
  end: string;
  duration: number;
}

export interface CalendarView {
  type: "day" | "week" | "month";
  date: Date;
}
