"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp, Users, Award, Crown } from "lucide-react";
import { supabase } from "@/utils/supabase/client";

interface TopReferrer {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  referrals: number;
}

interface ReferralStats {
  totalReferrals: number;
  totalUsers: number;
  topReferrers: TopReferrer[];
  recentReferrals: number; // referrals in last 30 days
}

export default function ReferralStatsAdmin() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReferralStats() {
      try {
        // Get total referrals and users
        const { data: totalStats, error: totalError } = await supabase
          .from("users")
          .select("referrals");

        if (totalError) {
          setError(totalError.message);
          return;
        }

        const totalReferrals =
          totalStats?.reduce((sum, user) => sum + (user.referrals || 0), 0) ||
          0;
        const totalUsers = totalStats?.length || 0;

        // Get top referrers
        const { data: topReferrers, error: topError } = await supabase
          .from("users")
          .select("id, email, first_name, last_name, referrals")
          .gt("referrals", 0)
          .order("referrals", { ascending: false })
          .limit(10);

        if (topError) {
          setError(topError.message);
          return;
        }

        // Get recent referrals (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: recentUsers, error: recentError } = await supabase
          .from("users")
          .select("created_at")
          .gte("created_at", thirtyDaysAgo.toISOString());

        const recentReferrals = recentUsers?.length || 0;

        setStats({
          totalReferrals,
          totalUsers,
          topReferrers: topReferrers || [],
          recentReferrals,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchReferralStats();
  }, []);

  const formatUserName = (user: TopReferrer) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) {
      return user.first_name;
    }
    return user.email.split("@")[0];
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 1:
        return <Award className="h-4 w-4 text-gray-400" />;
      case 2:
        return <Award className="h-4 w-4 text-orange-600" />;
      default:
        return (
          <div className="h-4 w-4 flex items-center justify-center text-xs font-bold text-muted-foreground">
            {index + 1}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Referral Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Referral Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Referrals
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
            <p className="text-xs text-muted-foreground">
              Successful referrals to date
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referral Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalUsers > 0
                ? ((stats.totalReferrals / stats.totalUsers) * 100).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Referrals per user</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Signups
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentReferrals}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Referrers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Top Referrers
          </CardTitle>
          <CardDescription>
            Users with the most successful referrals
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.topReferrers.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No referrals yet
            </p>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {stats.topReferrers.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {getRankIcon(index)}
                      <div>
                        <p className="font-medium text-sm">
                          {formatUserName(user)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Badge variant={index === 0 ? "default" : "secondary"}>
                      {user.referrals} referral{user.referrals !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
