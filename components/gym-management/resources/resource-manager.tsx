"use client";

import { useState } from "react";
import type { Resource, Instructor } from "@/types/gym/scheduling";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Users, Wrench, Plus, Edit, Trash2 } from "lucide-react";

interface ResourceManagerProps {
  resources: Resource[];
  instructors: Instructor[];
  onResourceCreate: (resource: Omit<Resource, "id">) => void;
  onResourceUpdate: (id: string, resource: Partial<Resource>) => void;
  onResourceDelete: (id: string) => void;
  onInstructorCreate: (instructor: Omit<Instructor, "id">) => void;
  onInstructorUpdate: (id: string, instructor: Partial<Instructor>) => void;
  onInstructorDelete: (id: string) => void;
}

export function ResourceManager({
  resources,
  instructors,
  onResourceCreate,
  onResourceUpdate,
  onResourceDelete,
  onInstructorCreate,
  onInstructorUpdate,
  onInstructorDelete,
}: ResourceManagerProps) {
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [isInstructorDialogOpen, setIsInstructorDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(
    null
  );

  const handleResourceSubmit = (formData: FormData) => {
    const resourceData = {
      name: formData.get("name") as string,
      type: formData.get("type") as "room" | "equipment" | "area",
      capacity: Number.parseInt(formData.get("capacity") as string),
      description: formData.get("description") as string,
      available: formData.get("available") === "on",
    };

    if (editingResource) {
      onResourceUpdate(editingResource.id, resourceData);
      setEditingResource(null);
    } else {
      onResourceCreate(resourceData);
    }

    setIsResourceDialogOpen(false);
  };

  const handleInstructorSubmit = (formData: FormData) => {
    const specialties = (formData.get("specialties") as string)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const instructorData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      specialties,
      available: formData.get("available") === "on",
      color: formData.get("color") as string,
    };

    if (editingInstructor) {
      onInstructorUpdate(editingInstructor.id, instructorData);
      setEditingInstructor(null);
    } else {
      onInstructorCreate(instructorData);
    }

    setIsInstructorDialogOpen(false);
  };

  const getResourceIcon = (type: Resource["type"]) => {
    switch (type) {
      case "room":
        return <MapPin className="h-4 w-4" />;
      case "equipment":
        return <Wrench className="h-4 w-4" />;
      case "area":
        return <Users className="h-4 w-4" />;
    }
  };

  const getResourceTypeColor = (type: Resource["type"]) => {
    switch (type) {
      case "room":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "equipment":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "area":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Resource Management</h2>
          <p className="text-muted-foreground">
            Manage facilities, equipment, and instructors
          </p>
        </div>
      </div>

      <Tabs defaultValue="resources" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="resources">Resources & Facilities</TabsTrigger>
          <TabsTrigger value="instructors">Instructors</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Resources & Facilities</h3>
            <Dialog
              open={isResourceDialogOpen}
              onOpenChange={setIsResourceDialogOpen}
            >
              <DialogTrigger asChild>
                <Button onClick={() => setEditingResource(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Resource
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingResource ? "Edit Resource" : "Add New Resource"}
                  </DialogTitle>
                </DialogHeader>
                <form action={handleResourceSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={editingResource?.name}
                        placeholder="e.g., Main Gym Floor"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select name="type" defaultValue={editingResource?.type}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="room">Room</SelectItem>
                          <SelectItem value="equipment">Equipment</SelectItem>
                          <SelectItem value="area">Area</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      name="capacity"
                      type="number"
                      defaultValue={editingResource?.capacity}
                      placeholder="Maximum number of people"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={editingResource?.description}
                      placeholder="Optional description"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="available"
                      name="available"
                      defaultChecked={editingResource?.available ?? true}
                    />
                    <Label htmlFor="available">Available for booking</Label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsResourceDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingResource ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <Card key={resource.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getResourceIcon(resource.type)}
                      <CardTitle className="text-lg">{resource.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingResource(resource);
                          setIsResourceDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onResourceDelete(resource.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className={getResourceTypeColor(resource.type)}>
                        {resource.type}
                      </Badge>
                      <Badge
                        variant={resource.available ? "default" : "secondary"}
                      >
                        {resource.available ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div>Capacity: {resource.capacity} people</div>
                      {resource.description && (
                        <div className="mt-1">{resource.description}</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="instructors" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Instructors</h3>
            <Dialog
              open={isInstructorDialogOpen}
              onOpenChange={setIsInstructorDialogOpen}
            >
              <DialogTrigger asChild>
                <Button onClick={() => setEditingInstructor(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Instructor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingInstructor
                      ? "Edit Instructor"
                      : "Add New Instructor"}
                  </DialogTitle>
                </DialogHeader>
                <form action={handleInstructorSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="instructor-name">Name</Label>
                      <Input
                        id="instructor-name"
                        name="name"
                        defaultValue={editingInstructor?.name}
                        placeholder="Full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={editingInstructor?.email}
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="specialties">Specialties</Label>
                    <Input
                      id="specialties"
                      name="specialties"
                      defaultValue={editingInstructor?.specialties.join(", ")}
                      placeholder="e.g., Gymnastics, Rock Climbing, Yoga"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Separate multiple specialties with commas
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="color">Calendar Color</Label>
                    <Input
                      id="color"
                      name="color"
                      type="color"
                      defaultValue={editingInstructor?.color || "#3b82f6"}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="instructor-available"
                      name="available"
                      defaultChecked={editingInstructor?.available ?? true}
                    />
                    <Label htmlFor="instructor-available">
                      Available for scheduling
                    </Label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsInstructorDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingInstructor ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {instructors.map((instructor) => (
              <Card key={instructor.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: instructor.color }}
                      />
                      <CardTitle className="text-lg">
                        {instructor.name}
                      </CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingInstructor(instructor);
                          setIsInstructorDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onInstructorDelete(instructor.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      {instructor.email}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {instructor.specialties.map((specialty) => (
                        <Badge
                          key={specialty}
                          variant="outline"
                          className="text-xs"
                        >
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    <Badge
                      variant={instructor.available ? "default" : "secondary"}
                    >
                      {instructor.available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
