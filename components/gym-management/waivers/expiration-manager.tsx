"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  AlertTriangle,
  Mail,
  RefreshCw,
  Clock,
  CheckCircle,
  User,
  Play,
  Settings,
} from "lucide-react";

// Mock data - in real app this would come from API
const mockExpiringWaivers = [
  {
    id: "1",
    participantName: "John Smith",
    email: "john.smith@email.com",
    templateName: "Standard Trampoline Waiver",
    expiresAt: "2024-04-15T10:30:00Z",
    daysUntilExpiry: 7,
    notificationsSent: 1,
    lastNotificationSent: "2024-04-08T09:00:00Z",
  },
  {
    id: "2",
    participantName: "Sarah Johnson",
    email: "sarah.j@email.com",
    templateName: "Rock Climbing Waiver",
    expiresAt: "2024-04-20T14:15:00Z",
    daysUntilExpiry: 12,
    notificationsSent: 0,
    lastNotificationSent: null,
  },
  {
    id: "3",
    participantName: "Mike Davis",
    email: "mike.davis@email.com",
    templateName: "Standard Trampoline Waiver",
    expiresAt: "2024-04-25T16:45:00Z",
    daysUntilExpiry: 17,
    notificationsSent: 0,
    lastNotificationSent: null,
  },
  {
    id: "4",
    participantName: "Emily Wilson",
    email: "emily.wilson@email.com",
    templateName: "Youth Program Waiver",
    expiresAt: "2024-04-12T11:20:00Z",
    daysUntilExpiry: 4,
    notificationsSent: 2,
    lastNotificationSent: "2024-04-07T10:30:00Z",
  },
];

export function ExpirationManager() {
  const [expiringWaivers, setExpiringWaivers] = useState(mockExpiringWaivers);
  const [isRunningExpiration, setIsRunningExpiration] = useState(false);
  const [isSendingNotifications, setIsSendingNotifications] = useState(false);
  const [lastExpirationRun, setLastExpirationRun] = useState<string | null>(
    null
  );
  const [selectedWaivers, setSelectedWaivers] = useState<string[]>([]);

  // Group waivers by urgency
  const urgent = expiringWaivers.filter((w) => w.daysUntilExpiry <= 7);
  const warning = expiringWaivers.filter(
    (w) => w.daysUntilExpiry > 7 && w.daysUntilExpiry <= 14
  );
  const upcoming = expiringWaivers.filter(
    (w) => w.daysUntilExpiry > 14 && w.daysUntilExpiry <= 30
  );

  const handleRunExpirationCheck = async () => {
    setIsRunningExpiration(true);
    try {
      const response = await fetch("/api/waivers/expire", { method: "POST" });
      const result = await response.json();

      if (result.success) {
        setLastExpirationRun(new Date().toISOString());
        // In real app, refresh the data
        console.log(`Updated ${result.updatedCount} expired waivers`);
      }
    } catch (error) {
      console.error("Error running expiration check:", error);
    } finally {
      setIsRunningExpiration(false);
    }
  };

  const handleSendNotifications = async (
    type: "urgent" | "warning" | "upcoming"
  ) => {
    setIsSendingNotifications(true);

    let targetWaivers: any[] = [];
    switch (type) {
      case "urgent":
        targetWaivers = urgent.filter((w) => w.notificationsSent < 2);
        break;
      case "warning":
        targetWaivers = warning.filter((w) => w.notificationsSent === 0);
        break;
      case "upcoming":
        targetWaivers = upcoming.filter((w) => w.notificationsSent === 0);
        break;
    }

    try {
      const response = await fetch("/api/waivers/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          waiverIds: targetWaivers.map((w) => w.id),
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update notification counts
        setExpiringWaivers((prev) =>
          prev.map((waiver) => {
            if (targetWaivers.find((t) => t.id === waiver.id)) {
              return {
                ...waiver,
                notificationsSent: waiver.notificationsSent + 1,
                lastNotificationSent: new Date().toISOString(),
              };
            }
            return waiver;
          })
        );
        console.log(`Sent ${result.notificationsSent} notifications`);
      }
    } catch (error) {
      console.error("Error sending notifications:", error);
    } finally {
      setIsSendingNotifications(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUrgencyColor = (days: number) => {
    if (days <= 7) return "bg-red-100 text-red-800 border-red-200";
    if (days <= 14) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  const getUrgencyLabel = (days: number) => {
    if (days <= 7) return "Urgent";
    if (days <= 14) return "Warning";
    return "Upcoming";
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Settings className="w-5 h-5" />
            Expiration Control Panel
          </CardTitle>
          <CardDescription>
            Manage automated expiration checks and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button
              variant="outline"
              onClick={() => handleSendNotifications("urgent")}
              disabled={
                isSendingNotifications ||
                urgent.filter((w) => w.notificationsSent < 2).length === 0
              }
              className="bg-transparent"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Urgent Notifications (
              {urgent.filter((w) => w.notificationsSent < 2).length})
            </Button>

            <Button
              variant="outline"
              onClick={() => handleSendNotifications("warning")}
              disabled={
                isSendingNotifications ||
                warning.filter((w) => w.notificationsSent === 0).length === 0
              }
              className="bg-transparent"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Warning Notifications (
              {warning.filter((w) => w.notificationsSent === 0).length})
            </Button>
          </div>

          {lastExpirationRun && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Last expiration check: {formatDate(lastExpirationRun)}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">
                  {urgent.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Urgent (≤7 days)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">
                  {warning.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Warning (8-14 days)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">
                  {upcoming.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Upcoming (15-30 days)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Waivers List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">
            Expiring Waivers
          </CardTitle>
          <CardDescription>
            Waivers that will expire in the next 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expiringWaivers.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                All waivers are current
              </h3>
              <p className="text-muted-foreground">
                No waivers are expiring in the next 30 days
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {expiringWaivers
                .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
                .map((waiver) => (
                  <div
                    key={waiver.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-card-foreground">
                          {waiver.participantName}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {waiver.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {waiver.templateName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-card-foreground">
                          Expires: {formatDate(waiver.expiresAt)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {waiver.notificationsSent > 0
                            ? `${waiver.notificationsSent} notification${
                                waiver.notificationsSent > 1 ? "s" : ""
                              } sent`
                            : "No notifications sent"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          className={`${getUrgencyColor(
                            waiver.daysUntilExpiry
                          )} border`}
                        >
                          {getUrgencyLabel(waiver.daysUntilExpiry)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {waiver.daysUntilExpiry} days
                        </Badge>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleSendNotifications(
                            waiver.daysUntilExpiry <= 7
                              ? "urgent"
                              : waiver.daysUntilExpiry <= 14
                              ? "warning"
                              : "upcoming"
                          )
                        }
                        disabled={isSendingNotifications}
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        Notify
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Automation Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">
            Automation Settings
          </CardTitle>
          <CardDescription>
            Configure automatic expiration handling and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-card-foreground">
                Expiration Check Schedule
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      Daily Check
                    </p>
                    <p className="text-xs text-muted-foreground">6:00 AM UTC</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      Auto-expire waivers
                    </p>
                    <p className="text-xs text-muted-foreground">
                      On expiration date
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Active
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-card-foreground">
                Notification Schedule
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      30-day reminder
                    </p>
                    <p className="text-xs text-muted-foreground">
                      First notification
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Active
                  </Badge>
                </div>
                {/* <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      14-day warning
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Second notification
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Active
                  </Badge>
                </div> */}
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      7-day urgent
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Final notification
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Active
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Automation is fully configured and running. Last successful run:{" "}
              {new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
