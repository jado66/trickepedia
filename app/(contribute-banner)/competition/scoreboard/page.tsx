import { LeaderboardSection } from "@/components/competition/leaderboard-section";

export default function ScoreboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <LeaderboardSection />
      </main>
    </div>
  );
}
