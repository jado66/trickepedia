import { AthleteForm } from "@/components/athletes/athlete-form";
import { notFound } from "next/navigation";
import { Athlete } from "@/lib/types/athlete";
import { createServer } from "@/utils/supabase/server";

async function getAthlete(slug: string): Promise<Athlete | null> {
  const supabaseServer = createServer();
  const { data: athlete, error } = await supabaseServer
    .from("athletes")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !athlete) {
    return null;
  }

  return athlete as Athlete;
}

export default async function EditAthletePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const athlete = await getAthlete(slug);

  if (!athlete) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">
            Edit {athlete.name}
          </h1>
          <p className="text-muted-foreground mt-2">
            Update the athlete profile information
          </p>
        </div>

        <AthleteForm athlete={athlete} />
      </div>
    </div>
  );
}
