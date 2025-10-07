"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Heart, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Trick } from "@/types/trick";
import { supabase } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useWishlist } from "@/contexts/wishlist-context";
import { LayoutGroup, motion, AnimatePresence } from "framer-motion";

interface TrickWithProgress extends Trick {
  user_can_do: boolean;
  missing_prerequisites: string[];
  category_progress: number;
}

interface NextSuggestedTricksProps {
  maxSuggestions?: number;
  allTricks: Trick[];
  userCanDoTricks: Set<string>;
  userSportsIds: string[]; // Array of category slugs (not IDs)
  onMarkLearned: (trickId: string) => Promise<void> | void;
  loading?: boolean;
}

export function NextTricksSuggestions({
  maxSuggestions = 6,
  allTricks,
  userCanDoTricks,
  userSportsIds,
  onMarkLearned,
  loading = false,
}: NextSuggestedTricksProps) {
  const {
    items: wishlistItems,
    add: addWishlist,
    adding,
  } = useWishlist() as any;
  const wishlistIds = useMemo(
    () => new Set(wishlistItems.map((t: any) => t.id)),
    [wishlistItems]
  );

  const handleAddGoal = useCallback(
    async (trickId: string, trick?: any) => {
      if (wishlistIds.has(trickId)) return;
      // Provide optimistic data so the wishlist immediately shows name & category
      const optimistic = trick
        ? {
            name: trick.name,
            slug: trick.slug,
            subcategory: trick.subcategory,
          }
        : undefined;
      await addWishlist(trickId, optimistic);
    },
    [wishlistIds, addWishlist]
  );
  // Calculate suggested tricks based on user progress and selected sports
  const calculatedSuggestions = useMemo(() => {
    if (!allTricks.length || userSportsIds.length === 0) return [];

    const trickById = new Map(allTricks.map((trick) => [trick.id, trick]));
    const tricksByCategory = new Map<string, Trick[]>();

    // Filter tricks to only include those from selected sports.
    // userSportsIds now contains category slugs (converted from IDs in parent component)
    const relevantTricks = allTricks.filter((trick) => {
      if (userSportsIds.length === 0) return true; // no filtering if user hasn't selected specific sports
      const categorySlug = trick.subcategory?.master_category?.slug;
      return categorySlug && userSportsIds.includes(categorySlug);
    });

    // Remove tricks already in wishlist to avoid redundancy
    const filteredForWishlist = relevantTricks.filter(
      (t) => !wishlistIds.has(t.id)
    );

    // DEBUG: Log filtering results
    if (process.env.NODE_ENV === "development") {
      console.log("NextTricksSuggestions DEBUG:", {
        totalTricks: allTricks.length,
        userSportsSlugs: userSportsIds,
        relevantTricksCount: relevantTricks.length,
        sampleTrickCategories: allTricks.slice(0, 3).map((t) => ({
          name: t.name,
          categorySlug: t.subcategory?.master_category?.slug,
        })),
        userCanDoTricksSize: userCanDoTricks.size,
      });
    }

    // Dev warning once (inside memo) if we detect no relevant tricks
    if (
      process.env.NODE_ENV === "development" &&
      relevantTricks.length === 0 &&
      userSportsIds.length > 0 &&
      allTricks.length > 0
    ) {
      console.warn(
        "NextTricksSuggestions: No relevant tricks matched userSportsIds (slugs). Check that category slugs match between user sports and trick data."
      );
    }

    relevantTricks.forEach((trick) => {
      const categorySlug = trick.subcategory?.master_category?.slug;
      if (categorySlug) {
        if (!tricksByCategory.has(categorySlug)) {
          tricksByCategory.set(categorySlug, []);
        }
        tricksByCategory.get(categorySlug)!.push(trick);
      }
    });

    const suggestions: TrickWithProgress[] = [];

    filteredForWishlist.forEach((trick) => {
      if (userCanDoTricks.has(trick.id)) return;

      const prerequisites = Array.isArray(trick.prerequisite_ids)
        ? trick.prerequisite_ids
        : [];
      const missingPrereqs = prerequisites
        .filter((prereqId) => !userCanDoTricks.has(prereqId))
        .map((prereqId) => trickById.get(prereqId)?.name || "Unknown")
        .filter((name) => name !== "Unknown");

      const categorySlug = trick.subcategory?.master_category?.slug;
      const categoryTricks = categorySlug
        ? tricksByCategory.get(categorySlug) || []
        : [];
      const completedInCategory = categoryTricks.filter((t) =>
        userCanDoTricks.has(t.id)
      ).length;
      const categoryProgress =
        categoryTricks.length > 0
          ? completedInCategory / categoryTricks.length
          : 0;

      suggestions.push({
        ...trick,
        user_can_do: false,
        missing_prerequisites: missingPrereqs || [],
        category_progress: categoryProgress,
      });
    });

    // DEBUG: Log after filtering out already-learned tricks
    if (process.env.NODE_ENV === "development") {
      const filteredOutCount = relevantTricks.length - suggestions.length;
      console.log("NextTricksSuggestions AFTER filtering learned:", {
        relevantTricksCount: relevantTricks.length,
        alreadyLearnedCount: filteredOutCount,
        suggestionsBeforeSorting: suggestions.length,
        sampleSuggestions: suggestions.slice(0, 3).map((s) => s.name),
      });
    }

    // Sort by difficulty and prerequisites
    const sorted = suggestions.sort((a, b) => {
      // Prioritize tricks with no missing prerequisites
      const aMissingLength = a.missing_prerequisites?.length ?? 0;
      const bMissingLength = b.missing_prerequisites?.length ?? 0;

      if (aMissingLength === 0 && bMissingLength > 0) return -1;
      if (bMissingLength === 0 && aMissingLength > 0) return 1;

      // Then sort by difficulty
      return (a.difficulty_level || 0) - (b.difficulty_level || 0);
    });

    return sorted.slice(0, maxSuggestions);
  }, [allTricks, userCanDoTricks, userSportsIds, maxSuggestions, wishlistIds]);

  const getDifficultyColor = (level?: number) => {
    if (!level)
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    if (level <= 3)
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (level <= 6)
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    if (level <= 8)
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  };

  const getDifficultyLabel = (level?: number) => {
    if (!level) return "Unknown";
    if (level <= 3) return "Beginner";
    if (level <= 6) return "Intermediate";
    if (level <= 8) return "Advanced";
    return "Expert";
  };

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Ready to Learn</CardTitle>
        </CardHeader>
        <CardContent className="!px-2 lg:px-6">
          <div className="space-y-4">
            {Array.from({ length: Math.min(maxSuggestions, 3) }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 lg:p-4 border rounded-lg"
              >
                <div className="space-y-2 flex-1 w-full">
                  <div className="flex items-center gap-2">
                    <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
                    <div className="h-5 bg-muted rounded w-16 animate-pulse" />
                  </div>
                  <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-1/4 animate-pulse" />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="h-8 bg-muted rounded flex-1 sm:flex-initial sm:w-24 animate-pulse" />
                  <div className="h-8 bg-muted rounded flex-1 sm:flex-initial sm:w-16 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // No suggestions available
  if (
    calculatedSuggestions.length === 0 &&
    userSportsIds.length > 0 &&
    allTricks.length > 0
  ) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Ready to Learn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>
              No new tricks available in your selected sports. Try adding more
              sports or browse all tricks!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show trick suggestions with clean styling
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Ready to Learn</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Dev-only debug: JSON.stringify on a Set returns {} so show size & sample */}

        <LayoutGroup>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {calculatedSuggestions.map((trick) => (
                <motion.div
                  key={trick.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    transition: { duration: 0.18 },
                  }}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold break-words flex-1 min-w-0">
                        {trick.name}
                      </h3>
                      <Badge
                        className={getDifficultyColor(
                          trick.difficulty_level ?? undefined
                        )}
                      >
                        {getDifficultyLabel(
                          trick.difficulty_level ?? undefined
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {trick.description || "Learn this exciting new trick!"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {trick.subcategory?.master_category?.name} •{" "}
                      {trick.subcategory?.name}
                    </p>
                    {trick.missing_prerequisites?.length > 0 && (
                      <p className="text-xs text-orange-600 dark:text-orange-400">
                        Prerequisites needed:{" "}
                        {trick.missing_prerequisites.join(", ")}
                      </p>
                    )}
                    <div className="flex flex-col xs:flex-row sm:flex-row gap-2 pt-2 sm:pt-1 w-full max-sm:[&>*]:w-full">
                      <Button
                        size="sm"
                        onClick={() => handleAddGoal(trick.id, trick)}
                        disabled={wishlistIds.has(trick.id) || adding[trick.id]}
                        className="text-xs whitespace-nowrap"
                      >
                        {adding[trick.id] ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : wishlistIds.has(trick.id) ? (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        ) : (
                          <Heart className="h-3 w-3 mr-1" />
                        )}
                        {wishlistIds.has(trick.id)
                          ? "Goal Added"
                          : adding[trick.id]
                          ? "Adding..."
                          : "Add Goal"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onMarkLearned(trick.id)}
                        className="text-xs whitespace-nowrap"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Already Can Do
                      </Button>
                      <Link
                        className="sm:w-auto"
                        href={`/${trick.subcategory?.master_category?.slug}/${trick.subcategory?.slug}/${trick.slug}`}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          Learn <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </LayoutGroup>
      </CardContent>
    </Card>
  );
}
