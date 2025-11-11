"use client";

import { TrickWithLinkedPrerequisites } from "@/types/trick";

interface TrickImageGalleryProps {
  trick: TrickWithLinkedPrerequisites;
}

export function TrickImageGallery({ trick }: TrickImageGalleryProps) {
  if (!trick.image_urls || trick.image_urls.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trick.image_urls.map((url, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-lg border bg-muted"
          >
            <img
              src={url || "/placeholder.svg"}
              alt={`${trick.name} demonstration ${index + 1}`}
              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `/placeholder.svg?height=256&width=400&query=${encodeURIComponent(
                  `${trick.name} technique demonstration`
                )}`;
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-white text-sm font-medium">
                Step {index + 1} - {trick.name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
