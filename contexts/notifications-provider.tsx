"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { supabase } from "@/utils/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useUser } from "./user-provider";
import { calculateXPProgress, XP_LEVELS } from "@/lib/xp/levels";
import { soundManager } from "@/utils/sound-manager";

export interface Notification {
  id: string;
  type:
    | "referral_increase"
    | "referral_milestone"
    | "xp_gain"
    | "level_up"
    | "general";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
}

const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return context;
};

// Storage keys for persisting data
const REFERRAL_STORAGE_KEY = (userId: string) => `referrals_${userId}`;
const XP_STORAGE_KEY = (userId: string) => `xp_${userId}`;
const NOTIFICATIONS_STORAGE_KEY = (userId: string) => `notifications_${userId}`;

export const NotificationsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, authUser, isAuthenticated } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const previousReferralsRef = useRef<number | null>(null);
  const previousXPRef = useRef<number | null>(null);
  const hasInitializedRef = useRef(false);

  // Initialize sound manager on mount
  useEffect(() => {
    soundManager.initializeNotificationSounds();
    setSoundEnabled(soundManager.isEnabled());
  }, []);

  // Toggle sound on/off
  const toggleSound = useCallback(() => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    soundManager.setEnabled(newState);
  }, [soundEnabled]);

  // Play sound based on notification type
  const playSoundForNotification = useCallback((type: Notification["type"]) => {
    switch (type) {
      case "level_up":
        soundManager.play("levelup", 0.6);
        break;
      case "referral_increase":
      case "referral_milestone":
        soundManager.play("referral", 0.5);
        break;
      case "xp_gain":
      case "general":
      default:
        soundManager.play("general", 0.4);
        break;
    }
  }, []);

  // Generate notification ID
  const generateId = () =>
    `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Load stored referral count from localStorage
  const loadStoredReferralCount = (userId: string): number | null => {
    try {
      const stored = localStorage.getItem(REFERRAL_STORAGE_KEY(userId));
      return stored ? parseInt(stored, 10) : null;
    } catch (error) {
      console.error("Error loading stored referral count:", error);
      return null;
    }
  };

  // Store referral count in localStorage
  const storeReferralCount = (userId: string, count: number) => {
    try {
      localStorage.setItem(REFERRAL_STORAGE_KEY(userId), count.toString());
    } catch (error) {
      console.error("Error storing referral count:", error);
    }
  };

  // Load stored XP from localStorage
  const loadStoredXP = (userId: string): number | null => {
    try {
      const stored = localStorage.getItem(XP_STORAGE_KEY(userId));
      return stored ? parseInt(stored, 10) : null;
    } catch (error) {
      console.error("Error loading stored XP:", error);
      return null;
    }
  };

  // Store XP in localStorage
  const storeXP = (userId: string, xp: number) => {
    try {
      localStorage.setItem(XP_STORAGE_KEY(userId), xp.toString());
    } catch (error) {
      console.error("Error storing XP:", error);
    }
  };

  // Load stored notifications from localStorage
  const loadStoredNotifications = (userId: string): Notification[] => {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY(userId));
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        return parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
      }
    } catch (error) {
      console.error("Error loading stored notifications:", error);
    }
    return [];
  };

  // Store notifications in localStorage
  const storeNotifications = (userId: string, notifs: Notification[]) => {
    try {
      // Keep only last 50 notifications
      const toStore = notifs.slice(0, 50);
      localStorage.setItem(
        NOTIFICATIONS_STORAGE_KEY(userId),
        JSON.stringify(toStore)
      );
    } catch (error) {
      console.error("Error storing notifications:", error);
    }
  };

  // Add notification
  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
      const newNotification: Notification = {
        ...notification,
        id: generateId(),
        timestamp: new Date(),
        read: false,
      };

      // Play sound for the notification
      playSoundForNotification(newNotification.type);

      setNotifications((prev) => {
        const updated = [newNotification, ...prev];
        // Store notifications if user is authenticated
        if (authUser) {
          storeNotifications(authUser.id, updated);
        }
        return updated;
      });
    },
    [authUser, playSoundForNotification]
  );

  // Mark notification as read
  const markAsRead = useCallback(
    (id: string) => {
      setNotifications((prev) => {
        const updated = prev.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        );
        if (authUser) {
          storeNotifications(authUser.id, updated);
        }
        return updated;
      });
    },
    [authUser]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((notification) => ({
        ...notification,
        read: true,
      }));
      if (authUser) {
        storeNotifications(authUser.id, updated);
      }
      return updated;
    });
  }, [authUser]);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    if (authUser) {
      localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY(authUser.id));
    }
  }, [authUser]);

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Handle referral changes
  const handleReferralChange = useCallback(
    (newReferrals: number, oldReferrals: number | null) => {
      // Don't notify if this is the initial load or if oldReferrals is null
      if (oldReferrals === null || !hasInitializedRef.current) {
        return;
      }

      const increase = newReferrals - oldReferrals;
      if (increase > 0) {
        addNotification({
          type: "referral_increase",
          title: "New Referral!",
          message: `You gained ${increase} referral${
            increase > 1 ? "s" : ""
          }! Total: ${newReferrals}`,
          data: { increase, total: newReferrals },
        });

        // Check for milestones
        const milestones = [5, 10, 25, 50, 100, 250, 500, 1000];
        const reachedMilestone = milestones.find(
          (milestone) => oldReferrals < milestone && newReferrals >= milestone
        );

        if (reachedMilestone) {
          addNotification({
            type: "referral_milestone",
            title: "Milestone Achieved! 🎉",
            message: `Congratulations! You've reached ${reachedMilestone} referrals!`,
            data: { milestone: reachedMilestone },
          });
        }
      }
    },
    [addNotification]
  );

  // Handle XP changes and level ups
  const handleXPChange = useCallback(
    (newXP: number, oldXP: number | null) => {
      // Don't notify if this is the initial load or if oldXP is null
      if (oldXP === null || !hasInitializedRef.current) {
        return;
      }

      const increase = newXP - oldXP;
      if (increase > 0) {
        // Check for level up
        const oldProgress = calculateXPProgress(oldXP);
        const newProgress = calculateXPProgress(newXP);

        if (newProgress.currentLevel.level > oldProgress.currentLevel.level) {
          // Level up notification
          const newLevel = newProgress.currentLevel;
          addNotification({
            type: "level_up",
            title: `Level ${newLevel.level} Achieved! `,
            message: `Congratulations! You've reached ${newLevel.name} status!`,
            data: {
              newLevel: newLevel.level,
              levelName: newLevel.name,
              unlocks: newLevel.unlocks,
              previousLevel: oldProgress.currentLevel.level,
            },
          });

          // Add a separate notification for unlocks if there are any
          if (newLevel.unlocks.length > 0) {
            addNotification({
              type: "general",
              title: "New Features Unlocked!",
              message: `You've unlocked: ${newLevel.unlocks.join(", ")}`,
              data: { unlocks: newLevel.unlocks },
            });
          }
        } else {
          // Regular XP gain notification
          addNotification({
            type: "xp_gain",
            title: "XP Gained!",
            message: `You earned ${increase} XP! Total: ${newXP} XP`,
            data: {
              increase,
              total: newXP,
              progressToNext: newProgress.xpToNext,
              progressPct: newProgress.progressPct,
            },
          });
        }
      }
    },
    [addNotification]
  );

  // Check for changes that happened while user was away
  const checkForMissedChanges = useCallback(async () => {
    if (!authUser || !user) return;

    try {
      // Fetch the latest user data from the database
      const { data: latestUserData, error } = await supabase
        .from("users")
        .select("referrals, xp")
        .eq("id", authUser.id)
        .single();

      if (error) {
        console.error("Error fetching latest user data:", error);
        return;
      }

      if (latestUserData) {
        // Check referrals
        if (typeof latestUserData.referrals === "number") {
          const currentReferrals = latestUserData.referrals;
          const storedReferrals = loadStoredReferralCount(authUser.id);

          if (
            storedReferrals !== null &&
            currentReferrals !== storedReferrals
          ) {
            handleReferralChange(currentReferrals, storedReferrals);
          }
          previousReferralsRef.current = currentReferrals;
          storeReferralCount(authUser.id, currentReferrals);
        }

        // Check XP
        if (typeof latestUserData.xp === "number") {
          const currentXP = latestUserData.xp;
          const storedXP = loadStoredXP(authUser.id);

          if (storedXP !== null && currentXP !== storedXP) {
            handleXPChange(currentXP, storedXP);
          }
          previousXPRef.current = currentXP;
          storeXP(authUser.id, currentXP);
        }
      }
    } catch (error) {
      console.error("Error checking for missed changes:", error);
    }
  }, [authUser, user, handleReferralChange, handleXPChange]);

  // Initialize user data and set up realtime subscription
  useEffect(() => {
    if (!isAuthenticated() || !authUser) {
      // Clean up existing subscription if user logs out
      if (channel) {
        channel.unsubscribe();
        setChannel(null);
      }
      setNotifications([]);
      previousReferralsRef.current = null;
      previousXPRef.current = null;
      hasInitializedRef.current = false;
      return;
    }

    // Load stored notifications
    const storedNotifications = loadStoredNotifications(authUser.id);
    if (storedNotifications.length > 0) {
      setNotifications(storedNotifications);
    }

    // Initialize tracking
    if (user && !hasInitializedRef.current) {
      // Check for referral changes
      const storedReferrals = loadStoredReferralCount(authUser.id);
      if (storedReferrals !== null && storedReferrals !== user.referrals) {
        handleReferralChange(user.referrals || 0, storedReferrals);
      }
      previousReferralsRef.current = user.referrals || 0;
      storeReferralCount(authUser.id, user.referrals || 0);

      // Check for XP changes
      const storedXP = loadStoredXP(authUser.id);
      if (storedXP !== null && storedXP !== user.xp) {
        handleXPChange(user.xp || 0, storedXP);
      }
      previousXPRef.current = user.xp || 0;
      storeXP(authUser.id, user.xp || 0);

      hasInitializedRef.current = true;
    }

    // Create realtime channel for the specific user
    const realtimeChannel = supabase
      .channel(`user-${authUser.id}-notifications`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `id=eq.${authUser.id}`,
        },
        (payload) => {
          console.log("User data updated via realtime:", payload);

          const newData = payload.new;

          // Handle referral changes
          if (
            typeof newData.referrals === "number" &&
            previousReferralsRef.current !== null &&
            newData.referrals !== previousReferralsRef.current
          ) {
            handleReferralChange(
              newData.referrals,
              previousReferralsRef.current
            );
            previousReferralsRef.current = newData.referrals;
            storeReferralCount(authUser.id, newData.referrals);
          }

          // Handle XP changes
          if (
            typeof newData.xp === "number" &&
            previousXPRef.current !== null &&
            newData.xp !== previousXPRef.current
          ) {
            handleXPChange(newData.xp, previousXPRef.current);
            previousXPRef.current = newData.xp;
            storeXP(authUser.id, newData.xp);
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);

        if (status === "SUBSCRIBED") {
          console.log("Successfully subscribed to user updates");
        } else if (status === "CHANNEL_ERROR") {
          console.error("Error subscribing to realtime channel");
        }
      });

    setChannel(realtimeChannel);

    // Check for missed changes on mount
    checkForMissedChanges();

    // Cleanup function
    return () => {
      console.log("Unsubscribing from realtime channel");
      realtimeChannel.unsubscribe();
    };
  }, [
    authUser,
    isAuthenticated,
    user,
    handleReferralChange,
    handleXPChange,
    addNotification,
    checkForMissedChanges,
  ]);

  // Update stored values when user data changes
  useEffect(() => {
    if (user && authUser && hasInitializedRef.current) {
      // Handle referrals
      if (
        user.referrals !== undefined &&
        user.referrals !== previousReferralsRef.current
      ) {
        if (previousReferralsRef.current !== null) {
          handleReferralChange(user.referrals, previousReferralsRef.current);
        }
        previousReferralsRef.current = user.referrals;
        storeReferralCount(authUser.id, user.referrals);
      }

      // Handle XP
      if (user.xp !== undefined && user.xp !== previousXPRef.current) {
        if (previousXPRef.current !== null) {
          handleXPChange(user.xp, previousXPRef.current);
        }
        previousXPRef.current = user.xp;
        storeXP(authUser.id, user.xp);
      }
    }
  }, [
    user?.referrals,
    user?.xp,
    authUser,
    handleReferralChange,
    handleXPChange,
  ]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        soundEnabled,
        toggleSound,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
