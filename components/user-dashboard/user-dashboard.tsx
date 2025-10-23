"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { SportsSelection } from "./sports-selection";
import { NextTricksSuggestions } from "./new-trick-suggestions";
import { UserProgressOverview } from "./user-progress-overview";
import type { Trick } from "@/types/trick";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Settings, Users, Copy } from "lucide-react";
import { Wishlist } from "../wishlist";
import { FeaturePoll } from "../feature-poll";
import { MiniContributeCTA } from "@/components/xp";
import { useConfetti } from "@/contexts/confetti-provider";
import { useUserReferralData } from "@/hooks/use-user-referral-data";
import { useUser } from "@/contexts/user-provider";
import { supabase } from "@/utils/supabase/client";
import { useMasterCategories } from "@/hooks/use-categories";
import { useUserProgress } from "@/contexts/user-progress-provider";
import { useTricks } from "@/contexts/tricks-provider";

export function UserDashboard() {
  const { celebrate } = useConfetti();
  const { userCanDoTricks, markTrickAsLearned, refreshProgress } =
    useUserProgress();

  // Use existing hooks for data fetching
  const { categories, loading: categoriesLoading } = useMasterCategories();
  const { tricks: allTricks, loading: tricksLoading } = useTricks();

  const [userSportsIds, setUserSportsIds] = useState<string[]>([]);
  const [draftSportsIds, setDraftSportsIds] = useState<string[]>([]);
  const [selectingSports, setSelectingSports] = useState(false);
  const [savingSports, setSavingSports] = useState(false);

  const { user, updateUser, isLoading: authLoading } = useUser();

  // Referral data
  const { data: referralData, loading: referralLoading } =
    useUserReferralData();

  // Update sports when user data becomes available
  useEffect(() => {
    if (!supabase) return;

    // Only process if we have a user and auth is not loading
    if (user && !authLoading) {
      const sports = user.users_sports_ids || [];
      setUserSportsIds(sports);
      setDraftSportsIds(sports);

      // Only auto-show sports selection if user has no sports and isn't already selecting
      if (sports.length === 0 && !selectingSports) {
        setSelectingSports(true);
      }
    }
  }, [user, authLoading]);

  const toggleDraftSport = (categoryId: string) => {
    setDraftSportsIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleFinishSportsSelection = async (hasChanges?: boolean) => {
    // If no changes, just exit selection mode
    if (!hasChanges) {
      setSelectingSports(false);
      return;
    }

    const newSportsIds = draftSportsIds;
    setSavingSports(true);
    if (user) {
      try {
        await updateUser({ users_sports_ids: newSportsIds });
        setUserSportsIds(newSportsIds);
        toast.success("Sports selection saved");
        await refreshProgress();
      } catch (e) {
        console.error("Failed saving sports selection:", e);
        toast.error("Failed to save sports selection");
        setSavingSports(false);
        return;
      }
    } else {
      toast("Login to save your selections and track progress");
      setUserSportsIds(newSportsIds);
    }
    setSavingSports(false);
    setSelectingSports(false);
  };

  const handleMarkLearned = async (trickId: string) => {
    // Find the trick to get its category for optimistic update
    const trick = allTricks.find((t) => t.id === trickId);
    const categorySlug = trick?.subcategory?.master_category?.slug;

    const success = await markTrickAsLearned(trickId, categorySlug);

    if (success) {
      toast.success("Trick marked as learned");
      celebrate();
    }
  };

  // Keep draft in sync when entering selection mode
  useEffect(() => {
    if (selectingSports) {
      setDraftSportsIds(userSportsIds);
    }
  }, [selectingSports, userSportsIds]);

  // Convert category IDs to slugs for filtering tricks
  // userSportsIds contains category IDs, but tricks only have master_category.slug
  const userSportsSlugs = useMemo(() => {
    return userSportsIds
      .map((id) => {
        const category = categories.find((cat) => cat.id === id);
        return category?.slug;
      })
      .filter((slug): slug is string => !!slug);
  }, [userSportsIds, categories]);

  // Show loading while we're waiting for all necessary data
  const isLoading = authLoading || categoriesLoading || tricksLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">
                Loading your dashboard...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show sports selection if user is actively selecting
  if (selectingSports) {
    return (
      <div className="space-y-6">
        <SportsSelection
          categories={categories}
          userSportsIds={draftSportsIds}
          onToggleSport={toggleDraftSport}
          onFinish={handleFinishSportsSelection}
          loading={savingSports}
        />
      </div>
    );
  }

  // Main dashboard view
  return (
    <div className="space-y-6">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 relative">
          <div className="mb-8">
            <h1 className="lg:text-4xl text-xl font-bold text-balance mb-2">
              Welcome Back{" "}
              {user?.first_name ||
                (user?.email
                  ? user.email.charAt(0).toUpperCase() + user.email.slice(1)
                  : "")}
            </h1>
            <p className="text-lg text-muted-foreground text-pretty">
              Track your progress and discover new tricks to master
            </p>
          </div>

          <div className="flex items-center justify-between lg:absolute lg:top-10 lg:right-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDraftSportsIds(userSportsIds);
                setSelectingSports(true);
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage Sports
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              <UserProgressOverview />
              <NextTricksSuggestions
                maxSuggestions={6}
                allTricks={allTricks}
                userCanDoTricks={userCanDoTricks}
                userSportsIds={userSportsSlugs}
                loading={isLoading}
                onMarkLearned={handleMarkLearned}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <Wishlist />
              <FeaturePoll />
              <MiniContributeCTA variant="dashboard" />
              {/* PWA install component removed */}
            </div>
          </div>
        </div>
      </div>

      {!user && (
        <Card>
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            Login to save your progress.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
