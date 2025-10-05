"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Moon, Sparkles } from "lucide-react";
import { useUser } from "@/contexts/user-provider";
import { toast } from "sonner";
import { useTheme } from "next-themes";

export function DarkModeUnlockBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { user } = useUser();
  const { setTheme, theme } = useTheme();
  const [originalTheme, setOriginalTheme] = useState<string | undefined>();

  // Check if user has unlocked dark mode (500+ XP)
  const hasUnlockedDarkMode = (user?.xp || 0) >= 500;

  // Don't show banner if dark mode is already unlocked
  if (hasUnlockedDarkMode || !isVisible) return null;

  const referralsNeeded = 2;
  const currentReferrals = user?.referrals || 0;
  const xpProgress = user?.xp || 0;

  const handleInviteFriends = () => {
    const referralLink = `${window.location.origin}/signup?ref=${encodeURIComponent(
      user?.email || ""
    )}`;
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };

  const handleDemoClick = () => {
    const prevTheme = theme; // capture current theme to avoid stale state in timeout
    setOriginalTheme(prevTheme);
    setIsDemoMode(true);
    setTheme("dark");
    setTimeout(() => {
      setTheme(prevTheme || "trickipedia");
      setIsDemoMode(false);
    }, 3000);
  };

  return (
    <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-indigo-500/20 dark:from-indigo-500/5 dark:via-purple-500/5 dark:to-pink-500/5 dark:border-indigo-500/30">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Moon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Unlock Dark Mode</h2>
              <Sparkles className="h-3 w-3 text-purple-500" />
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
              Earn <span className="font-semibold text-indigo-600 dark:text-indigo-400">500 XP</span> to unlock Dark Mode.
              Invite friends (<span className="font-semibold">{referralsNeeded} referrals = 500 XP</span>) or add / edit tricks.
              You have <span className="font-semibold text-indigo-600 dark:text-indigo-400">{xpProgress} XP</span>
              {currentReferrals > 0 && (
                <>
                  {" "}and <span className="font-semibold text-purple-600 dark:text-purple-400">{currentReferrals} referral{currentReferrals !== 1 ? "s" : ""}</span>
                </>
              )}.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleInviteFriends}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-1.5 h-auto font-normal"
                >
                  <Moon className="h-3 w-3 mr-1.5" />
                  Invite
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDemoClick}
                  disabled={isDemoMode}
                  className="text-xs px-4 py-1.5 h-auto font-normal border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-950"
                >
                  {isDemoMode ? "Previewing..." : "Preview"}
                </Button>
              </div>
              {/* Progress */}
              <div className="flex items-center gap-2 flex-1 min-w-[160px] ml-0 md:ml-2">
                <span className="sr-only">Progress towards Dark Mode unlock</span>
                <div className="relative h-2 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min(100, (xpProgress / 500) * 100)}%`,
                    }}
                    aria-hidden="true"
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 tabular-nums w-10 text-right">
                  {Math.min(100, Math.round((xpProgress / 500) * 100))}%
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1 h-auto"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
