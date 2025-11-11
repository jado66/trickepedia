"use client";

import { useState } from "react";
import { EventCard } from "@/components/events/event-card";
import { CalendarView } from "@/components/events/calendar-view";
import { MapView } from "@/components/events/map-view";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, MapPin, List, LayoutGrid } from "lucide-react";
import { CreateEventDialog } from "@/components/events/create-event-dialog";
import { Badge } from "@/components/ui/badge";
import { Event } from "@/types/event";
// Use database MasterCategory type (move_name is optional there)
import { MasterCategory } from "@/lib/types/database";

interface EventsPageClientProps {
  events: Event[];
  currentCategory: MasterCategory;
}

type ViewMode = "list" | "calendar" | "map";

export function EventsPageClient({
  events,
  currentCategory,
}: EventsPageClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Provide a safe fallback for move_name when it's null/undefined in DB
  const moveName = currentCategory.move_name ?? currentCategory.name ?? "Trick";

  // Separate upcoming and past events
  const now = new Date();
  const upcomingEvents = events.filter(
    (event) => new Date(event.start_date) >= now
  );
  const pastEvents = events.filter((event) => new Date(event.start_date) < now);

  const renderListView = () => (
    <div className="space-y-8">
      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Upcoming Events</h2>
            <Badge variant="default" className="text-sm">
              {upcomingEvents.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-6 h-6 text-muted-foreground" />
            <h2 className="text-2xl font-bold">Past Events</h2>
            <Badge variant="secondary" className="text-sm">
              {pastEvents.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((event) => (
              <EventCard key={event.id} event={event} isPast />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {events.length === 0 && (
        <div className="text-center py-16">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">No Events Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Be the first to add a {moveName} event to the{" "}
            {currentCategory.name.toLowerCase()} community!
          </p>
          <CreateEventDialog
            categoryId={currentCategory.id}
            categorySlug={currentCategory.slug}
            moveName={moveName}
            trigger={
              <Button size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Add First Event
              </Button>
            }
          />
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (viewMode) {
      case "calendar":
        return (
          <CalendarView events={events} categorySlug={currentCategory.slug} />
        );
      case "map":
        return <MapView events={events} categorySlug={currentCategory.slug} />;
      default:
        return renderListView();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-card border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-balance mb-4">
                {currentCategory.name} Events
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl text-balance">
                Discover {moveName} competitions, jams, workshops, and
                gatherings in the {currentCategory.name.toLowerCase()}{" "}
                community.
              </p>
            </div>
            <div className="hidden md:flex">
              <CreateEventDialog
                categoryId={currentCategory.id}
                categorySlug={currentCategory.slug}
                moveName={moveName}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Mobile Add Event Button */}
        <div className="md:hidden mb-6">
          <CreateEventDialog
            categoryId={currentCategory.id}
            categorySlug={currentCategory.slug}
            moveName={moveName}
            trigger={
              <Button size="lg" className="w-full">
                <Plus className="w-5 h-5 mr-2" />
                Add Event
              </Button>
            }
          />
        </div>

        {/* View Mode Switcher */}
        {events.length > 0 && (
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                View:
              </span>
              <div className="flex items-center border border-border rounded-lg p-1 bg-card">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 px-3"
                >
                  <List className="w-4 h-4 mr-2" />
                  List
                </Button>
                <Button
                  variant={viewMode === "calendar" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("calendar")}
                  className="h-8 px-3"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Calendar
                </Button>
                <Button
                  variant={viewMode === "map" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("map")}
                  className="h-8 px-3"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Map
                </Button>
              </div>
            </div>

            {/* Event Count */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LayoutGrid className="w-4 h-4" />
              {events.length} {events.length === 1 ? "event" : "events"}
            </div>
          </div>
        )}

        {/* Content based on view mode */}
        {renderContent()}
      </div>
    </div>
  );
}
