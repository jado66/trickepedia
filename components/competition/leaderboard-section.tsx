import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award, Users, Zap } from "lucide-react";

// Mock data - in real app this would come from Supabase
const topReferrers = [
  {
    rank: 1,
    name: "Grace Taylor",
    username: "grace_t",
    referrals: 35,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    rank: 2,
    name: "Charlie Brown",
    username: "charlie_b",
    referrals: 32,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    rank: 3,
    name: "Kate White",
    username: "kate_w",
    referrals: 30,
    avatar: "/placeholder.svg?height=40&width=40",
  },
];

const topContributors = [
  {
    rank: 1,
    name: "Diana Wilson",
    username: "diana_w",
    xp: 2800,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    rank: 2,
    name: "Kate White",
    username: "kate_w",
    xp: 2600,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    rank: 3,
    name: "Grace Taylor",
    username: "grace_t",
    xp: 2500,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    rank: 4,
    name: "Noah Garcia",
    username: "noah_g",
    xp: 2400,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    rank: 5,
    name: "Iris Thomas",
    username: "iris_t",
    xp: 2300,
    avatar: "/placeholder.svg?height=40&width=40",
  },
];

const allUsers = [
  {
    rank: 1,
    name: "Diana Wilson",
    username: "diana_w",
    xp: 2800,
    referrals: 15,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    rank: 2,
    name: "Kate White",
    username: "kate_w",
    xp: 2600,
    referrals: 30,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    rank: 3,
    name: "Grace Taylor",
    username: "grace_t",
    xp: 2500,
    referrals: 35,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    rank: 4,
    name: "Noah Garcia",
    username: "noah_g",
    xp: 2400,
    referrals: 19,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    rank: 5,
    name: "Iris Thomas",
    username: "iris_t",
    xp: 2300,
    referrals: 20,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    rank: 6,
    name: "Bob Smith",
    username: "bob_smith",
    xp: 2200,
    referrals: 18,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    rank: 7,
    name: "Eve Davis",
    username: "eve_d",
    xp: 2100,
    referrals: 28,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    rank: 8,
    name: "Mia Martin",
    username: "mia_m",
    xp: 2000,
    referrals: 26,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    rank: 9,
    name: "Frank Miller",
    username: "frank_m",
    xp: 1900,
    referrals: 22,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    rank: 10,
    name: "Charlie Brown",
    username: "charlie_b",
    xp: 1800,
    referrals: 32,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    rank: 11,
    name: "Olivia Rodriguez",
    username: "olivia_r",
    xp: 1800,
    referrals: 23,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    rank: 12,
    name: "Jack Jackson",
    username: "jack_j",
    xp: 1700,
    referrals: 16,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    rank: 13,
    name: "Henry Anderson",
    username: "henry_a",
    xp: 1600,
    referrals: 12,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    rank: 14,
    name: "Alice Johnson",
    username: "alice_j",
    xp: 1500,
    referrals: 25,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    rank: 15,
    name: "Liam Harris",
    username: "liam_h",
    xp: 1400,
    referrals: 14,
    avatar: "/placeholder.svg?height=40&width=40",
  },
];

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Award className="h-5 w-5 text-amber-600" />;
    default:
      return (
        <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
      );
  }
}

function getRankBadge(rank: number) {
  if (rank <= 3) {
    return (
      <Badge
        variant="secondary"
        className="bg-primary/20 text-primary border-primary/30"
      >
        Top 3
      </Badge>
    );
  }
  if (rank <= 5) {
    return (
      <Badge
        variant="secondary"
        className="bg-chart-2/20 text-chart-2 border-chart-2/30"
      >
        Top 5
      </Badge>
    );
  }
  return null;
}

export function LeaderboardSection() {
  return (
    <div className="space-y-8">
      {/* Hall of Fame Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5 text-primary" />
              Top Referrers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topReferrers.map((user) => (
              <div
                key={user.rank}
                className="flex items-center gap-4 p-3 rounded-lg bg-card/50 backdrop-blur"
              >
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(user.rank)}
                </div>
                {/* <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                  />
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar> */}
                <div className="flex-1">
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-sm text-muted-foreground">
                    @{user.username}
                  </div>
                </div>
                <div className="text-right" style={{ display: "none" }}>
                  <div className="font-bold text-primary">{user.referrals}</div>
                  <div className="text-xs text-muted-foreground">referrals</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Zap className="h-5 w-5 text-chart-2" />
              Top Contributors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topContributors.map((user) => (
              <div
                key={user.rank}
                className="flex items-center gap-4 p-3 rounded-lg bg-card/50 backdrop-blur"
              >
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(user.rank)}
                </div>
                {/* <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                  />
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar> */}
                <div className="flex-1">
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-sm text-muted-foreground">
                    @{user.username}
                  </div>
                </div>
                <div className="text-right" style={{ display: "none" }}>
                  <div className="font-bold text-chart-2">
                    {user.xp.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">XP</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Full Leaderboard - Top 15</CardTitle>
          <p className="text-muted-foreground">
            Complete rankings showing all participants
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {allUsers.map((user) => (
              <div
                key={user.rank}
                className="flex items-center gap-4 p-4 rounded-lg "
              >
                <div className="flex items-center justify-center w-10">
                  {getRankIcon(user.rank)}
                </div>
                {/* <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                  />
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar> */}
                <div className="flex-1">
                  <div className="font-semibold text-lg">{user.name}</div>
                  <div className="text-sm text-muted-foreground">
                    @{user.username}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center" style={{ display: "none" }}>
                    <div className="font-bold text-chart-2">
                      {user.xp.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">XP</div>
                  </div>
                  <div className="text-center" style={{ display: "none" }}>
                    <div className="font-bold text-primary">
                      {user.referrals}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Referrals
                    </div>
                  </div>
                  {getRankBadge(user.rank)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
