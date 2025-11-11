import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Heart, Clock, ArrowRight } from "lucide-react";
import { getTricks } from "@/lib/server/tricks-data-server";
import { TrickImage } from "@/components/trick-image";
import { Trick } from "@/types/trick";

const DIFFICULTY_COLORS = {
  1: "bg-green-500",
  2: "bg-green-500",
  3: "bg-green-500",
  4: "bg-yellow-500",
  5: "bg-yellow-500",
  6: "bg-yellow-500",
  7: "bg-orange-500",
  8: "bg-orange-500",
  9: "bg-red-500",
  10: "bg-red-500",
};

const DIFFICULTY_LABELS = {
  1: "Beginner",
  2: "Beginner",
  3: "Beginner",
  4: "Intermediate",
  5: "Intermediate",
  6: "Intermediate",
  7: "Advanced",
  8: "Advanced",
  9: "Expert",
  10: "Expert",
};

export async function RecentTricks() {
  let tricks: Trick[] = [];

  try {
    const { tricks: tricksData } = await getTricks({ limit: 4 });
    tricks = tricksData;
  } catch (error) {
    console.error("Failed to load recent tricks:", error);
    // For SSR, we'll return empty array on error instead of showing loading state
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  // Helper function to build the new path structure
  const getTrickPath = (trick: Trick) => {
    if (!trick.subcategory) return "#"; // fallback if subcategory data is missing
    return `/${trick.subcategory.master_category.slug}/${trick.subcategory.slug}/${trick.slug}`;
  };

  const getAllTricksPath = () => {
    // You might want to replace this with a specific category/subcategory or create a general tricks listing page
    // For now, I'm using a generic path - you may need to adjust this based on your routing structure
    return "/browse-tricks"; // or whatever your general tricks listing page is
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-balance mb-4">
              Recently Added Tricks
            </h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Discover the latest techniques added by our community.
            </p>
          </div>
          {/* <Button
            variant="outline"
            asChild
            className="hidden sm:flex bg-transparent"
          >
            <Link href={getAllTricksPath()}>
              View All Tricks
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tricks.map((trick) => (
            <Link key={trick.id} href={getTrickPath(trick)}>
              <Card className="pt-0 h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group overflow-hidden">
                <div className="aspect-video relative overflow-hidden">
                  <TrickImage
                    trick={trick}
                    alt={trick.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="text-xs">
                      {trick.subcategory?.master_category.name}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <div
                      className={`w-6 h-6 ${
                        DIFFICULTY_COLORS[
                          trick.difficulty_level as keyof typeof DIFFICULTY_COLORS
                        ]
                      } rounded-full flex items-center justify-center`}
                    >
                      <span className="text-white text-xs font-bold">
                        {trick.difficulty_level}
                      </span>
                    </div>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {trick.subcategory?.name}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        DIFFICULTY_COLORS[
                          trick.difficulty_level as keyof typeof DIFFICULTY_COLORS
                        ]
                      } text-white border-0`}
                    >
                      {
                        DIFFICULTY_LABELS[
                          trick.difficulty_level as keyof typeof DIFFICULTY_LABELS
                        ]
                      }
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight">
                    {trick.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-pretty line-clamp-2">
                    {trick.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{trick.view_count.toLocaleString()}</span>
                      </div>
                      {/* <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                      
                      </div> */}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {trick.created_at
                          ? formatTimeAgo(trick.created_at)
                          : "Unknown"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Button variant="outline" asChild>
            <Link href={getAllTricksPath()}>
              View All Tricks
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
