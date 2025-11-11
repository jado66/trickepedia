"use client";

import { useMemo } from "react";
import type {
  Resource,
  Instructor,
  ScheduleEvent,
} from "@/types/gym/scheduling";
import {
  isResourceAvailable,
  isInstructorAvailable,
  formatTimeRange,
} from "@/lib/gym/scheduling-utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface ResourceAvailabilityProps {
  resources: Resource[];
  instructors: Instructor[];
  events: ScheduleEvent[];
  selectedDate: Date;
  selectedTimeRange?: { start: Date; end: Date };
}

export function ResourceAvailability({
  resources,
  instructors,
  events,
  selectedDate,
  selectedTimeRange,
}: ResourceAvailabilityProps) {
  const availabilityData = useMemo(() => {
    if (!selectedTimeRange) return null;

    const availableResources = resources.filter((resource) =>
      isResourceAvailable(
        resource,
        selectedTimeRange.start,
        selectedTimeRange.end,
        events
      )
    );

    const unavailableResources = resources.filter(
      (resource) =>
        !isResourceAvailable(
          resource,
          selectedTimeRange.start,
          selectedTimeRange.end,
          events
        )
    );

    const availableInstructors = instructors.filter((instructor) =>
      isInstructorAvailable(
        instructor,
        selectedTimeRange.start,
        selectedTimeRange.end,
        events
      )
    );

    const unavailableInstructors = instructors.filter(
      (instructor) =>
        !isInstructorAvailable(
          instructor,
          selectedTimeRange.start,
          selectedTimeRange.end,
          events
        )
    );

    const conflictingEvents = events.filter((event) => {
      return (
        (selectedTimeRange.start >= event.startTime &&
          selectedTimeRange.start < event.endTime) ||
        (selectedTimeRange.end > event.startTime &&
          selectedTimeRange.end <= event.endTime) ||
        (selectedTimeRange.start <= event.startTime &&
          selectedTimeRange.end >= event.endTime)
      );
    });

    return {
      availableResources,
      unavailableResources,
      availableInstructors,
      unavailableInstructors,
      conflictingEvents,
    };
  }, [resources, instructors, events, selectedTimeRange]);

  if (!selectedTimeRange || !availabilityData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Resource Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Select a time range to check resource availability
          </p>
        </CardContent>
      </Card>
    );
  }

  const {
    availableResources,
    unavailableResources,
    availableInstructors,
    unavailableInstructors,
    conflictingEvents,
  } = availabilityData;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Availability Check
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {formatTimeRange(selectedTimeRange.start, selectedTimeRange.end)} on{" "}
            {selectedDate.toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {conflictingEvents.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {conflictingEvents.length} conflicting event(s) found during
                this time period
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Available Resources */}
            <div>
              <h4 className="font-medium text-green-500 mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Available Resources ({availableResources.length})
              </h4>
              <div className="space-y-2">
                {availableResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between p-2 bg-green-500/10 border border-green-500/20 rounded"
                  >
                    <div>
                      <div className="font-medium">{resource.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {resource.type} • Capacity: {resource.capacity}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-green-500 border-green-500/20"
                    >
                      Available
                    </Badge>
                  </div>
                ))}
                {availableResources.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No resources available
                  </p>
                )}
              </div>
            </div>

            {/* Available Instructors */}
            <div>
              <h4 className="font-medium text-green-500 mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Available Instructors ({availableInstructors.length})
              </h4>
              <div className="space-y-2">
                {availableInstructors.map((instructor) => (
                  <div
                    key={instructor.id}
                    className="flex items-center justify-between p-2 bg-green-500/10 border border-green-500/20 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: instructor.color }}
                      />
                      <div>
                        <div className="font-medium">{instructor.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {instructor.specialties.join(", ")}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-green-500 border-green-500/20"
                    >
                      Available
                    </Badge>
                  </div>
                ))}
                {availableInstructors.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No instructors available
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Unavailable Resources & Instructors */}
          {(unavailableResources.length > 0 ||
            unavailableInstructors.length > 0) && (
            <div className="pt-4 border-t border-border">
              <h4 className="font-medium text-red-500 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Unavailable
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unavailableResources.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">
                      Resources ({unavailableResources.length})
                    </h5>
                    <div className="space-y-1">
                      {unavailableResources.map((resource) => (
                        <div
                          key={resource.id}
                          className="text-sm p-2 bg-red-500/10 border border-red-500/20 rounded"
                        >
                          {resource.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {unavailableInstructors.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">
                      Instructors ({unavailableInstructors.length})
                    </h5>
                    <div className="space-y-1">
                      {unavailableInstructors.map((instructor) => (
                        <div
                          key={instructor.id}
                          className="text-sm p-2 bg-red-500/10 border border-red-500/20 rounded flex items-center gap-2"
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: instructor.color }}
                          />
                          {instructor.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Conflicting Events Details */}
          {conflictingEvents.length > 0 && (
            <div className="pt-4 border-t border-border">
              <h4 className="font-medium text-orange-500 mb-2">
                Conflicting Events
              </h4>
              <div className="space-y-2">
                {conflictingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-2 bg-orange-500/10 border border-orange-500/20 rounded"
                  >
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatTimeRange(event.startTime, event.endTime)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
