import { AthleteProfile } from "@/components/athletes/athlete-profile";
import { notFound } from "next/navigation";
import { Athlete } from "@/lib/types/athlete";
import { createServer } from "@/utils/supabase/server";

async function getAthlete(slug: string): Promise<Athlete | null> {
  const supabaseServer = createServer();

  // First, get the athlete data
  const { data: athlete, error } = await supabaseServer
    .from("athletes")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error || !athlete) {
    console.error("Error fetching athlete by slug:", error);
    return null;
  }

  // Fetch related sport categories if they exist
  if (athlete.sport_category_ids && athlete.sport_category_ids.length > 0) {
    const { data: categories } = await supabaseServer
      .from("master_categories")
      .select("id, name, slug")
      .in("id", athlete.sport_category_ids);

    if (categories) {
      athlete.sport_categories = categories;
    }
  }

  // Fetch related signature tricks if they exist
  if (athlete.signature_trick_ids && athlete.signature_trick_ids.length > 0) {
    const { data: tricks } = await supabaseServer
      .from("tricks")
      .select("id, name, slug")
      .in("id", athlete.signature_trick_ids);

    if (tricks) {
      athlete.signature_tricks = tricks;
    }
  }

  return athlete as Athlete;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const athlete = await getAthlete(slug);

  if (!athlete) {
    return {
      title: "Athlete Not Found",
    };
  }

  const sportCategories =
    athlete.sport_categories?.map((c) => c.name).join(", ") || "Athlete";

  return {
    title: `${athlete.name} - ${sportCategories} | Trickipedia`,
    description:
      athlete.bio ||
      `${
        athlete.name
      } is a professional ${sportCategories.toLowerCase()} athlete on Trickipedia.`,
    openGraph: {
      title: athlete.name,
      description: athlete.bio,
      images: athlete.profile_image_url ? [athlete.profile_image_url] : [],
    },
  };
}

export default async function AthleteProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const athlete = await getAthlete(slug);

  if (!athlete) {
    notFound();
  }

  return <AthleteProfile athlete={athlete} />;
}
