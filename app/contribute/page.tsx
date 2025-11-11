import ContributingSection from "@/components/contributing-section";
import SectionDivider from "@/components/contribute/section-divider";
import LevelUpHeader from "@/components/contribute/level-up-header";
import XPActionsGrid from "@/components/contribute/xp-actions-grid";
import LevelProgressionTimeline from "@/components/contribute/level-progression-timeline";
import ContributeCallToAction from "@/components/contribute/contribute-call-to-action";

export default function ContributePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Hero Section */}
        <ContributingSection />

        {/* Divider */}
        <SectionDivider />

        {/* Level Up Section */}
        <LevelUpHeader />

        {/* How to Earn XP */}
        <XPActionsGrid />

        {/* Level Progression Timeline */}
        <LevelProgressionTimeline />

        {/* Call to Action */}
        <ContributeCallToAction />
      </div>
    </div>
  );
}
