import { HeroSection } from "@/components/homepage/hero-section";
import { FeaturesShowcase } from "@/components/homepage/features-showcase";
import { DisciplineCards } from "@/components/homepage/discipline-cards";
import { HowItWorks } from "@/components/homepage/how-it-works";
import { CommunityProof } from "@/components/homepage/community-proof";
import { FinalCTA } from "@/components/homepage/final-cta";
import { getCommunityStats } from "@/lib/server/community-stats-server";
import { getNavigationData } from "@/lib/server/tricks-data-server";

interface HomePageStatsProps {
  publishedTricks: number;
  totalViews: number;
  disciplines: number;
}

async function fetchHomePageStats(): Promise<HomePageStatsProps> {
  try {
    const [stats, nav] = await Promise.all([
      getCommunityStats(),
      getNavigationData(),
    ]);
    return {
      publishedTricks: stats.publishedTricks || 0,
      totalViews: stats.totalViews || 0,
      disciplines: nav.length || 0,
    };
  } catch (e) {
    console.error("Failed to fetch home page stats", e);
    return { publishedTricks: 0, totalViews: 0, disciplines: 0 };
  }
}

export default async function HomePage() {
  const { publishedTricks, totalViews, disciplines } =
    await fetchHomePageStats();
  return (
    <main className="min-h-screen">
      <HeroSection
        publishedTricks={publishedTricks}
        totalViews={totalViews}
        disciplines={disciplines}
      />
      <FeaturesShowcase />
      <DisciplineCards />
      <HowItWorks publishedTricks={publishedTricks} disciplines={disciplines} />
      <CommunityProof />
      <FinalCTA />
    </main>
  );
}
