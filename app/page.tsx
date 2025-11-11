import { HeroSection } from "@/components/homepage/hero-section";

interface HomePageStatsProps {
  publishedTricks: number;
  totalViews: number;
  disciplines: number;
}

export default async function HomePage() {
  return (
    <main className="min-h-screen">
      <h1 className="flex min-h-screen items-center justify-center bg-background p-4 text-3xl font-bold">
        Trickipedia Home Page{" "}
      </h1>
    </main>
  );
}
