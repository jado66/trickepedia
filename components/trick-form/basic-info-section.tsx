"use client";

import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star } from "lucide-react";
import { getDifficultyColor, getDifficultyLabel } from "@/lib/trick-form-utils";
import type { TrickFormSectionProps } from "@/types/trick-form";

export function BasicInfoSection({
  formData,
  mode,
  onFieldChange,
  trickType,
  allTricks,
  onParentChange,
  onPromotedChange,
  onDetailsChange,
}: TrickFormSectionProps) {
  return (
    <AccordionItem value="basic" className="border rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Star className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold">Basic Information</h3>
            <p className="text-sm text-muted-foreground">
              Name, description, difficulty, and route
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Trick Name *</Label>
            {mode === "view" ? (
              <div className="text-xl font-semibold">{formData.name}</div>
            ) : (
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onFieldChange("name", e.target.value)}
                placeholder="Enter trick name"
                required
              />
            )}
          </div>

          {/* Slug (Route) */}
          <div className="space-y-2">
            <Label htmlFor="slug">Route *</Label>
            {mode === "view" ? (
              <div className="p-4 bg-muted/50 rounded-lg font-mono text-sm">
                /{formData.slug}
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                    /
                  </span>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => onFieldChange("slug", e.target.value)}
                    placeholder="untitled-trick"
                    required
                    className="rounded-l-none"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  This is the URL route for the trick and must be unique.
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            {mode === "view" ? (
              <div className="p-4 bg-muted/50 rounded-lg text-pretty">
                {formData.description}
              </div>
            ) : (
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => onFieldChange("description", e.target.value)}
                placeholder="Describe what this trick involves..."
                rows={4}
                required
              />
            )}
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level (1-10) *</Label>
            {mode === "view" ? (
              <Badge className={getDifficultyColor(formData.difficulty_level)}>
                {getDifficultyLabel(formData.difficulty_level)} (
                {formData.difficulty_level}/10)
              </Badge>
            ) : (
              <Select
                value={formData.difficulty_level.toString()}
                onValueChange={(value) =>
                  onFieldChange("difficulty_level", Number.parseInt(value))
                }
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Beginner</SelectItem>
                  <SelectItem value="2">2 - Beginner</SelectItem>
                  <SelectItem value="3">3 - Beginner</SelectItem>
                  <SelectItem value="4">4 - Intermediate</SelectItem>
                  <SelectItem value="5">5 - Intermediate</SelectItem>
                  <SelectItem value="6">6 - Intermediate</SelectItem>
                  <SelectItem value="7">7 - Advanced</SelectItem>
                  <SelectItem value="8">8 - Advanced</SelectItem>
                  <SelectItem value="9">9 - Advanced</SelectItem>
                  <SelectItem value="10">10 - Advanced</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
