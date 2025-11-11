import type { Event } from "@/types/event";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ExternalLink,
  Star,
} from "lucide-react";
import Link from "next/link";
import { EventActions } from "@/components/events/event-actions";

interface EventCardProps {
  event: Event;
  isPast?: boolean;
}

export function EventCard({ event, isPast = false }: EventCardProps) {
  const startDate = new Date(event.start_date);
  const endDate = event.end_date ? new Date(event.end_date) : null;
  const isMultiDay = endDate && endDate.getTime() !== startDate.getTime();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getEventTypeDisplay = () => {
    if (event.event_type === "other" && event.custom_event_type) {
      return event.custom_event_type;
    }
    return event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1);
  };

  const getLocationDisplay = () => {
    if (event.location_scope === "online") return "Online Event";
    if (event.location_city && event.location_state) {
      return `${event.location_city}, ${event.location_state}`;
    }
    if (event.location_name) return event.location_name;
    return "Location TBD";
  };

  return (
    <Card className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300">
      {/* Event Image */}
      <div className="relative aspect-video overflow-hidden">
        {event.image_url ? (
          <img
            src={event.image_url || "/placeholder.svg"}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Calendar className="w-12 h-12 text-muted-foreground" />
          </div>
        )}

        {/* Overlay with badges */}
        <div className="absolute inset-0 event-card-overlay" />
        <div className="absolute top-3 left-3 flex gap-2">
          {event.is_featured && (
            <Badge
              variant="secondary"
              className="bg-accent text-accent-foreground"
            >
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
          <Badge
            variant="outline"
            className="bg-background/80 backdrop-blur-sm"
          >
            {getEventTypeDisplay()}
          </Badge>
        </div>

        {/* Date badge */}
        <div className="absolute top-3 right-3">
          <div className="bg-background/90 backdrop-blur-sm rounded-lg p-2 text-center min-w-[60px]">
            <div className="text-xs font-medium text-muted-foreground uppercase">
              {startDate.toLocaleDateString("en-US", { month: "short" })}
            </div>
            <div className="text-lg font-bold leading-none">
              {startDate.getDate()}
            </div>
          </div>
        </div>
      </div>

      {/* Event Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-bold text-lg leading-tight text-balance group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          {isPast && (
            <Badge variant="outline" className="text-xs shrink-0">
              Past
            </Badge>
          )}
        </div>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>
              {isMultiDay
                ? `${formatDate(startDate)} - ${formatDate(endDate!)}`
                : formatDate(startDate)}
            </span>
          </div>

          {event.start_time && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 shrink-0" />
              <span>
                {formatTime(event.start_time)}
                {event.end_time && ` - ${formatTime(event.end_time)}`}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">{getLocationDisplay()}</span>
          </div>

          {event.max_participants && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4 shrink-0" />
              <span>Max {event.max_participants} participants</span>
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button asChild variant="default" size="sm" className="flex-1">
            <Link href={`/${event.master_categories?.slug}/events/${event.id}`}>
              View Details
            </Link>
          </Button>

          {event.event_url && (
            <Button asChild variant="outline" size="sm">
              <Link
                href={event.event_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </Button>
          )}

          <EventActions event={event} showInCard />
        </div>
      </div>
    </Card>
  );
}
