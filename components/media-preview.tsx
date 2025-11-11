import {
  Video,
  Play,
  ImageIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { TrickImage } from "./trick-image";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";

interface MediaPreviewProps {
  formData: {
    image_urls: string[];
    video_urls: string[];
    [key: string]: any;
  };
  mode: "view" | "edit" | "create";
}

// Helper functions
const getYouTubeVideoId = (url: string): string | null => {
  const regex =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const getYouTubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export function MediaPreview({ formData, mode }: MediaPreviewProps) {
  const validImages = formData.image_urls.filter(
    (url) => url.trim() && isValidUrl(url)
  );
  const validVideos = formData.video_urls.filter(
    (url) => url.trim() && isValidUrl(url)
  );
  const hasValidMedia = validImages.length > 0 || validVideos.length > 0;

  if (!hasValidMedia && mode === "view") return null;

  return (
    <div className="space-y-4">
      {/* Media Status Indicator */}
      <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border">
        {hasValidMedia ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              Media Added Successfully
            </span>
            <div className="flex gap-2 ml-auto">
              {validImages.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {validImages.length} image
                  {validImages.length !== 1 ? "s" : ""}
                </Badge>
              )}
              {validVideos.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {validVideos.length} video
                  {validVideos.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              No valid media URLs added yet
            </span>
          </>
        )}
      </div>

      {hasValidMedia && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Main preview using TrickImage logic */}

          {/* Additional images */}
          {validImages.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-2">
                <ImageIcon className="h-3 w-3" />
                Images ({validImages.length})
              </Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {validImages.map((url, idx) => (
                  <div
                    key={idx}
                    className="aspect-video bg-muted rounded overflow-hidden border group relative"
                  >
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Video thumbnails */}
      {validVideos.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-2">
            <Video className="h-3 w-3" />
            Videos ({validVideos.length})
          </Label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {validVideos.map((url, idx) => {
              const youtubeId = getYouTubeVideoId(url);
              return (
                <div key={idx} className="flex-shrink-0 relative group">
                  <div className="w-24 h-16 bg-muted rounded overflow-hidden border">
                    {youtubeId ? (
                      <img
                        src={
                          getYouTubeThumbnail(youtubeId) || "/placeholder.svg"
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
