"use client";

import React, { useState } from "react";
import { useGym } from "@/contexts/gym/gym-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

export default function AddStaffDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { addStaff, demoMode, limits, staff } = useGym();
  const [submitting, setSubmitting] = useState(false);

  const handleAddStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const specialties = (formData.get("specialties") as string)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const certifications = (formData.get("certifications") as string)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setSubmitting(true);
    const res = await addStaff({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      role: formData.get("role") as string,
      specialties,
      status: "active",
      schedule: "",
      hourlyRate: Number.parseFloat(formData.get("hourlyRate") as string) || 0,
      certifications,
      emergencyContact: formData.get("emergencyContact") as string,
    });
    setSubmitting(false);
    if (!res.success) {
      alert(res.error);
      return;
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={demoMode && staff.length >= limits.staff}>
          <Plus className="h-4 w-4 mr-2" />
          {demoMode && staff.length >= limits.staff
            ? "Demo Limit"
            : "Add Staff"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
          <DialogDescription>
            Add a new coach or instructor to your team.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddStaff} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select name="role" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Head Coach">Head Coach</SelectItem>
                  <SelectItem value="Gymnastics Coach">
                    Gymnastics Coach
                  </SelectItem>
                  <SelectItem value="Parkour Instructor">
                    Parkour Instructor
                  </SelectItem>
                  <SelectItem value="Tumbling Coach">Tumbling Coach</SelectItem>
                  <SelectItem value="Fitness Instructor">
                    Fitness Instructor
                  </SelectItem>
                  <SelectItem value="Assistant Coach">
                    Assistant Coach
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
              <Input
                id="hourlyRate"
                name="hourlyRate"
                type="number"
                step="0.01"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availability">Availability (optional)</Label>
              <Input
                id="availability"
                name="availability"
                placeholder="e.g., Mon-Fri 4pm-8pm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialties">Specialties (comma-separated)</Label>
            <Input
              id="specialties"
              name="specialties"
              placeholder="e.g., Gymnastics, Tumbling, Parkour"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="certifications">
              Certifications (comma-separated)
            </Label>
            <Textarea
              id="certifications"
              name="certifications"
              placeholder="e.g., USA Gymnastics Safety Certified, CPR/First Aid"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Emergency Contact</Label>
            <Input
              id="emergencyContact"
              name="emergencyContact"
              placeholder="Name - Phone Number"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding..." : "Add Staff Member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
