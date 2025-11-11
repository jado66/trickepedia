"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useRef, useCallback } from "react";
import { Check, CheckCircle2 } from "lucide-react";
import { MasterCategory } from "../skill-tree.types";
import { iconMap } from "../side-nav/icon-map";

// Some callers include a `status` (e.g. "in_progress") used to show a Beta badge.
type CategoryWithStatus = MasterCategory & { status?: string | null };

interface SportsSelectionProps {
  categories: CategoryWithStatus[];
  userSportsIds: string[];
  onToggleSport: (categoryId: string) => Promise<void> | void;
  /**
   * Called when the user presses Continue or Back.
   * Receives a boolean indicating whether there are unsaved changes (true if selection differs from initial snapshot).
   * Parent components that persist data can skip saving when `hasChanges` is false.
   */
  onFinish: (hasChanges?: boolean) => void;
  /** External loading state (e.g. parent save in progress) */
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
  loading,
}: SportsSelectionProps) {
  const [showHidden, setShowHidden] = useState(false);
  // Snapshot of the initial selection to determine if there are unsaved changes
  const initialSelectionRef = useRef<Set<string> | null>(null);
  if (initialSelectionRef.current === null) {
    initialSelectionRef.current = new Set(userSportsIds);
  }

  const initialIds = initialSelectionRef.current;
  const allSelected =
    categories.length > 0 && userSportsIds.length === categories.length;

  // Determine if current selection differs from initial snapshot
  const hasChanges = useMemo(() => {
    if (!initialIds) return false;
    if (initialIds.size !== userSportsIds.length) return true;
    // If any id differs
    for (const id of userSportsIds) if (!initialIds.has(id)) return true;
    return false;
  }, [userSportsIds, initialIds]);
  const saving = !!loading;

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

  const handleToggleSport = useCallback(
    (id: string) => {
      if (saving) return;
      onToggleSport(id);
    },
    [onToggleSport, saving]
  );

  const handleFinish = useCallback(() => {
    // Pass hasChanges so parent can decide to persist or simply exit when false.
    onFinish(hasChanges);
  }, [onFinish, hasChanges]);

  const visibleCategories = useMemo(() => {
    if (showHidden) return categories;
    return categories.filter((c) => {
      const explicitlyActive = (c as any).is_active;
      const hasExplicit = (c as any).is_active !== undefined;
      const inferredActive = c.status !== "hidden";
      const isActive = hasExplicit ? explicitlyActive : inferredActive;
      // Always show if selected even if not active/hidden
      if (userSportsIds.includes(c.id)) return true;
      return !!isActive;
    });
  }, [categories, showHidden, userSportsIds]);

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
            disabled={saving}
          >
            {showHidden ? "Hide Unlisted" : "Show Unlisted"}
          </Button>
          {userSportsIds.length > 0 && (
            <Button size="sm" onClick={handleFinish} disabled={saving}>
              <span className="flex items-center gap-2">
                {saving && (
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                {hasChanges ? "Continue" : "Back"}
              </span>
            </Button>
          )}
        </div>
      </div>

      <div
        className="relative grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6"
        role="list"
        aria-label="Sports categories multi-select"
        aria-busy={saving}
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
                  handleToggleSport(category.id);
                }
              }}
              className={`relative cursor-pointer transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                isSelected ? "ring-2 ring-primary" : "border-muted"
              } ${saving ? "opacity-50 pointer-events-none" : ""}`}
              onClick={() => handleToggleSport(category.id)}
              aria-disabled={saving}
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
        {saving && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span className="text-xs">Saving changes…</span>
          </div>
        )}
      </div>
      {/* Inline overlay spinner over the cards region while saving */}
    </div>
  );
}
