"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { Check, CheckCircle2 } from "lucide-react";
import { MasterCategory } from "../skill-tree.types";
import { iconMap } from "../side-nav/icon-map";

// Some callers include a `status` (e.g. "in_progress") used to show a Beta badge.
type CategoryWithStatus = MasterCategory & { status?: string | null };

interface SportsSelectionProps {
  categories: CategoryWithStatus[];
  userSportsIds: string[];
  onToggleSport: (categoryId: string) => Promise<void> | void;
  onFinish: () => void;
  loading?: boolean;
}

const getCategoryIcon = (iconName?: string | null) => {
  if (!iconName) return iconMap.circle || CheckCircle2;
  // Support both exact, lowercase, kebab & camel case lookups
  const direct = iconMap[iconName];
  if (direct) return direct;
  const lower = iconName.toLowerCase();
  if (iconMap[lower]) return iconMap[lower];
  // Convert kebab to camel
  const camel = lower.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  if (iconMap[camel]) return iconMap[camel];
  return iconMap.circle || CheckCircle2;
};

export function SportsSelection({
  categories,
  userSportsIds,
  onToggleSport,
  onFinish,
}: SportsSelectionProps) {
  const [showHidden, setShowHidden] = useState(false);
  const allSelected =
    categories.length > 0 && userSportsIds.length === categories.length;

  const handleSelectAll = () => {
    if (allSelected) {
      // Clear all
      categories.forEach((c) => {
        if (userSportsIds.includes(c.id)) onToggleSport(c.id);
      });
    } else {
      categories.forEach((c) => {
        if (!userSportsIds.includes(c.id)) onToggleSport(c.id);
      });
    }
  };

  const visibleCategories = useMemo(
    () =>
      showHidden
        ? categories
        : categories.filter((c) =>
            // Prefer explicit is_active if present, else infer from status
            (c as any).is_active !== undefined
              ? (c as any).is_active
              : c.status !== "hidden"
          ),
    [categories, showHidden]
  );

  return (
    <div className="px-4">
      <div className="mb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4 ">
        <div>
          <h2 className="text-2xl font-bold mb-1">
            What Are You Interested In?
          </h2>
          <p className="text-muted-foreground text-sm max-w-prose">
            Select any sports you&apos;re interested in. We&apos;ll tailor trick
            suggestions and progress to these categories. You can always update
            your selections later.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHidden((v) => !v)}
            className="order-2 md:order-none"
          >
            {showHidden ? "Hide Unlisted" : "Show Unlisted"}
          </Button>
          {userSportsIds.length > 0 && (
            <Button size="sm" onClick={onFinish}>
              Continue
            </Button>
          )}
        </div>
      </div>

      <div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6"
        role="list"
        aria-label="Sports categories multi-select"
      >
        {visibleCategories.map((category) => {
          const isSelected = userSportsIds.includes(category.id);
          const Icon = getCategoryIcon(category.icon_name);
          const isHidden =
            (category as any).is_active === false ||
            category.status === "hidden";
          return (
            <Card
              key={category.id}
              role="checkbox"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggleSport(category.id);
                }
              }}
              className={`relative cursor-pointer transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                isSelected ? "ring-2 ring-primary" : "border-muted"
              }`}
              onClick={() => onToggleSport(category.id)}
            >
              <CardHeader className="pr-10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted/40">
                      <Icon className="h-6 w-6 text-foreground/70" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold leading-tight">
                        {category.name}
                      </CardTitle>
                      {category.status === "in_progress" && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300 tracking-wide">
                          BETA
                        </span>
                      )}
                      {showHidden && isHidden && (
                        <span className="inline-block mt-1 ml-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-muted text-muted-foreground border border-border tracking-wide">
                          UNLISTED
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div
                  className={`absolute top-3 right-3 w-5 h-5 rounded-sm border flex items-center justify-center text-white transition-colors ${
                    isSelected
                      ? "bg-primary border-primary"
                      : "border-muted-foreground/30 bg-background"
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                  <span className="sr-only">
                    {isSelected ? "Selected" : "Not selected"}
                  </span>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-between text-sm">
        <div className="text-muted-foreground flex items-center gap-2">
          <span>
            {userSportsIds.length === 0
              ? "No sports selected"
              : `${userSportsIds.length} selected`}
          </span>
          {!showHidden &&
            categories.some(
              (c) => (c as any).is_active === false || c.status === "hidden"
            ) && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-muted">
                Hidden filtered
              </span>
            )}
        </div>
      </div>
    </div>
  );
}
