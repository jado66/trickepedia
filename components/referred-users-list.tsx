"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserCheck, Calendar, Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ReferredUser } from "@/hooks/use-user-referral-data";

interface ReferredUsersListProps {
  referredUsers: ReferredUser[];
  totalCount: number;
}

export default function ReferredUsersList({
  referredUsers,
  totalCount,
}: ReferredUsersListProps) {
  const formatUserName = (user: ReferredUser) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) {
      return user.first_name;
    }
    return user.email.split("@")[0]; // Use email prefix as fallback
  };

  if (totalCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Referred Users
          </CardTitle>
          <CardDescription>
            Users who signed up using your referral link will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No referrals yet</p>
            <p className="text-sm">Share your referral link to get started!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Referred Users
          <Badge variant="secondary">{totalCount}</Badge>
        </CardTitle>
        <CardDescription>
          Users who joined Trickipedia through your referral link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {referredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <UserCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {formatUserName(user)}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {formatDistanceToNow(new Date(user.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {totalCount > referredUsers.length && (
              <div className="text-center py-2 text-sm text-muted-foreground border-t">
                Showing {referredUsers.length} of {totalCount} referrals
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
