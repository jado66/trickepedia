"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  Maximize2,
  Minimize2,
} from "lucide-react";
import Link from "next/link";
import type { Event } from "@/types/event";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface MapViewProps {
  events: Event[];
  categorySlug: string;
}

export function MapView({ events, categorySlug }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Filter events that have coordinates
  const eventsWithCoordinates = events.filter(
    (event) => event.latitude !== null && event.longitude !== null
  );

  useEffect(() => {
    // Load Leaflet dynamically
    const loadMap = async () => {
      if (typeof window === "undefined") return;

      try {
        // Import Leaflet dynamically

        // Import CSS

        if (!mapRef.current) return;

        // Initialize map
        const mapInstance = L.map(mapRef.current).setView(
          [39.8283, -98.5795],
          4
        ); // Center of US

        // Add tile layer (OpenStreetMap)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(mapInstance);

        // Custom icon for event markers
        const eventIcon = L.divIcon({
          html: `
            <div class="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border-2 border-white shadow-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
          `,
          className: "custom-event-marker",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });

        // Add markers for events
        const markers: any[] = [];
        eventsWithCoordinates.forEach((event) => {
          if (event.latitude && event.longitude) {
            const marker = L.marker([event.latitude, event.longitude], {
              icon: eventIcon,
            }).addTo(mapInstance);

            // Create popup content with event details and date
            const eventDate = new Date(event.start_date);
            const formattedDate = eventDate.toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            });

            const popupContent = `
              <div class="p-2 min-w-[200px]">
                <h3 class="font-semibold text-sm mb-2">${event.title}</h3>
                <div class="space-y-1 text-xs text-gray-600">
                  <div class="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    ${formattedDate}
                  </div>
                  ${
                    event.start_time
                      ? `
                    <div class="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                      </svg>
                      ${new Date(
                        `2000-01-01T${event.start_time}`
                      ).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                  `
                      : ""
                  }
                  ${
                    event.location_name
                      ? `
                    <div class="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      ${event.location_name}
                    </div>
                  `
                      : ""
                  }
                  <div class="mt-2 pt-2 border-t">
                    <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      ${
                        event.event_type === "other" && event.custom_event_type
                          ? event.custom_event_type
                          : event.event_type
                      }
                    </span>
                  </div>
                </div>
              </div>
            `;

            marker.bindPopup(popupContent);

            // Add click handler to show event details in sidebar
            marker.on("click", () => {
              setSelectedEvent(event);
            });

            markers.push(marker);
          }
        });

        // Fit map to show all markers if there are any
        if (markers.length > 0) {
          const group = L.featureGroup(markers);
          mapInstance.fitBounds(group.getBounds().pad(0.1));
        }

        setMap(mapInstance);
        setIsLoading(false);

        // Cleanup function
        return () => {
          mapInstance.remove();
        };
      } catch (error) {
        console.error("Error loading map:", error);
        setIsLoading(false);
      }
    };

    loadMap();
  }, [eventsWithCoordinates]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (eventsWithCoordinates.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Events with Locations</h3>
        <p className="text-muted-foreground">
          Events need addresses to appear on the map. Add location details when
          creating events.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`${
        isFullscreen ? "fixed inset-0 z-50 bg-background" : "relative"
      }`}
    >
      <div className={`flex ${isFullscreen ? "h-screen" : "h-[600px]"} gap-4`}>
        {/* Map Container */}
        <div className="flex-1 relative">
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="bg-background/90 backdrop-blur-sm"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          </div>

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}

          <div
            ref={mapRef}
            className="w-full h-full rounded-lg border border-border overflow-hidden"
          />
        </div>

        {/* Event Details Sidebar */}
        <div
          className={`${
            isFullscreen ? "w-80" : "w-72"
          } space-y-4 overflow-y-auto`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Events on Map ({eventsWithCoordinates.length})
            </h3>
          </div>

          {/* Selected Event Details */}
          {selectedEvent && (
            <Card className="border-primary/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-start justify-between gap-2">
                  {selectedEvent.title}
                  <Badge variant="default" className="text-xs">
                    Selected
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedEvent.start_date).toLocaleDateString()}
                  {selectedEvent.start_time && (
                    <span className="ml-1">
                      at{" "}
                      {new Date(
                        `2000-01-01T${selectedEvent.start_time}`
                      ).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>

                {selectedEvent.location_name && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {selectedEvent.location_name}
                  </div>
                )}

                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {selectedEvent.event_type === "other" &&
                    selectedEvent.custom_event_type
                      ? selectedEvent.custom_event_type
                      : selectedEvent.event_type}
                  </Badge>
                  {selectedEvent.is_featured && (
                    <Badge variant="default" className="text-xs">
                      Featured
                    </Badge>
                  )}
                </div>

                <Link href={`/${categorySlug}/events/${selectedEvent.id}`}>
                  <Button size="sm" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* All Events List */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">
              All Events
            </h4>
            {eventsWithCoordinates.map((event) => (
              <Card
                key={event.id}
                className={`cursor-pointer transition-colors hover:border-primary/50 ${
                  selectedEvent?.id === event.id
                    ? "border-primary/50 bg-primary/5"
                    : ""
                }`}
                onClick={() => setSelectedEvent(event)}
              >
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm mb-1">{event.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Calendar className="w-3 h-3" />
                    {new Date(event.start_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                    {event.start_time && (
                      <span className="flex items-center gap-1 ml-2">
                        <Clock className="w-3 h-3" />
                        {new Date(
                          `2000-01-01T${event.start_time}`
                        ).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                  {event.location_name && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {event.location_name}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
