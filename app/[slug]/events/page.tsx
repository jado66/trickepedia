import { notFound } from "next/navigation";
import { getMasterCategories } from "@/lib/server/categories-data-server";
import { MasterCategory } from "@/lib/types/database";
import { getEventsByCategory } from "@/lib/server/events-server";
import { EventsPageClient } from "@/components/events/event-page-client";

interface EventsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventsPage({ params }: EventsPageProps) {
  const { slug: category } = await params;

  // Get master categories to validate the category exists
  const masterCategories = await getMasterCategories();
  const currentCategory = masterCategories.find(
    (cat) => cat.slug === category
  ) as MasterCategory | undefined;

  if (!currentCategory) {
    notFound();
  }

  // Get all events for this category
  const events = await getEventsByCategory(category);

  return <EventsPageClient events={events} currentCategory={currentCategory} />;
}
