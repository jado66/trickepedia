"use client";

import { useMemo } from "react";
import type {
  ScheduleEvent,
  Instructor,
  Resource,
} from "@/types/gym/scheduling";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, MapPin, TrendingUp, DollarSign } from "lucide-react";

interface AnalyticsCardsProps {
  events: ScheduleEvent[];
  instructors: Instructor[];
  resources: Resource[];
  dateRange: { start: Date; end: Date };
}

export function AnalyticsCards({
  events,
  instructors,
  resources,
  dateRange,
}: AnalyticsCardsProps) {
  const analytics = useMemo(() => {
    const filteredEvents = events.filter(
      (event) =>
        event.startTime >= dateRange.start && event.startTime <= dateRange.end
    );

    const totalEvents = filteredEvents.length;
    const totalEnrollment = filteredEvents.reduce(
      (sum, event) => sum + event.enrolled,
      0
    );
    const totalCapacity = filteredEvents.reduce(
      (sum, event) => sum + event.capacity,
      0
    );
    const totalRevenue = filteredEvents.reduce(
      (sum, event) => sum + (event.price || 0) * event.enrolled,
      0
    );

    const eventsByType = filteredEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const eventsByStatus = filteredEvents.reduce((acc, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const instructorWorkload = instructors.map((instructor) => {
      const instructorEvents = filteredEvents.filter((event) =>
        event.instructors.includes(instructor.id)
      );
      const totalHours = instructorEvents.reduce((sum, event) => {
        const duration =
          (event.endTime.getTime() - event.startTime.getTime()) /
          (1000 * 60 * 60);
        return sum + duration;
      }, 0);
      return {
        instructor,
        eventCount: instructorEvents.length,
        totalHours,
      };
    });

    const resourceUtilization = resources.map((resource) => {
      const resourceEvents = filteredEvents.filter((event) =>
        event.resources.includes(resource.id)
      );
      const totalHours = resourceEvents.reduce((sum, event) => {
        const duration =
          (event.endTime.getTime() - event.startTime.getTime()) /
          (1000 * 60 * 60);
        return sum + duration;
      }, 0);

      // Calculate utilization percentage (assuming 12 hours per day, 7 days per week)
      const totalAvailableHours =
        12 *
        7 *
        Math.ceil(
          (dateRange.end.getTime() - dateRange.start.getTime()) /
            (1000 * 60 * 60 * 24 * 7)
        );
      const utilizationPercentage = (totalHours / totalAvailableHours) * 100;

      return {
        resource,
        eventCount: resourceEvents.length,
        totalHours,
        utilizationPercentage: Math.min(utilizationPercentage, 100),
      };
    });

    const averageCapacityUtilization =
      totalCapacity > 0 ? (totalEnrollment / totalCapacity) * 100 : 0;

    return {
      totalEvents,
      totalEnrollment,
      totalCapacity,
      totalRevenue,
      averageCapacityUtilization,
      eventsByType,
      eventsByStatus,
      instructorWorkload,
      resourceUtilization,
    };
  }, [events, instructors, resources, dateRange]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.totalEvents}</div>
          <div className="flex gap-2 mt-2">
            {Object.entries(analytics.eventsByType).map(([type, count]) => (
              <Badge key={type} variant="outline" className="text-xs">
                {type}: {count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enrollment Stats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Enrollment</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.totalEnrollment}</div>
          <div className="text-xs text-muted-foreground">
            {analytics.totalCapacity} total capacity
          </div>
          <Progress
            value={analytics.averageCapacityUtilization}
            className="mt-2"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {analytics.averageCapacityUtilization.toFixed(1)}% capacity
            utilization
          </div>
        </CardContent>
      </Card>

      {/* Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${analytics.totalRevenue.toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground">
            $
            {analytics.totalEvents > 0
              ? (analytics.totalRevenue / analytics.totalEvents).toFixed(2)
              : "0.00"}{" "}
            avg per event
          </div>
        </CardContent>
      </Card>

      {/* Event Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Event Status</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(analytics.eventsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <Badge
                  variant={
                    status === "scheduled"
                      ? "default"
                      : status === "completed"
                      ? "secondary"
                      : "destructive"
                  }
                  className="text-xs"
                >
                  {status}
                </Badge>
                <span className="text-sm font-medium">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Instructors */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Instructor Workload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.instructorWorkload
              .sort((a, b) => b.totalHours - a.totalHours)
              .slice(0, 5)
              .map(({ instructor, eventCount, totalHours }) => (
                <div
                  key={instructor.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: instructor.color }}
                    />
                    <span className="text-sm font-medium">
                      {instructor.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {totalHours.toFixed(1)}h
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {eventCount} events
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Resource Utilization */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Resource Utilization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.resourceUtilization
              .sort((a, b) => b.utilizationPercentage - a.utilizationPercentage)
              .map(
                ({
                  resource,
                  eventCount,
                  totalHours,
                  utilizationPercentage,
                }) => (
                  <div key={resource.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {resource.name}
                      </span>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {utilizationPercentage.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {eventCount} events
                        </div>
                      </div>
                    </div>
                    <Progress value={utilizationPercentage} className="h-2" />
                  </div>
                )
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
