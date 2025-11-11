"use client";

import { Label } from "@/components/ui/label";
import { TrickImage } from "@/components/trick-image";
import { Video, Play } from "lucide-react";
import { getYouTubeVideoId, getYouTubeThumbnail } from "@/lib/trick-form-utils";
import type { TrickData } from "@/types/trick";

interface MediaPreviewProps {
  formData: TrickData;
  mode: "view" | "edit" | "create";
}

export function MediaPreview({ formData, mode }: MediaPreviewProps) {
  const hasImages = formData.image_urls?.some((url) => url.trim()) ?? false;
  const hasVideos = formData.video_urls?.some((url) => url.trim()) ?? false;

  if (!hasImages && !hasVideos && mode === "view") return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Main preview using TrickImage logic */}
        <div className="space-y-2">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/20">
            <TrickImage
              trick={formData as any}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Additional images */}
        {hasImages && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Images (
              {formData.image_urls?.filter((url) => url.trim()).length || 0})
            </Label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {formData.image_urls
                ?.filter((url) => url.trim())
                .map((url, idx) => (
                  <div
                    key={idx}
                    className="aspect-video bg-muted rounded overflow-hidden"
                  >
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/trick-placeholder.png";
                      }}
                    />
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Video thumbnails */}
      {hasVideos && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            Videos (
            {formData.video_urls?.filter((url) => url.trim()).length || 0})
          </Label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {formData.video_urls
              ?.filter((url) => url.trim())
              .map((url, idx) => {
                const youtubeId = getYouTubeVideoId(url);
                return (
                  <div key={idx} className="flex-shrink-0 relative group">
                    <div className="w-24 h-16 bg-muted rounded overflow-hidden border">
                      {youtubeId ? (
                        <img
                          src={
                            getYouTubeThumbnail(youtubeId) ||
                            "/placeholder.svg" ||
                            "/placeholder.svg"
                          }
                          alt={`Video ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
