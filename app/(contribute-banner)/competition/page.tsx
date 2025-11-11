import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Zap, Crown, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CompetitionPage() {
  // Calculate weeks remaining until end of November 2025
  const getWeeksRemaining = () => {
    const now = new Date();
    const endOfNov2025 = new Date(2025, 10, 30); // November 30, 2025 (month is 0-indexed)
    const diffInMs = endOfNov2025.getTime() - now.getTime();
    const diffInWeeks = Math.ceil(diffInMs / (1000 * 60 * 60 * 24 * 7));
    return Math.max(0, diffInWeeks); // Ensure it doesn't go negative
  };

  const weeksRemaining = getWeeksRemaining();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-background via-card to-background border-b border-border">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=1200')] opacity-5"></div>
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Trophy className="h-16 w-16 text-primary" />
            <h1 className="text-7xl font-bold tracking-tight text-balance">
              TRICKIPEDIA
              <span className="block text-4xl text-primary mt-2">
                COMPETITION
              </span>
            </h1>
          </div>
          <p className="text-2xl text-muted-foreground max-w-4xl mx-auto text-balance leading-relaxed mb-8">
            Join our {weeksRemaining}-week founding competition to become
            remembered as an essential Trickipedia contributor. Earn XP, refer
            friends, and compete to be added to a permanent founding member on
            our acknowledgment&apos;s page.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/competition/scoreboard">
                View Scoreboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Competition Overview */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg">
            Two ways to climb the leaderboard and earn your place in history
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card className="bg-gradient-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Zap className="h-8 w-8 text-chart-2" />
                Earn XP Points
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Contribute to the platform by creating content, helping other
                users, and engaging with the community. Every action earns you
                valuable XP points.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                  Create helpful tutorials and guides
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                  Answer questions from other users
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                  Share valuable sports insights
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Users className="h-8 w-8 text-primary" />
                Refer Friends
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Grow the Trickipedia community by inviting friends and fellow
                sports enthusiasts. Each successful referral counts toward your
                leaderboard position.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Share your unique referral link
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Invite sports enthusiasts to join
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Help new users get started
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-primary/20 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <Crown className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Ready to Compete?</h3>
              <p className="text-muted-foreground mb-6">
                Join the competition now and in {weeksRemaining} weeks the top 5
                contributors will be forever remembered as a founding
                contributor. Good luck!
              </p>
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/competition/scoreboard">
                  Join the Competition
                  <Trophy className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
