"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, ImageIcon, CheckCircle, Clock } from "lucide-react";

interface EmbeddedMediaFieldProps {
  field: {
    id: string;
    type: "embedded_video" | "embedded_image";
    label: string;
    required?: boolean;
    validation_rules?: {
      video_url?: string;
      image_url?: string;
      duration?: string;
      description?: string;
      alt_text?: string;
    };
  };
  value?: boolean;
  onChange?: (value: boolean) => void;
  error?: string;
  disabled?: boolean;
}

export function EmbeddedMediaField({
  field,
  value = false,
  onChange,
  error,
  disabled,
}: EmbeddedMediaFieldProps) {
  const [isViewed, setIsViewed] = useState(value);
  const rules = field.validation_rules || {};

  const handleView = () => {
    if (disabled) return;

    setIsViewed(true);
    onChange?.(true);
  };

  if (field.type === "embedded_video") {
    return (
      <div className="space-y-3">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Play className="w-4 h-4 text-blue-500" />
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </CardTitle>
            {rules.description && (
              <p className="text-sm text-muted-foreground">
                {rules.description}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              {rules.video_url ? (
                <video
                  controls
                  className="w-full h-full rounded-lg"
                  onPlay={handleView}
                  poster="/placeholder.svg?height=200&width=400"
                >
                  <source src={rules.video_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="text-center">
                  <Play className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Video placeholder
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {rules.duration && (
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {rules.duration}
                  </Badge>
                )}
                {isViewed && (
                  <Badge variant="default" className="text-xs bg-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Viewed
                  </Badge>
                )}
              </div>

              {!isViewed && field.required && (
                <Button size="sm" onClick={handleView} disabled={disabled}>
                  <Play className="w-4 h-4 mr-1" />
                  Watch Required Video
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  // Embedded Image
  return (
    <div className="space-y-3">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-green-500" />
            {field.label}
          </CardTitle>
          {rules.description && (
            <p className="text-sm text-muted-foreground">{rules.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="rounded-lg overflow-hidden">
            {rules.image_url ? (
              <img
                src={rules.image_url || "/placeholder.svg"}
                alt={rules.alt_text || field.label}
                className="w-full h-auto"
                onLoad={handleView}
              />
            ) : (
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Image placeholder
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
