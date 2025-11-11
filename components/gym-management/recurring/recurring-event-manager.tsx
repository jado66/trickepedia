"use client";

import { useState, useMemo } from "react";
import type { ScheduleEvent } from "@/types/gym/scheduling";
import { generateRecurringEvents } from "@/lib/gym/scheduling-utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Repeat,
  Calendar,
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  X,
} from "lucide-react";

interface RecurringEventManagerProps {
  events: ScheduleEvent[];
  onUpdateEvent: (eventId: string, updates: Partial<ScheduleEvent>) => void;
  onDeleteEvent: (eventId: string) => void;
  onDeleteSeries: (seriesId: string) => void;
}

export function RecurringEventManager({
  events,
  onUpdateEvent,
  onDeleteEvent,
  onDeleteSeries,
}: RecurringEventManagerProps) {
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(
    null
  );
  const [showPreview, setShowPreview] = useState<string | null>(null);

  // Group events by recurring series
  const recurringGroups = useMemo(() => {
    const groups = new Map<string, ScheduleEvent[]>();

    events.forEach((event) => {
      if (event.recurring) {
        const baseId = event.id.split("-")[0]; // Remove occurrence suffix
        if (!groups.has(baseId)) {
          groups.set(baseId, []);
        }
        groups.get(baseId)!.push(event);
      }
    });

    // Sort events within each group by start time
    groups.forEach((eventList) => {
      eventList.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    });

    return groups;
  }, [events]);

  const getRecurrenceDescription = (event: ScheduleEvent) => {
    if (!event.recurring) return "";

    const { frequency, interval, endDate, daysOfWeek } = event.recurring;
    let description = `Every ${interval > 1 ? interval : ""} ${frequency}`;
    if (interval > 1) {
      description +=
        frequency === "daily"
          ? " days"
          : frequency === "weekly"
          ? " weeks"
          : " months";
    }

    if (frequency === "weekly" && daysOfWeek && daysOfWeek.length > 0) {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const selectedDays = daysOfWeek.map((day) => dayNames[day]).join(", ");
      description += ` on ${selectedDays}`;
    }

    if (endDate) {
      description += ` until ${endDate.toLocaleDateString()}`;
    }

    return description;
  };

  const handlePreviewSeries = (baseEvent: ScheduleEvent) => {
    if (!baseEvent.recurring) return;

    const generatedEvents = generateRecurringEvents(baseEvent, 10); // Preview first 10 occurrences
    setShowPreview(baseEvent.id);
  };

  const handleEditSeries = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    // This would open the event form with recurring options
    // Implementation depends on your event form component
  };

  const handleDeleteSingleEvent = (event: ScheduleEvent) => {
    onDeleteEvent(event.id);
  };

  const handleDeleteEntireSeries = (baseId: string) => {
    onDeleteSeries(baseId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Repeat className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Recurring Events</h3>
        <Badge variant="outline">{recurringGroups.size} series</Badge>
      </div>

      {recurringGroups.size === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No recurring events found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create events with recurring patterns to manage them here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Array.from(recurringGroups.entries()).map(
            ([baseId, eventSeries]) => {
              const baseEvent = eventSeries[0]; // First event in the series
              const upcomingEvents = eventSeries.filter(
                (e) => e.startTime > new Date()
              );
              const pastEvents = eventSeries.filter(
                (e) => e.startTime <= new Date()
              );

              return (
                <Card key={baseId}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Repeat className="h-4 w-4" />
                          {baseEvent.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {getRecurrenceDescription(baseEvent)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreviewSeries(baseEvent)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSeries(baseEvent)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Recurring Event</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                  This will delete all {eventSeries.length}{" "}
                                  events in this recurring series. This action
                                  cannot be undone.
                                </AlertDescription>
                              </Alert>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline">Cancel</Button>
                                <Button
                                  variant="destructive"
                                  onClick={() =>
                                    handleDeleteEntireSeries(baseId)
                                  }
                                >
                                  Delete All Events
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-sm mb-2">
                          Upcoming Events ({upcomingEvents.length})
                        </h5>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {upcomingEvents.slice(0, 5).map((event) => (
                            <div
                              key={event.id}
                              className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                            >
                              <div>
                                {event.startTime.toLocaleDateString()} at{" "}
                                {event.startTime.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSingleEvent(event)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          {upcomingEvents.length > 5 && (
                            <p className="text-xs text-muted-foreground">
                              +{upcomingEvents.length - 5} more events
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-sm mb-2">
                          Past Events ({pastEvents.length})
                        </h5>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {pastEvents.slice(-3).map((event) => (
                            <div
                              key={event.id}
                              className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm opacity-75"
                            >
                              <div>
                                {event.startTime.toLocaleDateString()} at{" "}
                                {event.startTime.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {event.status}
                              </Badge>
                            </div>
                          ))}
                          {pastEvents.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{pastEvents.length - 3} more past events
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }
          )}
        </div>
      )}

      {/* Preview Dialog */}
      {showPreview && (
        <Dialog open={!!showPreview} onOpenChange={() => setShowPreview(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Recurring Event Preview</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {/* This would show the generated recurring events */}
              <p className="text-sm text-muted-foreground">
                Preview of upcoming recurring events would be displayed here
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
