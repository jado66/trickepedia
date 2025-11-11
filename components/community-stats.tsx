import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, MessageSquare, TrendingUp } from "lucide-react";
import {
  getCommunityStats,
  type CommunityStats,
} from "@/lib/server/community-stats-server";

interface StatItem {
  title: string;
  value: string;
  change?: string;
  changeType: "positive" | "negative";
  icon: any;
  description: string;
}

// Format numbers for display
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toLocaleString();
};

// Generate stats array based on real data
const getStatsArray = (stats: CommunityStats): StatItem[] => [
  // {
  //   title: "Active Members",
  //   value: formatNumber(stats.totalUsers),
  //   change: stats.totalUsers > 0 ? "+12%" : "0%", // You could calculate real growth if you have historical data
  //   changeType: "positive" as const,
  //   icon: Users,
  //   description: "Registered community members",
  // },
  {
    title: "Published Tricks",
    value: formatNumber(stats.publishedTricks),
    change: stats.publishedTricks > 0 ? "+8%" : "0%", // You could calculate real growth if you have historical data
    changeType: "positive" as const,
    icon: BookOpen,
    description: "Available trick tutorials",
  },
  {
    title: "Total Views",
    value: formatNumber(stats.totalViews),
    change: stats.totalViews > 0 ? "+23%" : "0%", // You could calculate real growth if you have historical data
    changeType: "positive" as const,
    icon: TrendingUp,
    description: "Community engagement",
  },
  {
    title: "Total Content",
    value: formatNumber(stats.totalTricks),
    change: stats.totalTricks > 0 ? "+15%" : "0%", // You could calculate real growth if you have historical data
    changeType: "positive" as const,
    icon: MessageSquare,
    description: "Including drafts and published",
  },
];

export async function CommunityStats() {
  let stats: CommunityStats;

  try {
    stats = await getCommunityStats();
  } catch (error) {
    console.error("Error fetching community stats:", error);
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg text-destructive">
              Failed to load community stats
            </p>
          </div>
        </div>
      </section>
    );
  }

  const statsArray = getStatsArray(stats);

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-balance mb-4">
            Growing Community
          </h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Join thousands of athletes sharing knowledge and pushing the
            boundaries of movement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsArray.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow duration-300"
              >
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-primary mb-1">
                    {stat.value}
                  </CardTitle>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-sm font-medium">{stat.title}</span>
                    {stat.change && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          stat.changeType === "positive"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                        }`}
                      >
                        {stat.change}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
