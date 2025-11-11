// Central mapping of master category slug -> image URL & optional gradient color.
// If backend later supplies image_url in MasterCategory, prefer that and treat this as fallback.

export interface CategoryVisualConfig {
  image: string; // full URL or public path
  overlay?: string; // tailwind gradient or color utility classes for overlay
}

// Add/update entries as categories expand.
export const categoryImageMap: Record<string, CategoryVisualConfig> = {
  parkour: {
    image:
      "https://images.unsplash.com/photo-1550701035-c0bb32de8aca?q=80&w=1631&auto=format&fit=crop",
    overlay: "from-black/80 via-black/40 to-transparent",
  },
  tricking: {
    image:
      "https://t3.ftcdn.net/jpg/02/06/54/94/360_F_206549476_7Z0xzTgOGiYSFn9iQK6pVI7oCY0omeAj.jpg",
    overlay: "from-black/80 via-black/40 to-transparent",
  },
  trampoline: {
    image:
      "https://i.ytimg.com/vi/4jnfqBUw6gg/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD",
    overlay: "from-black/80 via-black/40 to-transparent",
  },
  trampwall: {
    image: "https://i.ytimg.com/vi/QYB-sSpxvw4/maxresdefault.jpg",
    overlay: "from-black/80 via-black/40 to-transparent",
  },
  tumbling: {
    image:
      "https://media.cbs8.com/assets/CCT/images/ecee4a64-2299-41e5-8b17-604a6a04fd6d/20240731T184157/ecee4a64-2299-41e5-8b17-604a6a04fd6d_750x422.jpg",
    overlay: "from-black/80 via-black/40 to-transparent",
  },
};

export function getCategoryImage(
  slug?: string | null
): CategoryVisualConfig | undefined {
  if (!slug) return undefined;
  return categoryImageMap[slug];
}
