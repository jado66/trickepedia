"use client";

import type React from "react";
import { useState } from "react";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Star,
  Zap,
  Gift,
  Trophy,
  Sparkles,
} from "lucide-react";
import { useNotifications } from "@/contexts/notifications-provider";
import { useUser } from "@/contexts/user-provider";
import { calculateXPProgress } from "@/lib/xp/levels";
import type { Notification as NotificationType } from "@/contexts/notifications-provider";
import { Progress } from "@/components/ui/progress";

export const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();

  const xp = user?.xp ?? 0;
  const { currentLevel, nextLevel, progressPct, xpToNext } =
    calculateXPProgress(xp);

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={toggleNotifications}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800 rounded-full transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center text-xs font-semibold text-white bg-red-500 rounded-full min-w-[18px] h-[18px] leading-none shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-50 max-h-[34rem] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Notifications
            </h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-1 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-4 w-4" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Level Summary */}
          <div className="px-4 pt-3 pb-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-br from-white to-blue-50/40 dark:from-gray-800 dark:to-blue-900/20">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium leading-none">
                    Level {currentLevel.level}
                  </p>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-md text-white ${currentLevel.badgeBg}`}
                  >
                    {currentLevel.name}
                  </span>
                  {nextLevel ? (
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      {xpToNext} XP to Level {nextLevel.level}
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      Max level reached
                    </span>
                  )}
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400">
                    <span>{xp} XP</span>
                    {nextLevel && <span>{nextLevel.nextLevelXP} XP Goal</span>}
                  </div>
                  <Progress value={progressPct} className="h-2" />
                </div>
                {nextLevel ? (
                  <p className="mt-2 text-[11px] text-gray-600 dark:text-gray-300 line-clamp-2">
                    Next unlock: {nextLevel.unlocks.slice(0, 3).join(", ")}
                    {nextLevel.unlocks.length > 3 && "..."}
                  </p>
                ) : (
                  <p className="mt-2 text-[11px] text-gray-600 dark:text-gray-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> All features unlocked
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

interface NotificationItemProps {
  notification: NotificationType;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
}) => {
  const getNotificationIcon = (type: NotificationType["type"]) => {
    switch (type) {
      case "referral_increase":
        return <Star className="h-5 w-5 text-green-500 dark:text-green-400" />;
      case "referral_milestone":
        return (
          <Star className="h-5 w-5 text-purple-500 dark:text-purple-400" />
        );
      case "xp_gain":
        return <Zap className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />;
      case "level_up":
        return (
          <Trophy className="h-5 w-5 text-orange-500 dark:text-orange-400" />
        );
      case "general":
      default:
        return <Gift className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
    }
  };

  const getNotificationColor = (type: NotificationType["type"]) => {
    switch (type) {
      case "referral_increase":
        return "bg-green-50 dark:bg-green-900/20 border-l-4 border-l-green-400 dark:border-l-green-500";
      case "referral_milestone":
        return "bg-purple-50 dark:bg-purple-900/20 border-l-4 border-l-purple-400 dark:border-l-purple-500";
      case "xp_gain":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-l-yellow-400 dark:border-l-yellow-500";
      case "level_up":
        return "bg-orange-50 dark:bg-orange-900/20 border-l-4 border-l-orange-400 dark:border-l-orange-500";
      case "general":
      default:
        return "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-400 dark:border-l-blue-500";
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div
      className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
        !notification.read ? "bg-blue-25 dark:bg-blue-900/20" : ""
      }`}
      onClick={() => !notification.read && onMarkAsRead(notification.id)}
    >
      <div
        className={`rounded-lg p-3 ${getNotificationColor(notification.type)}`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 flex items-center justify-center">
            {getNotificationIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {notification.title}
              </h4>
              {!notification.read && (
                <div className="flex-shrink-0 ml-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1 whitespace-pre-line">
              {notification.message}
            </p>
            {notification.type === "level_up" &&
              notification.data?.unlocks?.length > 0 && (
                <p className="text-xs text-gray-700 dark:text-gray-300 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-yellow-500" /> Unlocks:{" "}
                  {notification.data.unlocks.slice(0, 4).join(", ")}
                  {notification.data.unlocks.length > 4 && "..."}
                </p>
              )}
            {notification.type === "general" &&
              notification.data?.unlocks?.length > 0 && (
                <p className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <Gift className="w-3 h-3 text-blue-500 dark:text-blue-400" />{" "}
                  {notification.data.unlocks.slice(0, 4).join(", ")}
                  {notification.data.unlocks.length > 4 && "..."}
                </p>
              )}
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {formatTime(notification.timestamp)}
            </p>
          </div>
          {!notification.read && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              title="Mark as read"
            >
              <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
