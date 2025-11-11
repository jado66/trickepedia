import { AthleteCard } from "@/components/athletes/athlete-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter } from "lucide-react";
import Link from "next/link";
import { Athlete } from "@/lib/types/athlete";
import { createServer } from "@/utils/supabase/server";

async function getAthletes(searchParams: {
  search?: string;
  sport?: string;
  skill_level?: string;
  country?: string;
}) {
  const supabaseServer = createServer();

  let query = supabaseServer
    .from("athletes")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (searchParams.search) {
    query = query.ilike("name", `%${searchParams.search}%`);
  }

  if (searchParams.sport) {
    query = query.eq("sport", searchParams.sport);
  }

  if (searchParams.skill_level) {
    query = query.eq("skill_level", searchParams.skill_level);
  }

  if (searchParams.country) {
    query = query.eq("country", searchParams.country);
  }

  const { data: athletes, error } = await query;

  if (error) {
    const errorMessage = error.message || String(error);
    const isFetchError =
      errorMessage.includes("fetch failed") ||
      errorMessage.includes("ECONNREFUSED");

    console.error("Error fetching athletes:", {
      message: errorMessage,
      details: error.stack || error,
      hint: isFetchError
        ? "⚠️  VPN ISSUE? If you're connected to a VPN, try disconnecting it."
        : "",
      code: error.code || "",
    });

    if (isFetchError && process.env.NODE_ENV === "development") {
      console.log(
        "\n🚨 VPN/CONNECTION ERROR - Check your network connection or disable VPN 🚨\n"
      );
    }

    return [];
  }

  return athletes as Athlete[];
}

async function getSports() {
  const supabaseServer = createServer();
  const { data } = await supabaseServer
    .from("athletes")
    .select("sport")
    .eq("status", "active");

  const uniqueSports = [...new Set(data?.map((item) => item.sport) || [])];
  return uniqueSports.sort();
}

async function getCountries() {
  const supabaseServer = createServer();
  const { data } = await supabaseServer
    .from("athletes")
    .select("country")
    .eq("status", "active")
    .not("country", "is", null);

  const uniqueCountries = [...new Set(data?.map((item) => item.country) || [])];
  return uniqueCountries.sort();
}

export default async function AthletesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const searchQuery = {
    search: typeof params.search === "string" ? params.search : undefined,
    sport: typeof params.sport === "string" ? params.sport : undefined,
    skill_level:
      typeof params.skill_level === "string" ? params.skill_level : undefined,
    country: typeof params.country === "string" ? params.country : undefined,
  };

  const [athletes, sports, countries] = await Promise.all([
    getAthletes(searchQuery),
    getSports(),
    getCountries(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-balance">Athletes</h1>
            <p className="text-muted-foreground mt-2">
              Discover the incredible athletes pushing the boundaries of their
              sports
            </p>
          </div>
          <Link href="/athletes/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Athlete
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search athletes..."
              className="pl-10"
              defaultValue={searchQuery.search}
              name="search"
            />
          </div>

          <div className="flex gap-2">
            <Select defaultValue={searchQuery.sport || "all"}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                {sports.map((sport) => (
                  <SelectItem key={sport} value={sport}>
                    {sport}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select defaultValue={searchQuery.skill_level || "all"}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Skill Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="elite">Elite</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue={searchQuery.country || "all"}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Athletes Grid */}
      {athletes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {athletes.map((athlete) => (
            <AthleteCard key={athlete.id} athlete={athlete} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No athletes found</p>
            <p className="text-sm">Try adjusting your search filters</p>
          </div>
          <Link href="/athletes/new">
            <Button>Add the first athlete</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
