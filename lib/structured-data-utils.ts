// Server-side structured data utilities

export function generateWebsiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Trickipedia",
    alternateName: "Trick Encyclopedia",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://trickipedia.app/",
    description:
      "The ultimate collaborative wiki for parkour, tricking, gymnastics, and trampwall tricks.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${
          process.env.NEXT_PUBLIC_SITE_URL || "https://trickipedia.app/"
        }/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Trickipedia",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://trickipedia.app/",
    description:
      "Community-driven encyclopedia for action sports tricks and tutorials.",
    sameAs: [
      // Add your social media links here
      // "https://twitter.com/trickipedia",
      // "https://facebook.com/trickipedia",
      // "https://instagram.com/trickipedia",
    ],
  };
}

export function generateBreadcrumbStructuredData(
  breadcrumbs: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

export function generateArticleStructuredData(trick: {
  name: string;
  description?: string;
  slug: string;
  categorySlug: string;
  subcategorySlug: string;
  created_at: string;
  updated_at: string;
}) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://trickipedia.app/";

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to ${trick.name}`,
    description: trick.description || `Learn how to perform a ${trick.name}`,
    url: `${baseUrl}/${trick.categorySlug}/${trick.subcategorySlug}/${trick.slug}`,
    datePublished: trick.created_at,
    dateModified: trick.updated_at,
    author: {
      "@type": "Organization",
      name: "Trickipedia Community",
    },
    publisher: {
      "@type": "Organization",
      name: "Trickipedia",
      url: baseUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/${trick.categorySlug}/${trick.subcategorySlug}/${trick.slug}`,
    },
  };
}
