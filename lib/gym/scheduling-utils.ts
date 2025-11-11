import type {
  ScheduleEvent,
  TimeSlot,
  Resource,
  Instructor,
} from "@/types/gym/scheduling";

export function generateTimeSlots(
  startHour = 6,
  endHour = 22,
  intervalMinutes = 30
): TimeSlot[] {
  const slots: TimeSlot[] = [];

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const start = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      const endMinute = minute + intervalMinutes;
      const endHour = endMinute >= 60 ? hour + 1 : hour;
      const adjustedEndMinute = endMinute >= 60 ? endMinute - 60 : endMinute;
      const end = `${endHour.toString().padStart(2, "0")}:${adjustedEndMinute
        .toString()
        .padStart(2, "0")}`;

      slots.push({
        start,
        end,
        duration: intervalMinutes,
      });
    }
  }

  return slots;
}

export function isResourceAvailable(
  resource: Resource,
  startTime: Date,
  endTime: Date,
  events: ScheduleEvent[],
  excludeEventId?: string
): boolean {
  if (!resource.available) return false;

  return !events.some((event) => {
    if (excludeEventId && event.id === excludeEventId) return false;
    if (!event.resources.includes(resource.id)) return false;

    return (
      (startTime >= event.startTime && startTime < event.endTime) ||
      (endTime > event.startTime && endTime <= event.endTime) ||
      (startTime <= event.startTime && endTime >= event.endTime)
    );
  });
}

export function isInstructorAvailable(
  instructor: Instructor,
  startTime: Date,
  endTime: Date,
  events: ScheduleEvent[],
  excludeEventId?: string
): boolean {
  if (!instructor.available) return false;

  return !events.some((event) => {
    if (excludeEventId && event.id === excludeEventId) return false;
    if (!event.instructors.includes(instructor.id)) return false;

    return (
      (startTime >= event.startTime && startTime < event.endTime) ||
      (endTime > event.startTime && endTime <= event.endTime) ||
      (startTime <= event.startTime && endTime >= event.endTime)
    );
  });
}

export function formatTimeRange(startTime: Date, endTime: Date): string {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

export function getWeekDates(date: Date): Date[] {
  const week: Date[] = [];
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    week.push(day);
  }

  return week;
}

export function generateRecurringEvents(
  baseEvent: ScheduleEvent,
  maxOccurrences = 52
): ScheduleEvent[] {
  if (!baseEvent.recurring) return [baseEvent];

  const events: ScheduleEvent[] = [baseEvent];
  const { frequency, interval, endDate, daysOfWeek } = baseEvent.recurring;

  let currentDate = new Date(baseEvent.startTime);
  let occurrences = 1;

  while (occurrences < maxOccurrences) {
    let nextDate: Date;

    switch (frequency) {
      case "daily":
        nextDate = new Date(currentDate);
        nextDate.setDate(currentDate.getDate() + interval);
        break;
      case "weekly":
        nextDate = new Date(currentDate);
        nextDate.setDate(currentDate.getDate() + 7 * interval);
        break;
      case "monthly":
        nextDate = new Date(currentDate);
        nextDate.setMonth(currentDate.getMonth() + interval);
        break;
      default:
        return events;
    }

    if (endDate && nextDate > endDate) break;

    if (daysOfWeek && !daysOfWeek.includes(nextDate.getDay())) {
      currentDate = nextDate;
      continue;
    }

    const duration =
      baseEvent.endTime.getTime() - baseEvent.startTime.getTime();
    const nextEndTime = new Date(nextDate.getTime() + duration);

    events.push({
      ...baseEvent,
      id: `${baseEvent.id}-${occurrences}`,
      startTime: nextDate,
      endTime: nextEndTime,
    });

    currentDate = nextDate;
    occurrences++;
  }

  return events;
}

export function getInstructorWorkload(
  instructorId: string,
  events: ScheduleEvent[],
  startDate: Date,
  endDate: Date
): {
  totalHours: number;
  eventCount: number;
  events: ScheduleEvent[];
} {
  const instructorEvents = events.filter(
    (event) =>
      event.instructors.includes(instructorId) &&
      event.startTime >= startDate &&
      event.endTime <= endDate
  );

  const totalHours = instructorEvents.reduce((total, event) => {
    const duration =
      (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60 * 60);
    return total + duration;
  }, 0);

  return {
    totalHours,
    eventCount: instructorEvents.length,
    events: instructorEvents,
  };
}

export function findInstructorConflicts(
  instructors: Instructor[],
  events: ScheduleEvent[],
  newEvent: { startTime: Date; endTime: Date; instructors: string[] }
): {
  conflictingInstructors: Instructor[];
  conflictingEvents: ScheduleEvent[];
} {
  const conflictingInstructors: Instructor[] = [];
  const conflictingEvents: ScheduleEvent[] = [];

  newEvent.instructors.forEach((instructorId) => {
    const instructor = instructors.find((i) => i.id === instructorId);
    if (!instructor) return;

    const conflicts = events.filter((event) => {
      if (!event.instructors.includes(instructorId)) return false;

      return (
        (newEvent.startTime >= event.startTime &&
          newEvent.startTime < event.endTime) ||
        (newEvent.endTime > event.startTime &&
          newEvent.endTime <= event.endTime) ||
        (newEvent.startTime <= event.startTime &&
          newEvent.endTime >= event.endTime)
      );
    });

    if (conflicts.length > 0) {
      conflictingInstructors.push(instructor);
      conflictingEvents.push(...conflicts);
    }
  });

  return {
    conflictingInstructors,
    conflictingEvents: Array.from(new Set(conflictingEvents)), // Remove duplicates
  };
}

export function getOptimalInstructorAssignment(
  instructors: Instructor[],
  events: ScheduleEvent[],
  eventRequirements: {
    specialties: string[];
    startTime: Date;
    endTime: Date;
    maxInstructors?: number;
  }
): Instructor[] {
  const availableInstructors = instructors.filter((instructor) => {
    // Check if instructor is available
    if (!instructor.available) return false;

    // Check if instructor has required specialties
    const hasRequiredSpecialty = eventRequirements.specialties.some(
      (specialty) => instructor.specialties.includes(specialty)
    );
    if (eventRequirements.specialties.length > 0 && !hasRequiredSpecialty)
      return false;

    // Check if instructor is available during the time slot
    return isInstructorAvailable(
      instructor,
      eventRequirements.startTime,
      eventRequirements.endTime,
      events
    );
  });

  // Sort by workload (prefer instructors with less workload)
  const weekStart = new Date(eventRequirements.startTime);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const instructorsWithWorkload = availableInstructors.map((instructor) => {
    const workload = getInstructorWorkload(
      instructor.id,
      events,
      weekStart,
      weekEnd
    );
    return { instructor, workload: workload.totalHours };
  });

  instructorsWithWorkload.sort((a, b) => a.workload - b.workload);

  const maxInstructors =
    eventRequirements.maxInstructors || instructorsWithWorkload.length;
  return instructorsWithWorkload
    .slice(0, maxInstructors)
    .map((item) => item.instructor);
}
