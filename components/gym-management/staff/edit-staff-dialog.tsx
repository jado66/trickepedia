"use client";

import React, { useEffect, useState } from "react";
import { useGym } from "@/contexts/gym/gym-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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

export default function EditStaffDialog({
  open,
  onOpenChange,
  staffMember,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  staffMember: any | null;
}) {
  const { updateStaff } = useGym();
  const [submitting, setSubmitting] = useState(false);
  const [formModel, setFormModel] = useState<any | null>(null);

  useEffect(() => setFormModel(staffMember), [staffMember]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formModel) return;
    const fd = new FormData(e.currentTarget);
    const specialties = (fd.get("specialties") as string)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const certifications = (fd.get("certifications") as string)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setSubmitting(true);
    const res = await updateStaff(formModel.id, {
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      phone: fd.get("phone") as string,
      role: fd.get("role") as string,
      specialties,
      hourlyRate: Number.parseFloat(fd.get("hourlyRate") as string) || 0,
      certifications,
      emergencyContact: fd.get("emergencyContact") as string,
    });
    setSubmitting(false);
    if (!res.success) {
      alert(res.error);
      return;
    }
    onOpenChange(false);
  };

  if (!staffMember) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Staff Member</DialogTitle>
          <DialogDescription>Update staff details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={staffMember.name}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select name="role" defaultValue={staffMember.role}>
                <SelectTrigger>
                  <SelectValue />
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
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={staffMember.email}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={staffMember.phone}
                required
              />
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
                defaultValue={String(staffMember.hourlyRate || "")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availability">Availability (optional)</Label>
              <Input
                id="availability"
                name="availability"
                placeholder="e.g., Mon-Fri 4pm-8pm"
                defaultValue={staffMember.availability || ""}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialties">Specialties (comma-separated)</Label>
            <Input
              id="specialties"
              name="specialties"
              defaultValue={(staffMember.specialties || []).join(", ")}
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
              defaultValue={(staffMember.certifications || []).join(", ")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Emergency Contact</Label>
            <Input
              id="emergencyContact"
              name="emergencyContact"
              defaultValue={staffMember.emergencyContact || ""}
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
              {submitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
