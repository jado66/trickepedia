import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ExternalLink,
  Star,
  DollarSign,
  User,
  Phone,
  AlertCircle,
  Wrench,
  Instagram,
  Facebook,
  Twitter,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getEventById } from "@/lib/server/events-server";
import { EventActions } from "@/components/events/event-actions";

interface EventDetailPageProps {
  params: Promise<{ slug: string; id: string }>;
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { slug: category, id } = await params;

  const event = await getEventById(id);

  if (!event || event.master_categories?.slug !== category) {
    notFound();
  }

  const startDate = new Date(event.start_date);
  const endDate = event.end_date ? new Date(event.end_date) : null;
  const isMultiDay = endDate && endDate.getTime() !== startDate.getTime();
  const isPast = startDate < new Date();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
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

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <Instagram className="w-4 h-4" />;
      case "facebook":
        return <Facebook className="w-4 h-4" />;
      case "twitter":
        return <Twitter className="w-4 h-4" />;
      default:
        return <ExternalLink className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back Navigation */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/${category}/events`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {event.master_categories?.name} Events
            </Link>
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        {event.image_url && (
          <div className="relative h-64 md:h-96 overflow-hidden">
            <Image
              src={event.image_url || "/placeholder.svg"}
              alt={event.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {event.is_featured && (
              <Badge
                variant="secondary"
                className="bg-accent text-accent-foreground"
              >
                <Star className="w-3 h-3 mr-1" />
                Featured Event
              </Badge>
            )}
            <Badge variant="outline">{getEventTypeDisplay()}</Badge>
            {event.skill_level && (
              <Badge variant="outline">
                {event.skill_level.replace("_", " ").toUpperCase()}
              </Badge>
            )}
            {isPast && (
              <Badge variant="outline" className="text-muted-foreground">
                Past Event
              </Badge>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-balance mb-4">
            {event.title}
          </h1>

          {event.description && (
            <p className="text-xl text-muted-foreground max-w-3xl text-balance">
              {event.description}
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Details */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Event Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date & Time */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <div className="font-medium">Date</div>
                        <div className="text-sm text-muted-foreground">
                          {isMultiDay
                            ? `${formatDate(startDate)} - ${formatDate(
                                endDate!
                              )}`
                            : formatDate(startDate)}
                        </div>
                      </div>
                    </div>

                    {event.start_time && (
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <div className="font-medium">Time</div>
                          <div className="text-sm text-muted-foreground">
                            {formatTime(event.start_time)}
                            {event.end_time &&
                              ` - ${formatTime(event.end_time)}`}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <div className="font-medium">Location</div>
                        <div className="text-sm text-muted-foreground">
                          {event.location_scope === "online" ? (
                            "Online Event"
                          ) : (
                            <>
                              {event.location_name && (
                                <div>{event.location_name}</div>
                              )}
                              {event.location_address && (
                                <div>{event.location_address}</div>
                              )}
                              {event.location_city && event.location_state && (
                                <div>
                                  {event.location_city}, {event.location_state}
                                </div>
                              )}
                              {event.location_country && (
                                <div>{event.location_country}</div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            {(event.entry_fee ||
              event.max_participants ||
              event.age_restrictions ||
              event.equipment_requirements) && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">
                    Additional Information
                  </h2>
                  <div className="space-y-4">
                    {event.entry_fee && (
                      <div className="flex items-start gap-3">
                        <DollarSign className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <div className="font-medium">Entry Fee</div>
                          <div className="text-sm text-muted-foreground">
                            {event.entry_fee}
                          </div>
                        </div>
                      </div>
                    )}

                    {event.max_participants && (
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <div className="font-medium">Max Participants</div>
                          <div className="text-sm text-muted-foreground">
                            {event.max_participants}
                          </div>
                        </div>
                      </div>
                    )}

                    {event.age_restrictions && (
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <div className="font-medium">Age Requirements</div>
                          <div className="text-sm text-muted-foreground">
                            {event.age_restrictions}
                          </div>
                        </div>
                      </div>
                    )}

                    {event.equipment_requirements && (
                      <div className="flex items-start gap-3">
                        <Wrench className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <div className="font-medium">
                            Equipment Requirements
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {event.equipment_requirements}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {event.event_url && (
                    <Button asChild size="lg" className="w-full">
                      <Link
                        href={event.event_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit Event Page
                      </Link>
                    </Button>
                  )}

                  <EventActions event={event} />

                  {event.registration_deadline && (
                    <div className="text-center text-sm text-muted-foreground">
                      Registration deadline:{" "}
                      {new Date(
                        event.registration_deadline
                      ).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Organizer Info */}
            {(event.organizer_name || event.organizer_contact) && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-3">Organizer</h3>
                  {event.organizer_name && (
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{event.organizer_name}</span>
                    </div>
                  )}
                  {event.organizer_contact && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{event.organizer_contact}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Social Links */}
            {event.social_links &&
              Object.keys(event.social_links).length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-3">Follow Event</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(event.social_links).map(
                        ([platform, url]) => (
                          <Button
                            key={platform}
                            asChild
                            variant="outline"
                            size="sm"
                          >
                            <Link
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {getSocialIcon(platform)}
                              <span className="ml-2 capitalize">
                                {platform}
                              </span>
                            </Link>
                          </Button>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
