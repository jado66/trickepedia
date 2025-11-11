"use client";

import { useState } from "react";
import type { Resource, Instructor } from "@/types/gym/scheduling";
import { ResourceManager } from "./resource-manager";

// Sample data
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
    id: "trampoline-area",
    name: "Trampoline Area",
    type: "area",
    capacity: 8,
    description: "Dedicated trampoline training area",
    available: true,
  },
  {
    id: "studio-1",
    name: "Studio 1",
    type: "room",
    capacity: 15,
    description: "Mirrored studio for dance and yoga classes",
    available: false,
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

export default function ResourcesTab() {
  const [resources, setResources] = useState<Resource[]>(sampleResources);
  const [instructors, setInstructors] =
    useState<Instructor[]>(sampleInstructors);

  const handleResourceCreate = (resourceData: Omit<Resource, "id">) => {
    const newResource: Resource = {
      ...resourceData,
      id: `resource-${Date.now()}`,
    };
    setResources([...resources, newResource]);
  };

  const handleResourceUpdate = (
    id: string,
    resourceData: Partial<Resource>
  ) => {
    setResources(
      resources.map((r) => (r.id === id ? { ...r, ...resourceData } : r))
    );
  };

  const handleResourceDelete = (id: string) => {
    setResources(resources.filter((r) => r.id !== id));
  };

  const handleInstructorCreate = (instructorData: Omit<Instructor, "id">) => {
    const newInstructor: Instructor = {
      ...instructorData,
      id: `instructor-${Date.now()}`,
    };
    setInstructors([...instructors, newInstructor]);
  };

  const handleInstructorUpdate = (
    id: string,
    instructorData: Partial<Instructor>
  ) => {
    setInstructors(
      instructors.map((i) => (i.id === id ? { ...i, ...instructorData } : i))
    );
  };

  const handleInstructorDelete = (id: string) => {
    setInstructors(instructors.filter((i) => i.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <ResourceManager
        resources={resources}
        instructors={instructors}
        onResourceCreate={handleResourceCreate}
        onResourceUpdate={handleResourceUpdate}
        onResourceDelete={handleResourceDelete}
        onInstructorCreate={handleInstructorCreate}
        onInstructorUpdate={handleInstructorUpdate}
        onInstructorDelete={handleInstructorDelete}
      />
    </div>
  );
}
