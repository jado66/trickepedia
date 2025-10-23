// app/page.tsx (or wherever HomePageServer is)
import { FeaturedCategories } from "@/components/featured-categories";
import { RecentTricks } from "@/components/recent-tricks";
import { CommunityStats } from "@/components/community-stats";
import { TrickipediaHeroSection } from "@/components/trickipedia-hero-section";
import ContributingSection from "@/components/contributing-section";

export default async function HomePageServer() {
  return (
    <main>
      <TrickipediaHeroSection />
      {/* Get the App Section */}
      {/* PWA install section removed */}
      <hr className="mb-10 border-t border-muted" />
      <ContributingSection />
      <FeaturedCategories />
      <RecentTricks />
      <CommunityStats />
    </main>
  );
}
