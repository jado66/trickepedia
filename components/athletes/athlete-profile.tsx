"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  Trophy,
  ExternalLink,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Twitch,
  MessageCircle,
  Hash,
  Globe,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { Athlete, SocialMediaPlatform } from "@/lib/types/athlete";

interface AthleteProfileProps {
  athlete: Athlete;
}

const getSocialIcon = (platform: SocialMediaPlatform) => {
  const iconClass = "h-5 w-5";
  switch (platform) {
    case "instagram":
      return <Instagram className={iconClass} />;
    case "youtube":
      return <Youtube className={iconClass} />;
    case "tiktok":
      return <Hash className={iconClass} />;
    case "twitter":
      return <Twitter className={iconClass} />;
    case "facebook":
      return <Facebook className={iconClass} />;
    case "twitch":
      return <Twitch className={iconClass} />;
    case "discord":
      return <MessageCircle className={iconClass} />;
    case "website":
      return <Globe className={iconClass} />;
    default:
      return <Globe className={iconClass} />;
  }
};

const formatFollowerCount = (count: number) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

const getStatusBadge = (status: string) => {
  const badges = {
    active: {
      label: "COMPETING",
      className: "bg-primary text-primary-foreground",
    },
    retired: { label: "RETIRED", className: "bg-muted text-muted-foreground" },
    injured: {
      label: "INJURED",
      className: "bg-destructive text-destructive-foreground",
    },
    inactive: {
      label: "INACTIVE",
      className: "bg-secondary text-secondary-foreground",
    },
  };
  return badges[status as keyof typeof badges] || badges.active;
};

const extractYouTubeId = (url: string) => {
  const match = url.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  );
  return match ? match[1] : null;
};

const extractInstagramId = (url: string) => {
  const match = url.match(/instagram\.com\/(?:p|reel)\/([^/?]+)/);
  return match ? match[1] : null;
};

export function AthleteProfile({ athlete }: AthleteProfileProps) {
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const statusBadge = getStatusBadge(athlete.status);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[500px] overflow-hidden">
        {athlete.cover_image_url ? (
          <img
            src={athlete.cover_image_url || "/placeholder.svg"}
            alt={athlete.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-12">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* Profile Image */}
              {athlete.profile_image_url && (
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden border-4 border-background shadow-2xl">
                  <img
                    src={athlete.profile_image_url || "/placeholder.svg"}
                    alt={athlete.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
              )}

              {/* Name and Status */}
              <div className="flex-1">
                <Badge
                  className={`${statusBadge.className} mb-3 font-mono text-xs tracking-wider`}
                >
                  {statusBadge.label}
                </Badge>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance mb-2 text-foreground">
                  {athlete.name.toUpperCase()}
                </h1>
                {athlete.sport_categories &&
                  athlete.sport_categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {athlete.sport_categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/${category.slug}`}
                          className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium uppercase tracking-wide"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  )}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {athlete.country && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {athlete.city ? `${athlete.city}, ` : ""}
                        {athlete.country}
                      </span>
                    </div>
                  )}
                  {athlete.date_of_birth && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {calculateAge(athlete.date_of_birth)} years old
                      </span>
                    </div>
                  )}
                  {athlete.years_experience && (
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      <span>{athlete.years_experience} years pro</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Primary CTA */}
              {athlete.primary_cta && (
                <Button size="lg" className="font-bold" asChild>
                  <a
                    href={athlete.primary_cta.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {athlete.primary_cta.text}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Bio */}
            {athlete.bio && (
              <section>
                <p className="text-lg leading-relaxed text-foreground">
                  {athlete.bio}
                </p>
              </section>
            )}

            {/* Video Embeds */}
            {athlete.video_embeds && athlete.video_embeds.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold mb-6 uppercase tracking-tight">
                  Featured Videos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {athlete.video_embeds.map((video) => (
                    <div key={video.id} className="space-y-2">
                      {video.platform === "youtube" &&
                        extractYouTubeId(video.url) && (
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary">
                            <iframe
                              src={`https://www.youtube.com/embed/${extractYouTubeId(
                                video.url
                              )}`}
                              title={video.title || "Video"}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="absolute inset-0 w-full h-full"
                            />
                          </div>
                        )}
                      {video.platform === "instagram" &&
                        extractInstagramId(video.url) && (
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-secondary">
                            <iframe
                              src={`https://www.instagram.com/p/${extractInstagramId(
                                video.url
                              )}/embed`}
                              title={video.title || "Instagram post"}
                              allowFullScreen
                              className="absolute inset-0 w-full h-full"
                            />
                          </div>
                        )}
                      {video.title && (
                        <p className="text-sm text-muted-foreground">
                          {video.title}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Timeline */}
            {athlete.timeline_sections &&
              athlete.timeline_sections.length > 0 && (
                <section>
                  <h2 className="text-3xl font-bold mb-8 uppercase tracking-tight">
                    Timeline
                  </h2>
                  <div className="space-y-8">
                    {athlete.timeline_sections
                      .sort((a, b) => a.order - b.order)
                      .map((section, index) => (
                        <div
                          key={section.id}
                          className="relative pl-8 border-l-2 border-primary/30"
                        >
                          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary" />
                          <div className="space-y-2">
                            <div className="flex items-baseline gap-3">
                              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                                {section.year ||
                                  section.date_range ||
                                  `Section ${index + 1}`}
                              </span>
                              <h3 className="text-xl font-bold uppercase tracking-tight">
                                {section.title}
                              </h3>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                              {section.content}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </section>
              )}

            {/* Signature Tricks */}
            {athlete.signature_tricks &&
              athlete.signature_tricks.length > 0 && (
                <section>
                  <h2 className="text-3xl font-bold mb-6 uppercase tracking-tight">
                    Signature Tricks
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {athlete.signature_tricks.map((trick) => (
                      <Link
                        key={trick.id}
                        href={`/tricks/${trick.slug}`}
                        className="px-4 py-2 bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors rounded-md font-medium"
                      >
                        {trick.name}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

            {/* Achievements */}
            {athlete.notable_achievements && (
              <section>
                <h2 className="text-3xl font-bold mb-6 uppercase tracking-tight">
                  Achievements
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {athlete.notable_achievements}
                </p>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Sponsors */}
            {athlete.sponsors && athlete.sponsors.length > 0 && (
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Sponsors
                </h3>
                <div className="space-y-2">
                  {athlete.sponsors.map((sponsor, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 bg-secondary rounded text-center font-medium text-sm"
                    >
                      {sponsor}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            {athlete.social_links && athlete.social_links.length > 0 && (
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">
                  Connect
                </h3>
                <div className="space-y-2">
                  {athlete.social_links.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        {getSocialIcon(link.platform)}
                        <span className="font-medium text-sm">
                          {link.label || link.platform}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {link.follower_count && (
                          <span className="text-xs text-muted-foreground font-mono">
                            {formatFollowerCount(link.follower_count)}
                          </span>
                        )}
                        <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            {(athlete.height_cm || athlete.weight_kg || athlete.stance) && (
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">
                  Stats
                </h3>
                <div className="space-y-3">
                  {athlete.height_cm && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Height
                      </span>
                      <span className="font-medium">
                        {athlete.height_cm} cm
                      </span>
                    </div>
                  )}
                  {athlete.weight_kg && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Weight
                      </span>
                      <span className="font-medium">
                        {athlete.weight_kg} kg
                      </span>
                    </div>
                  )}
                  {athlete.stance && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Stance
                      </span>
                      <span className="font-medium capitalize">
                        {athlete.stance}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
