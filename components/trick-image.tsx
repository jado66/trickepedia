"use client";

import { Trick } from "@/types/trick";

interface TrickImageProps {
  trick: Trick;
  alt?: string;
  className?: string;
}

// Function to extract YouTube video ID from various YouTube URL formats
const getYouTubeVideoId = (url: string) => {
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Function to get YouTube thumbnail URL
const getYouTubeThumbnail = (videoId: string) => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

// Function to get the best available image for a trick
const getTrickImageUrl = (trick: Trick) => {
  // First priority: existing image URLs
  if (trick.image_urls && trick.image_urls.length > 0 && trick.image_urls[0]) {
    return trick.image_urls[0];
  }

  // Second priority: YouTube thumbnail if video URLs exist
  if (trick.video_urls && trick.video_urls.length > 0) {
    for (const videoUrl of trick.video_urls) {
      const youtubeId = getYouTubeVideoId(videoUrl);
      if (youtubeId) {
        return getYouTubeThumbnail(youtubeId);
      }
    }
  }

  // Fallback: placeholder
  return "/trick-placeholder.png";
};

export function TrickImage({ trick, alt, className }: TrickImageProps) {
  return (
    <img
      src={getTrickImageUrl(trick)}
      alt={alt || trick.name}
      className={className}
    />
  );
}
