"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Event } from "@/types/event";

interface CalendarViewProps {
  events: Event[];
  categorySlug: string;
}

export function CalendarView({ events, categorySlug }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Month names
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Day names
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Filter events for current month
  const monthEvents = events.filter((event) => {
    const eventDate = new Date(event.start_date);
    return (
      eventDate.getMonth() === currentMonth &&
      eventDate.getFullYear() === currentYear
    );
  });

  // Group events by date
  const eventsByDate = monthEvents.reduce((acc, event) => {
    const date = new Date(event.start_date).getDate();
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {} as Record<number, Event[]>);

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate calendar days
  const calendarDays: (number | null)[] = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const today = new Date();
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {dayNames.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-medium text-muted-foreground bg-muted"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`min-h-[120px] p-2 border-r border-b border-border last:border-r-0 ${
                day === null ? "bg-muted/30" : ""
              } ${isToday(day || 0) ? "bg-primary/5 border-primary/20" : ""}`}
            >
              {day && (
                <>
                  {/* Day Number */}
                  <div
                    className={`text-sm font-medium mb-1 ${
                      isToday(day)
                        ? "text-primary font-bold"
                        : "text-foreground"
                    }`}
                  >
                    {day}
                  </div>

                  {/* Events for this day */}
                  <div className="space-y-1">
                    {eventsByDate[day]?.slice(0, 3).map((event) => (
                      <Link
                        key={event.id}
                        href={`/${categorySlug}/events/${event.id}`}
                        className="block"
                      >
                        <div className="text-xs p-1 rounded bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer border border-primary/20">
                          <div className="font-medium text-primary truncate">
                            {event.title}
                          </div>
                          {event.start_time && (
                            <div className="text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {new Date(
                                `2000-01-01T${event.start_time}`
                              ).toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}

                    {/* Show "more" indicator if there are additional events */}
                    {eventsByDate[day] && eventsByDate[day].length > 3 && (
                      <div className="text-xs text-muted-foreground text-center py-1">
                        +{eventsByDate[day].length - 3} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Events List for Current Month */}
      {monthEvents.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Events This Month ({monthEvents.length})
          </h3>
          <div className="grid gap-3">
            {monthEvents.map((event) => (
              <Link
                key={event.id}
                href={`/${categorySlug}/events/${event.id}`}
                className="block"
              >
                <div className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors bg-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(event.start_date).toLocaleDateString()}
                          {event.start_time && (
                            <span className="ml-1">
                              at{" "}
                              {new Date(
                                `2000-01-01T${event.start_time}`
                              ).toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>
                        {event.location_name && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {event.location_name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {event.event_type === "other" && event.custom_event_type
                          ? event.custom_event_type
                          : event.event_type}
                      </Badge>
                      {event.is_featured && (
                        <Badge variant="default" className="text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {monthEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Events This Month</h3>
          <p className="text-muted-foreground">
            No events scheduled for {monthNames[currentMonth]} {currentYear}
          </p>
        </div>
      )}
    </div>
  );
}
