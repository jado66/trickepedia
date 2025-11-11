import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Clock } from "lucide-react";
import type { TrickWithLinkedPrerequisites } from "@/types/trick";

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

const DIFFICULTY_COLORS = {
  1: "bg-emerald-500",
  2: "bg-emerald-500",
  3: "bg-emerald-600",
  4: "bg-amber-500",
  5: "bg-amber-500",
  6: "bg-amber-600",
  7: "bg-orange-500",
  8: "bg-orange-600",
  9: "bg-red-500",
  10: "bg-red-600",
};

interface TrickInfoSidebarProps {
  trick: TrickWithLinkedPrerequisites;
}

export function TrickInfoSidebar({ trick }: TrickInfoSidebarProps) {
  return (
    <div className="space-y-6 mt-0 lg:mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Trick Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {trick.inventor_name && (
            <>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Invented by {trick.inventor_name}
                </p>
              </div>
              <Separator />
            </>
          )}

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Difficulty
            </p>
            <div className="flex items-center gap-2">
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
              <span className="font-medium">
                {
                  DIFFICULTY_LABELS[
                    trick.difficulty_level as keyof typeof DIFFICULTY_LABELS
                  ]
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggestion card - this will need user context from ClientInteractions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-muted-foreground" />
            Suggest Changes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Is there anything you would like to change? Is there anything
            missing?
          </p>
          <Button asChild className="w-full">
            <Link
              href={`/${trick.subcategory?.master_category.slug}/${trick.subcategory?.slug}/${trick.slug}/edit`}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit this trick
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="flex flex-row align-center">
          <Link
            href={`/${trick.subcategory?.master_category.slug}/${trick.subcategory?.slug}`}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-muted/30 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to {trick.subcategory?.name}</span>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
