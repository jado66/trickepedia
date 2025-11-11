import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://trickipedia.app/";

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contribute`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faqs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // ...existing code...
  ];

  try {
    // Fetch all navigation categories, subcategories, and tricks for dynamic routes
    let categories: any[] = [];
    try {
      const navResponse = await fetch(`${baseUrl}/api/navigation-categories`, {
        headers: {
          "User-Agent": "Sitemap Generator",
        },
      });
      if (!navResponse.ok) {
        const body = await navResponse.text();
        console.warn(
          `Failed to fetch navigation categories for sitemap: status=${
            navResponse.status
          }, body=${body.slice(0, 200)}`
        );
        return staticRoutes;
      }
      categories = await navResponse.json();
    } catch (err) {
      console.error("Error fetching navigation categories for sitemap:", err);
      return staticRoutes;
    }

    // Generate category routes
    const categoryRoutes: MetadataRoute.Sitemap = categories.map(
      (category: any) => ({
        url: `${baseUrl}/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.9,
      })
    );

    // Add dynamic skill-tree route for each category
    const skillTreeRoutes: MetadataRoute.Sitemap = categories.map(
      (category: any) => ({
        url: `${baseUrl}/${category.slug}/skill-tree`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })
    );

    // Generate subcategory and trick routes
    const subcategoryRoutes: MetadataRoute.Sitemap = [];
    const trickRoutes: MetadataRoute.Sitemap = [];
    for (const category of categories) {
      if (category.subcategories) {
        for (const subcategory of category.subcategories) {
          subcategoryRoutes.push({
            url: `${baseUrl}/${category.slug}/${subcategory.slug}`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.8,
          });
          if (subcategory.tricks) {
            for (const trick of subcategory.tricks) {
              trickRoutes.push({
                url: `${baseUrl}/${category.slug}/${subcategory.slug}/${trick.slug}`,
                lastModified: new Date(),
                changeFrequency: "monthly" as const,
                priority: 0.7,
              });
            }
          }
        }
      }
    }

    return [
      ...staticRoutes,
      ...categoryRoutes,
      ...skillTreeRoutes,
      ...subcategoryRoutes,
      ...trickRoutes,
    ];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return staticRoutes;
  }
}
