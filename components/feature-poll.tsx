"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Calendar, Users } from "lucide-react";

import { supabase } from "@/utils/supabase/client";
import { useUser } from "@/contexts/user-provider";

const pollOptions = [
  {
    id: "recent-progress",
    title: "Recent Progress",
    description: "Show recently mastered tricks with timestamps",
  },
  {
    id: "trending-tricks",
    title: "Trending Tricks",
    description: "Popular tricks being learned by the community",
  },
  {
    id: "skill-categories",
    title: "Skill Categories Progress",
    description: "Progress by skill types (vaults, flips, spins, grinds)",
  },
  {
    id: "quick-stats",
    title: "Quick Stats Dashboard",
    description: "Total tricks, learning streaks, achievements",
  },
  {
    id: "featured-trick",
    title: "Featured Trick Spotlight",
    description: "Trick of the week with tips and tutorials",
  },
  {
    id: "difficulty-ladder",
    title: "Difficulty Ladder",
    description: "Next difficulty level you can attempt in each sport",
  },
  {
    id: "challenge-mode",
    title: "Challenge Mode",
    description: "Suggested trick combinations and sequences",
  },
  {
    id: "recently-added",
    title: "Recently Added Content",
    description: "New tricks matching your skill level",
  },
  {
    id: "practice-reminders",
    title: "Practice Reminders",
    description: "Tricks you haven't practiced recently",
  },
  {
    id: "sport-deep-dive",
    title: "Sport Deep Dive",
    description: "Expanded view of your most active sport",
  },
];

export function FeaturePoll() {
  const { user } = useUser();
  const userId = user?.id || "anonymous_user"; // Fallback for unauthenticated users

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [totalVotes, setTotalVotes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserVotes();
    loadTotalVotes();
  }, [userId]);

  const loadUserVotes = async () => {
    try {
      const { data, error } = await supabase
        .from("poll_votes")
        .select("option_id")
        .eq("user_id", userId);

      if (error) {
        console.error("Error loading user votes:", error);
      } else if (data && data.length > 0) {
        const votes = data.map((vote) => vote.option_id);
        setSelectedOptions(votes);
        setHasVoted(true);
      }
    } catch (error) {
      console.error("Error connecting to database:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTotalVotes = async () => {
    try {
      const { count, error } = await supabase
        .from("poll_votes")
        .select("*", { count: "exact", head: true });

      if (error) {
        console.error("Error loading total votes:", error);
        setTotalVotes(127); // Fallback number
      } else {
        setTotalVotes(count || 0);
      }
    } catch (error) {
      console.error("Error connecting to database:", error);
      setTotalVotes(127); // Fallback number
    }
  };

  const handleOptionToggle = (optionId: string) => {
    if (hasVoted) return;

    setSelectedOptions((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleSubmitVote = async () => {
    if (selectedOptions.length === 0) return;

    setIsSubmitting(true);

    try {
      const votesToInsert = selectedOptions.map((optionId) => ({
        user_id: userId,
        option_id: optionId,
      }));

      const { error } = await supabase.from("poll_votes").insert(votesToInsert);

      if (error) {
        console.error("Error saving votes:", error);
      }

      setHasVoted(true);
      await loadTotalVotes(); // Refresh vote count
    } catch (error) {
      console.error("Error connecting to database:", error);
      setHasVoted(true);
      setTotalVotes((prev) => prev + 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetVote = async () => {
    try {
      const { error } = await supabase
        .from("poll_votes")
        .delete()
        .eq("user_id", userId);

      if (error) {
        console.error("Error deleting votes:", error);
      }

      setHasVoted(false);
      setSelectedOptions([]);
      await loadTotalVotes(); // Refresh vote count
    } catch (error) {
      console.error("Error connecting to database:", error);
      setHasVoted(false);
      setSelectedOptions([]);
      setTotalVotes((prev) => Math.max(0, prev - 1));
    }
  };

  if (isLoading) {
    return (
      <Card className="border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-950/50">
        <CardHeader>
          <CardTitle className="text-orange-900 dark:text-orange-100">
            Loading poll...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-950/50">
      <CardHeader>
        <CardTitle className="text-orange-900 dark:text-orange-100 flex items-center gap-2">
          Help Shape Your Dashboard
        </CardTitle>
        <CardDescription className="text-orange-700 dark:text-orange-300">
          {hasVoted
            ? `Thanks for voting! You selected ${
                selectedOptions.length
              } option${selectedOptions.length !== 1 ? "s" : ""}.`
            : "What would you like to see here in the dashboard? Select your favorites:"}
        </CardDescription>
        <div className="flex items-center gap-4 text-sm text-orange-600 dark:text-orange-400 mt-2">
          {/* <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {totalVotes} votes so far
          </div> */}
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Poll closes October 15, 2025
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasVoted ? (
          <div className="space-y-3">
            <div className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">
              Your selections:
            </div>
            {pollOptions
              .filter((option) => selectedOptions.includes(option.id))
              .map((option) => (
                <div
                  key={option.id}
                  className="flex items-center gap-2 p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg"
                >
                  <CheckCircle2 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <div>
                    <div className="font-medium text-orange-900 dark:text-orange-100">
                      {option.title}
                    </div>
                    <div className="text-sm text-orange-700 dark:text-orange-300">
                      {option.description}
                    </div>
                  </div>
                </div>
              ))}
            <Button
              onClick={handleResetVote}
              variant="outline"
              size="sm"
              className="mt-4 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 bg-transparent"
            >
              Change Vote
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-2 max-h-128 overflow-y-auto">
              {pollOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionToggle(option.id)}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    selectedOptions.includes(option.id)
                      ? "border-orange-300 dark:border-orange-700 bg-orange-100 dark:bg-orange-900/30 shadow-sm"
                      : "border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {selectedOptions.includes(option.id) ? (
                      <CheckCircle2 className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-orange-400 dark:text-orange-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <div className="font-medium text-orange-900 dark:text-orange-100">
                        {option.title}
                      </div>
                      <div className="text-sm text-orange-700 dark:text-orange-300">
                        {option.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {selectedOptions.length > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-orange-200 dark:border-orange-800">
                <Badge
                  variant="secondary"
                  className="bg-orange-200 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200"
                >
                  {selectedOptions.length} selected
                </Badge>
                <Button
                  onClick={handleSubmitVote}
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Vote"}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
