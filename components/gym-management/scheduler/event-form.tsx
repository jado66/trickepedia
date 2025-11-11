"use client";

import { useState } from "react";
import type {
  ScheduleEvent,
  Resource,
  Instructor,
} from "@/types/gym/scheduling";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { X, Users, MapPin } from "lucide-react";
import { RecurringEventForm } from "../recurring/recurring-event-form";

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: Partial<ScheduleEvent>) => void;
  event?: ScheduleEvent | null;
  resources: Resource[];
  instructors: Instructor[];
  selectedDate?: Date;
  selectedTime?: string;
}

export function EventForm({
  isOpen,
  onClose,
  onSubmit,
  event,
  resources,
  instructors,
  selectedDate,
  selectedTime,
}: EventFormProps) {
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>(
    event?.instructors || []
  );
  const [selectedResources, setSelectedResources] = useState<string[]>(
    event?.resources || []
  );
  const [eventType, setEventType] = useState<ScheduleEvent["type"]>(
    event?.type || "class"
  );
  const [recurring, setRecurring] = useState<{
    frequency: "daily" | "weekly" | "monthly";
    interval: number;
    endDate?: Date;
    daysOfWeek?: number[];
  } | null>(event?.recurring || null);

  const handleSubmit = (formData: FormData) => {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const capacity = Number.parseInt(formData.get("capacity") as string);
    const duration = Number.parseInt(formData.get("duration") as string);
    const price = Number.parseFloat(formData.get("price") as string);
    const level = formData.get("level") as string;

    // Calculate start and end times
    let startTime: Date;
    let endTime: Date;

    if (event) {
      // Editing existing event - preserve original times unless specified
      startTime = event.startTime;
      endTime = event.endTime;
    } else if (selectedDate && selectedTime) {
      // Creating new event with specific time
      const [hour, minute] = selectedTime.split(":").map(Number);
      startTime = new Date(selectedDate);
      startTime.setHours(hour, minute, 0, 0);
      endTime = new Date(startTime.getTime() + duration * 60 * 1000);
    } else {
      // Default to current time
      startTime = new Date();
      endTime = new Date(startTime.getTime() + duration * 60 * 1000);
    }

    const eventData: Partial<ScheduleEvent> = {
      title,
      description,
      startTime,
      endTime,
      instructors: selectedInstructors,
      resources: selectedResources,
      capacity,
      type: eventType,
      level: level || undefined,
      price,
      duration,
      status: "scheduled",
      recurring: recurring || undefined, // Convert null to undefined
    };

    onSubmit(eventData);
    onClose();

    // Reset form
    setSelectedInstructors([]);
    setSelectedResources([]);
    setEventType("class");
    setRecurring(null);
  };

  const toggleInstructor = (instructorId: string) => {
    setSelectedInstructors((prev) =>
      prev.includes(instructorId)
        ? prev.filter((id) => id !== instructorId)
        : [...prev, instructorId]
    );
  };

  const toggleResource = (resourceId: string) => {
    setSelectedResources((prev) =>
      prev.includes(resourceId)
        ? prev.filter((id) => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  const getInstructorById = (id: string) =>
    instructors.find((i) => i.id === id);
  const getResourceById = (id: string) => resources.find((r) => r.id === id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Create New Event"}</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={event?.title}
                    placeholder="e.g., Beginner Gymnastics"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Event Type</Label>
                  <Select
                    name="type"
                    value={eventType}
                    onValueChange={(value) =>
                      setEventType(value as ScheduleEvent["type"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="class">Class</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="competition">Competition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={event?.description}
                  placeholder="Brief description of the event"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    defaultValue={event?.capacity || 12}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    defaultValue={event?.duration || 60}
                    min="15"
                    step="15"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={event?.price || 0}
                    min="0"
                  />
                </div>
              </div>

              {eventType === "class" && (
                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select name="level" defaultValue={event?.level}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="All Levels">All Levels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Multi-Instructor Selection */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Instructors ({selectedInstructors.length} selected)
                </Label>

                {/* Selected Instructors */}
                {selectedInstructors.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                    {selectedInstructors.map((instructorId) => {
                      const instructor = getInstructorById(instructorId);
                      if (!instructor) return null;
                      return (
                        <Badge
                          key={instructorId}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: instructor.color }}
                          />
                          {instructor.name}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => toggleInstructor(instructorId)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      );
                    })}
                  </div>
                )}

                {/* Available Instructors */}
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                  {instructors
                    .filter((instructor) => instructor.available)
                    .map((instructor) => (
                      <Card
                        key={instructor.id}
                        className={`cursor-pointer transition-colors ${
                          selectedInstructors.includes(instructor.id)
                            ? "bg-primary/10 border-primary/20"
                            : "hover:bg-accent/50"
                        }`}
                        onClick={() => toggleInstructor(instructor.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedInstructors.includes(
                                instructor.id
                              )}
                            />
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: instructor.color }}
                            />
                            <div className="flex-1">
                              <div className="font-medium">
                                {instructor.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {instructor.specialties.join(", ")}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>

              {/* Resource Selection */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Resources ({selectedResources.length} selected)
                </Label>

                {/* Selected Resources */}
                {selectedResources.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                    {selectedResources.map((resourceId) => {
                      const resource = getResourceById(resourceId);
                      if (!resource) return null;
                      return (
                        <Badge
                          key={resourceId}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {resource.name}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => toggleResource(resourceId)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      );
                    })}
                  </div>
                )}

                {/* Available Resources */}
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                  {resources
                    .filter((resource) => resource.available)
                    .map((resource) => (
                      <Card
                        key={resource.id}
                        className={`cursor-pointer transition-colors ${
                          selectedResources.includes(resource.id)
                            ? "bg-primary/10 border-primary/20"
                            : "hover:bg-accent/50"
                        }`}
                        onClick={() => toggleResource(resource.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedResources.includes(resource.id)}
                            />
                            <div className="flex-1">
                              <div className="font-medium">{resource.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {resource.type} • Capacity: {resource.capacity}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            </div>

            {/* Right Column - Recurring Settings */}
            <div>
              <RecurringEventForm
                recurring={recurring || undefined}
                onChange={setRecurring}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {event ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
