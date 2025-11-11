// Utility functions for trick form
export const getYouTubeVideoId = (url: string) => {
  const regex =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

export const getYouTubeThumbnail = (videoId: string) => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

// Convert string to kebab case
export const toKebabCase = (str: string) => {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const getDifficultyColor = (level: number) => {
  if (level <= 3)
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  if (level <= 6)
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
};

export const getDifficultyLabel = (level: number) => {
  if (level <= 3) return "Beginner";
  if (level <= 6) return "Intermediate";
  return "Advanced";
};
