"use client";

import { useState, useMemo } from "react";
import type {
  ScheduleEvent,
  Instructor,
  Resource,
} from "@/types/gym/scheduling";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatTimeRange } from "@/lib/gym/scheduling-utils";
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Users,
  MapPin,
  Clock,
  DollarSign,
} from "lucide-react";

interface EventListProps {
  events: ScheduleEvent[];
  instructors: Instructor[];
  resources: Resource[];
  onEventEdit: (event: ScheduleEvent) => void;
  onEventDelete: (eventId: string) => void;
}

export function EventList({
  events,
  instructors,
  resources,
  onEventEdit,
  onEventDelete,
}: EventListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("startTime");

  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(term) ||
          event.description?.toLowerCase().includes(term) ||
          event.level?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((event) => event.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((event) => event.type === typeFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "startTime":
          return a.startTime.getTime() - b.startTime.getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "enrollment":
          return b.enrolled - a.enrolled;
        case "revenue":
          return (b.price || 0) * b.enrolled - (a.price || 0) * a.enrolled;
        default:
          return 0;
      }
    });

    return filtered;
  }, [events, searchTerm, statusFilter, typeFilter, sortBy]);

  const getInstructorNames = (instructorIds: string[]) => {
    return instructorIds
      .map((id) => instructors.find((i) => i.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  const getResourceNames = (resourceIds: string[]) => {
    return resourceIds
      .map((id) => resources.find((r) => r.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  const getEventTypeColor = (type: ScheduleEvent["type"]) => {
    switch (type) {
      case "class":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "event":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "competition":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    }
  };

  const getStatusColor = (status: ScheduleEvent["status"]) => {
    switch (status) {
      case "scheduled":
        return "default";
      case "completed":
        return "secondary";
      case "cancelled":
        return "destructive";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Event Management</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="class">Classes</SelectItem>
                <SelectItem value="event">Events</SelectItem>
                <SelectItem value="competition">Competitions</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="startTime">Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="enrollment">Enrollment</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredAndSortedEvents.length === 0 ? (
            <div className="text-center py-8">
              <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No events found matching your criteria
              </p>
            </div>
          ) : (
            filteredAndSortedEvents.map((event) => (
              <Card
                key={event.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{event.title}</h3>
                        <Badge className={getEventTypeColor(event.type)}>
                          {event.type}
                        </Badge>
                        <Badge variant={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                        {event.level && (
                          <Badge variant="outline" className="text-xs">
                            {event.level}
                          </Badge>
                        )}
                        {event.recurring && (
                          <Badge variant="outline" className="text-xs">
                            Recurring
                          </Badge>
                        )}
                      </div>

                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {event.description}
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {formatTimeRange(event.startTime, event.endTime)}
                            </div>
                            <div className="text-muted-foreground">
                              {event.startTime.toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {event.enrolled}/{event.capacity} enrolled
                            </div>
                            <div className="text-muted-foreground">
                              {(
                                (event.enrolled / event.capacity) *
                                100
                              ).toFixed(0)}
                              % full
                            </div>
                          </div>
                        </div>

                        {event.price && event.price > 0 && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">${event.price}</div>
                              <div className="text-muted-foreground">
                                ${(event.price * event.enrolled).toFixed(2)}{" "}
                                revenue
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {getResourceNames(event.resources) ||
                                "No resources"}
                            </div>
                            <div className="text-muted-foreground">
                              {getInstructorNames(event.instructors) ||
                                "No instructors"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEventEdit(event)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEventDelete(event.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
