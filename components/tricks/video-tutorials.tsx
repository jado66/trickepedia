("");
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, ExternalLink } from "lucide-react";
import { TrickWithLinkedPrerequisites } from "@/types/trick";

interface VideoTutorialsProps {
  trick: TrickWithLinkedPrerequisites;
}

export function VideoTutorials({ trick }: VideoTutorialsProps) {
  if (!trick.video_urls || trick.video_urls.length === 0) {
    return null;
  }

  const getYouTubeVideoId = (url: string) => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Play className="h-6 w-6 text-primary" />
          {trick.video_urls && trick.video_urls.length > 1
            ? "Tutorials"
            : "Tutorial"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {trick.video_urls.map((url, index) => {
            const youtubeId = getYouTubeVideoId(url);

            if (youtubeId) {
              return (
                <div key={index} className="space-y-3">
                  {trick.video_urls && trick.video_urls.length > 1 && (
                    <h4 className="font-medium text-lg">
                      Tutorial {index + 1}
                    </h4>
                  )}
                  <div
                    className="relative w-full"
                    style={{ paddingBottom: "56.25%" }}
                  >
                    <iframe
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      title={`${trick.name} - Video Tutorial ${index + 1}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              );
            } else {
              return (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Play className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    {trick.video_urls && trick.video_urls.length > 1 ? (
                      <h4 className="font-medium group-hover:text-primary transition-colors">
                        Video Tutorial {index + 1}
                      </h4>
                    ) : (
                      <h4 className="font-medium group-hover:text-primary transition-colors">
                        Tutorial
                      </h4>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Watch this tutorial to learn the technique
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              );
            }
          })}
        </div>
      </CardContent>
    </Card>
  );
}
