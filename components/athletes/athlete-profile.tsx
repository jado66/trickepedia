"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  MapPin,
  Calendar,
  Trophy,
  Users,
  Globe,
  Instagram,
  Youtube,
  ExternalLink,
  Ruler,
  Weight,
  Star,
  Award,
  Twitter,
  Facebook,
  Twitch,
  MessageCircle,
  Hash,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Athlete, SocialMediaPlatform } from "@/lib/types/athlete";

interface AthleteProfileProps {
  athlete: Athlete;
}

const getSocialIcon = (platform: SocialMediaPlatform) => {
  const iconClass = "h-5 w-5";
  switch (platform) {
    case "instagram":
      return <Instagram className={`${iconClass} text-pink-600`} />;
    case "youtube":
      return <Youtube className={`${iconClass} text-red-600`} />;
    case "tiktok":
      return <Hash className={`${iconClass} text-black dark:text-white`} />;
    case "twitter":
      return <Twitter className={`${iconClass} text-blue-500`} />;
    case "facebook":
      return <Facebook className={`${iconClass} text-blue-600`} />;
    case "twitch":
      return <Twitch className={`${iconClass} text-purple-600`} />;
    case "discord":
      return <MessageCircle className={`${iconClass} text-indigo-600`} />;
    case "website":
      return <Globe className={`${iconClass} text-blue-600`} />;
    default:
      return <Globe className={`${iconClass} text-gray-600`} />;
  }
};

const getSocialLabel = (platform: SocialMediaPlatform) => {
  switch (platform) {
    case "instagram":
      return "Instagram";
    case "youtube":
      return "YouTube";
    case "tiktok":
      return "TikTok";
    case "twitter":
      return "Twitter/X";
    case "facebook":
      return "Facebook";
    case "twitch":
      return "Twitch";
    case "discord":
      return "Discord";
    case "website":
      return "Website";
    default:
      return "Link";
  }
};

export function AthleteProfile({ athlete }: AthleteProfileProps) {
  const [useImperial, setUseImperial] = useState(true);

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

  const cmToFeetInches = (cm: number) => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  };

  const kgToLbs = (kg: number) => {
    return Math.round(kg * 2.20462);
  };

  const formatHeight = (cm: number) => {
    return useImperial ? cmToFeetInches(cm) : `${cm} cm`;
  };

  const formatWeight = (kg: number) => {
    return useImperial ? `${kgToLbs(kg)} lbs` : `${kg} kg`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cover Image */}
      {athlete.cover_image_url && (
        <div className="relative h-64 md:h-80 mb-8 rounded-lg overflow-hidden">
          <Image
            src={athlete.cover_image_url || "/placeholder.svg"}
            alt={`${athlete.name} cover`}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Profile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="relative">
                  {athlete.profile_image_url ? (
                    <Image
                      src={athlete.profile_image_url || "/placeholder.svg"}
                      alt={athlete.name}
                      width={120}
                      height={120}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-30 h-30 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-4xl font-bold text-primary">
                        {athlete.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-balance">
                        {athlete.name}
                      </h1>
                    </div>
                    {athlete.sport_categories &&
                      athlete.sport_categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {athlete.sport_categories.map((category) => (
                            <Link
                              key={category.id}
                              href={`/${category.slug}`}
                              className="hover:opacity-80 transition-opacity"
                            >
                              <Badge variant="secondary" className="text-sm">
                                {category.name}
                              </Badge>
                            </Link>
                          ))}
                        </div>
                      )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {athlete.country && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {athlete.city ? `${athlete.city}, ` : ""}
                          {athlete.country}
                        </span>
                      </div>
                    )}

                    {athlete.date_of_birth && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {calculateAge(athlete.date_of_birth)} years old
                        </span>
                      </div>
                    )}

                    {athlete.years_experience && (
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        <span>{athlete.years_experience} years experience</span>
                      </div>
                    )}
                  </div>

                  {/* <AthleteInteractions athlete={athlete} /> */}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          {athlete.bio && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {athlete.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Signature Tricks */}
          {athlete.signature_tricks && athlete.signature_tricks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Signature Tricks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {athlete.signature_tricks.map((trick) => (
                    <Link
                      key={trick.id}
                      href={`/tricks/${trick.slug}`}
                      className="hover:opacity-80 transition-opacity"
                    >
                      <Badge variant="secondary" className="text-sm">
                        {trick.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Achievements */}
          {athlete.notable_achievements && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Notable Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {athlete.notable_achievements}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Stats</CardTitle>
              <ToggleGroup
                type="single"
                value={useImperial ? "imperial" : "metric"}
                onValueChange={(value) => {
                  if (value) setUseImperial(value === "imperial");
                }}
                className="h-8"
              >
                <ToggleGroupItem value="imperial" className="h-8 text-xs px-3">
                  Imperial
                </ToggleGroupItem>
                <ToggleGroupItem value="metric" className="h-8 text-xs px-3">
                  Metric
                </ToggleGroupItem>
              </ToggleGroup>
            </CardHeader>
            <CardContent className="space-y-4">
              {athlete.height_cm && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Height</span>
                  </div>
                  <span className="font-medium">
                    {formatHeight(athlete.height_cm)}
                  </span>
                </div>
              )}

              {athlete.weight_kg && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Weight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Weight</span>
                  </div>
                  <span className="font-medium">
                    {formatWeight(athlete.weight_kg)}
                  </span>
                </div>
              )}

              {athlete.stance && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Stance</span>
                  <span className="font-medium capitalize">
                    {athlete.stance}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sponsors */}
          {athlete.sponsors && athlete.sponsors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Sponsors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {athlete.sponsors.map((sponsor, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="w-full justify-center py-2"
                    >
                      {sponsor}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Social Links */}
          {athlete.social_links && athlete.social_links.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Connect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {athlete.social_links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors group"
                  >
                    {getSocialIcon(link.platform)}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-sm font-medium">
                        {link.label || getSocialLabel(link.platform)}
                      </span>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </a>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
