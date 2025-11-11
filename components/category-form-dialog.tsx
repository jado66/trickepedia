"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
// Switch removed in favor of unified status select
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  createMasterCategory,
  updateMasterCategory,
  type MasterCategory,
} from "@/lib/client/categories-data-client";

interface CategoryFormDialogProps {
  category: MasterCategory | null;
  open: boolean;
  onClose: () => void;
}

const iconOptions = [
  { value: "zap", label: "Zap" },
  { value: "rotate-ccw", label: "Rotate" },
  { value: "activity", label: "Activity" },
  { value: "bounce", label: "Bounce" },
  { value: "circle", label: "Circle" },
];

const colorOptions = [
  { value: "#164e63", label: "Cyan", color: "#164e63" },
  { value: "#ec4899", label: "Pink", color: "#ec4899" },
  { value: "#0891b2", label: "Sky", color: "#0891b2" },
  { value: "#7c3aed", label: "Violet", color: "#7c3aed" },
  { value: "#dc2626", label: "Red", color: "#dc2626" },
  { value: "#059669", label: "Green", color: "#059669" },
  { value: "#d97706", label: "Orange", color: "#d97706" },
];

export function CategoryFormDialog({
  category,
  open,
  onClose,
}: CategoryFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
    status: "active" as "active" | "in_progress" | "hidden",
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description ?? "",
        slug: category.slug,
        status: category.status ?? (category.is_active ? "active" : "hidden"),
        is_active: category.is_active,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        slug: "",
        status: "active",
        is_active: true,
      });
    }
    setError("");
  }, [category, open]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug:
        prev.slug === generateSlug(prev.name) || prev.slug === ""
          ? generateSlug(name)
          : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        slug: formData.slug.trim(),
        status: formData.status,
        is_active: formData.status !== "hidden",
      } as any;
      if (category) await updateMasterCategory(category.id, payload);
      else await createMasterCategory(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit Category" : "Create Category"}
          </DialogTitle>
          <DialogDescription>
            {category
              ? "Update the category details below."
              : "Add a new movement discipline category."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Parkour"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder="e.g., parkour"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Brief description of the discipline..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) =>
                setFormData((prev) => ({
                  ...prev,
                  status: value,
                  is_active: value !== "hidden",
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="in_progress">Beta</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Active & Beta will be publicly visible; Hidden will not.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : category ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
