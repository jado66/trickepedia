"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Check } from "lucide-react";
import type { Trick } from "@/types/trick";
import { cn } from "@/lib/utils";

interface CompactTrickCardProps {
  trick: Trick;
  categorySlug: string;
  subcategorySlug: string;
  difficultyLabels: Record<number, string>;
  difficultyColors: Record<number, string>;
  userCanDo?: boolean;
  onToggleCanDo?: () => void;
}

export function CompactTrickCard({
  trick,
  categorySlug,
  subcategorySlug,
  difficultyLabels,
  difficultyColors,
  userCanDo,
  onToggleCanDo,
}: CompactTrickCardProps) {
  const getYouTubeVideoId = (url: string) => {
    const regex =
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  return (
    <div className="relative">
      <Link href={`/${categorySlug}/${subcategorySlug}/${trick.slug}`}>
        <Card
          className={cn(
            "hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group overflow-hidden py-0 h-24 flex",
            userCanDo &&
              "border-green-500 border-2 bg-green-50 dark:bg-green-950/20"
          )}
        >
          <CardContent className="p-0 flex-1 flex">
            <div className="flex items-stretch w-full h-full">
              {/* Full Height Media */}
              <div className="w-[35%] flex-shrink-0 overflow-hidden bg-muted relative">
                {(() => {
                  const youtubeId =
                    trick.video_urls && trick.video_urls.length > 0
                      ? getYouTubeVideoId(trick.video_urls[0])
                      : null;

                  if (youtubeId) {
                    return (
                      <img
                        src={`https://img.youtube.com/vi/${youtubeId}/default.jpg`}
                        alt={`${trick.name} thumbnail`}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/trick-placeholder.png";
                        }}
                      />
                    );
                  } else {
                    // Show placeholder image instead of first letter
                    return (
                      <img
                        src="/trick-placeholder.png"
                        alt={`${trick.name} placeholder`}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    );
                  }
                })()}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 p-3 flex flex-col justify-center">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-medium text-sm leading-tight truncate group-hover:text-primary transition-colors">
                    {trick.name}
                  </h3>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {trick.difficulty_level && (
                      <div
                        className={`w-5 h-5 ${
                          difficultyColors[
                            trick.difficulty_level as keyof typeof difficultyColors
                          ]
                        } rounded-full flex items-center justify-center`}
                      >
                        <span className="text-white text-xs font-bold">
                          {trick.difficulty_level}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="outline"
                    className="text-xs px-1.5 py-0.5 h-auto"
                  >
                    {trick.subcategory?.name}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground truncate flex-1 mr-2">
                    {trick.description}
                  </p>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground flex-shrink-0">
                    <Eye className="h-3 w-3" />
                    <span>{trick.view_count.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Checkmark positioned on the border at top-right */}
      {userCanDo && onToggleCanDo && (
        <div
          className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-600 transition-colors shadow-md z-10"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleCanDo();
          }}
        >
          <Check className="h-3 w-3 text-white" />
        </div>
      )}
    </div>
  );
}
