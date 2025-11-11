"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Plus,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Twitch,
  Globe,
  MessageCircle,
  Hash,
} from "lucide-react";
import { toast } from "sonner";
import type {
  Athlete,
  AthleteStatus,
  SocialLink,
  SocialMediaPlatform,
  TimelineSection,
  VideoEmbed,
  PrimaryCTA,
} from "@/lib/types/athlete";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@/contexts/user-provider";

const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
].sort((a, b) => a.name.localeCompare(b.name));

const IMPERIAL_COUNTRIES = ["US", "LR", "MM"];

const SOCIAL_PLATFORMS: Array<{
  value: SocialMediaPlatform;
  label: string;
  icon: React.ReactNode;
  placeholder: string;
}> = [
  {
    value: "instagram",
    label: "Instagram",
    icon: <Instagram className="h-4 w-4" />,
    placeholder: "https://instagram.com/username",
  },
  {
    value: "youtube",
    label: "YouTube",
    icon: <Youtube className="h-4 w-4" />,
    placeholder: "https://youtube.com/@channel",
  },
  {
    value: "tiktok",
    label: "TikTok",
    icon: <Hash className="h-4 w-4" />,
    placeholder: "https://tiktok.com/@username",
  },
  {
    value: "twitter",
    label: "Twitter/X",
    icon: <Twitter className="h-4 w-4" />,
    placeholder: "https://twitter.com/username",
  },
  {
    value: "facebook",
    label: "Facebook",
    icon: <Facebook className="h-4 w-4" />,
    placeholder: "https://facebook.com/page",
  },
  {
    value: "twitch",
    label: "Twitch",
    icon: <Twitch className="h-4 w-4" />,
    placeholder: "https://twitch.tv/channel",
  },
  {
    value: "discord",
    label: "Discord",
    icon: <MessageCircle className="h-4 w-4" />,
    placeholder: "https://discord.gg/invite",
  },
  {
    value: "website",
    label: "Website",
    icon: <Globe className="h-4 w-4" />,
    placeholder: "https://example.com",
  },
  {
    value: "other",
    label: "Other",
    icon: <Globe className="h-4 w-4" />,
    placeholder: "https://...",
  },
];

const getSocialIcon = (platform: SocialMediaPlatform) => {
  const platformData = SOCIAL_PLATFORMS.find((p) => p.value === platform);
  return platformData?.icon || <Globe className="h-4 w-4" />;
};

interface AthleteFormProps {
  athlete?: Athlete;
}

export function AthleteForm({ athlete }: AthleteFormProps) {
  const router = useRouter();
  const { userCategories } = useUser();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: athlete?.name || "",
    bio: athlete?.bio || "",
    status: athlete?.status || ("active" as AthleteStatus),
    years_experience: athlete?.years_experience?.toString() || "",
    country: athlete?.country || "",
    city: athlete?.city || "",
    date_of_birth: athlete?.date_of_birth || "",
    height_cm: athlete?.height_cm?.toString() || "",
    weight_kg: athlete?.weight_kg?.toString() || "",
    stance: athlete?.stance || "",
    profile_image_url: athlete?.profile_image_url || "",
    cover_image_url: athlete?.cover_image_url || "",
    notable_achievements: athlete?.notable_achievements || "",
  });

  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(athlete?.sport_category_ids || [])
  );
  const [selectedTricks, setSelectedTricks] = useState<Set<string>>(
    new Set(athlete?.signature_trick_ids || [])
  );
  const [loadedTricks, setLoadedTricks] = useState<
    Array<{ id: string; name: string; slug: string }>
  >(athlete?.signature_tricks || []);
  const [sponsors, setSponsors] = useState<string[]>(athlete?.sponsors || []);

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(() => {
    if (!athlete?.social_links) return [];
    if (
      Array.isArray(athlete.social_links) &&
      athlete.social_links.length > 0 &&
      typeof athlete.social_links[0] === "object"
    ) {
      return athlete.social_links;
    }
    if (
      Array.isArray(athlete.social_links) &&
      athlete.social_links.length > 0 &&
      typeof athlete.social_links[0] === "string"
    ) {
      try {
        return athlete.social_links.map((item: any) => {
          if (typeof item === "string") {
            return JSON.parse(item);
          }
          return item;
        });
      } catch (e) {
        console.error("Failed to parse social links:", e);
        return [];
      }
    }
    return [];
  });

  const [timelineSections, setTimelineSections] = useState<TimelineSection[]>(
    athlete?.timeline_sections || []
  );
  const [videoEmbeds, setVideoEmbeds] = useState<VideoEmbed[]>(
    athlete?.video_embeds || []
  );
  const [primaryCTA, setPrimaryCTA] = useState<PrimaryCTA | null>(
    athlete?.primary_cta || null
  );

  const [newSponsor, setNewSponsor] = useState("");
  const [newSocialPlatform, setNewSocialPlatform] =
    useState<SocialMediaPlatform>("instagram");
  const [newSocialUrl, setNewSocialUrl] = useState("");
  const [newSocialLabel, setNewSocialLabel] = useState("");
  const [newSocialFollowers, setNewSocialFollowers] = useState("");

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSponsor = () => {
    if (newSponsor.trim() && !sponsors.includes(newSponsor.trim())) {
      setSponsors((prev) => [...prev, newSponsor.trim()]);
      setNewSponsor("");
    }
  };

  const removeSponsor = (index: number) => {
    setSponsors((prev) => prev.filter((_, i) => i !== index));
  };

  const addSocialLink = () => {
    if (!newSocialUrl.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    const newLink: SocialLink = {
      platform: newSocialPlatform,
      url: newSocialUrl.trim(),
      label: newSocialLabel.trim() || undefined,
      follower_count: newSocialFollowers
        ? Number.parseInt(newSocialFollowers)
        : undefined,
    };

    setSocialLinks((prev) => [...prev, newLink]);
    setNewSocialUrl("");
    setNewSocialLabel("");
    setNewSocialFollowers("");
    setNewSocialPlatform("instagram");
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const addTimelineSection = () => {
    const newSection: TimelineSection = {
      id: crypto.randomUUID(),
      title: "",
      content: "",
      order: timelineSections.length,
    };
    setTimelineSections((prev) => [...prev, newSection]);
  };

  const updateTimelineSection = (
    id: string,
    field: keyof TimelineSection,
    value: string | number
  ) => {
    setTimelineSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, [field]: value } : section
      )
    );
  };

  const removeTimelineSection = (id: string) => {
    setTimelineSections((prev) => prev.filter((s) => s.id !== id));
  };

  const addVideoEmbed = () => {
    const newVideo: VideoEmbed = {
      id: crypto.randomUUID(),
      platform: "youtube",
      url: "",
    };
    setVideoEmbeds((prev) => [...prev, newVideo]);
  };

  const updateVideoEmbed = (
    id: string,
    field: keyof VideoEmbed,
    value: string
  ) => {
    setVideoEmbeds((prev) =>
      prev.map((video) =>
        video.id === id ? { ...video, [field]: value } : video
      )
    );
  };

  const removeVideoEmbed = (id: string) => {
    setVideoEmbeds((prev) => prev.filter((v) => v.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const slug = generateSlug(formData.name);

      const athleteData = {
        name: formData.name.trim(),
        slug,
        bio: formData.bio.trim() || null,
        sport_category_ids:
          selectedCategories.size > 0 ? Array.from(selectedCategories) : null,
        status: formData.status,
        years_experience: formData.years_experience
          ? Number.parseInt(formData.years_experience)
          : null,
        country: formData.country.trim() || null,
        city: formData.city.trim() || null,
        date_of_birth: formData.date_of_birth || null,
        height_cm: formData.height_cm
          ? Number.parseInt(formData.height_cm)
          : null,
        weight_kg: formData.weight_kg
          ? Number.parseInt(formData.weight_kg)
          : null,
        stance: formData.stance.trim() || null,
        profile_image_url: formData.profile_image_url.trim() || null,
        cover_image_url: formData.cover_image_url.trim() || null,
        notable_achievements: formData.notable_achievements.trim() || null,
        signature_trick_ids:
          selectedTricks.size > 0 ? Array.from(selectedTricks) : null,
        sponsors: sponsors.length > 0 ? sponsors : null,
        social_links: socialLinks.length > 0 ? socialLinks : null,
        timeline_sections:
          timelineSections.length > 0 ? timelineSections : null,
        video_embeds:
          videoEmbeds.filter((v) => v.url).length > 0
            ? videoEmbeds.filter((v) => v.url)
            : null,
        primary_cta: primaryCTA?.text && primaryCTA?.url ? primaryCTA : null,
      };

      let result;
      if (athlete) {
        result = await supabase
          .from("athletes")
          .update(athleteData)
          .eq("id", athlete.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from("athletes")
          .insert(athleteData)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      toast.success(
        athlete
          ? "Athlete updated successfully!"
          : "Athlete created successfully!"
      );
      router.push(`/athletes/${slug}`);
    } catch (error: any) {
      console.error("Error saving athlete:", error);
      if (error.code === "23505") {
        toast.error("An athlete with this name already exists");
      } else {
        toast.error("Failed to save athlete. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter athlete name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active / Competing</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                  <SelectItem value="injured">Injured</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Tell us about this athlete..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Primary Call-to-Action</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cta_text">Button Text</Label>
              <Input
                id="cta_text"
                value={primaryCTA?.text || ""}
                onChange={(e) =>
                  setPrimaryCTA((prev) => ({
                    ...prev,
                    text: e.target.value,
                    url: prev?.url || "",
                  }))
                }
                placeholder="Follow on Instagram"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cta_url">Button URL</Label>
              <Input
                id="cta_url"
                type="url"
                value={primaryCTA?.url || ""}
                onChange={(e) =>
                  setPrimaryCTA((prev) => ({
                    ...prev,
                    url: e.target.value,
                    text: prev?.text || "",
                  }))
                }
                placeholder="https://instagram.com/username"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images - keeping existing */}
      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile_image_url">Profile Image URL</Label>
            <Input
              id="profile_image_url"
              type="url"
              value={formData.profile_image_url}
              onChange={(e) =>
                handleInputChange("profile_image_url", e.target.value)
              }
              placeholder="https://example.com/profile.jpg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cover_image_url">Cover Image URL</Label>
            <Input
              id="cover_image_url"
              type="url"
              value={formData.cover_image_url}
              onChange={(e) =>
                handleInputChange("cover_image_url", e.target.value)
              }
              placeholder="https://example.com/cover.jpg"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Video Embeds</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {videoEmbeds.map((video) => (
            <div key={video.id} className="p-4 border rounded-lg space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Select
                  value={video.platform}
                  onValueChange={(value) =>
                    updateVideoEmbed(video.id, "platform", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={video.url}
                  onChange={(e) =>
                    updateVideoEmbed(video.id, "url", e.target.value)
                  }
                  placeholder={
                    video.platform === "youtube"
                      ? "https://youtube.com/watch?v=..."
                      : "https://instagram.com/p/..."
                  }
                  className="md:col-span-2"
                />
              </div>
              <div className="flex gap-2">
                <Input
                  value={video.title || ""}
                  onChange={(e) =>
                    updateVideoEmbed(video.id, "title", e.target.value)
                  }
                  placeholder="Video title (optional)"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVideoEmbed(video.id)}
                  className="hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            onClick={addVideoEmbed}
            variant="outline"
            className="w-full bg-transparent"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Video Embed
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline / Career History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {timelineSections.map((section, index) => (
            <div key={section.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Section {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTimelineSection(section.id)}
                  className="hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  value={section.title}
                  onChange={(e) =>
                    updateTimelineSection(section.id, "title", e.target.value)
                  }
                  placeholder="Section title (e.g., Early Life, Career)"
                  className="md:col-span-2"
                />
                <Input
                  value={section.year || section.date_range || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.includes("-")) {
                      updateTimelineSection(section.id, "date_range", value);
                    } else {
                      updateTimelineSection(section.id, "year", value);
                    }
                  }}
                  placeholder="Year or range (e.g., 2020 or 2018-2022)"
                />
              </div>
              <Textarea
                value={section.content}
                onChange={(e) =>
                  updateTimelineSection(section.id, "content", e.target.value)
                }
                placeholder="Describe this period in the athlete's career..."
                rows={3}
              />
            </div>
          ))}
          <Button
            type="button"
            onClick={addTimelineSection}
            variant="outline"
            className="w-full bg-transparent"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Timeline Section
          </Button>
        </CardContent>
      </Card>

      {/* Social Media Links - updated with follower count */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Select
                value={newSocialPlatform}
                onValueChange={(value) =>
                  setNewSocialPlatform(value as SocialMediaPlatform)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  {SOCIAL_PLATFORMS.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>
                      <div className="flex items-center gap-2">
                        {platform.icon}
                        <span>{platform.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={newSocialUrl}
                onChange={(e) => setNewSocialUrl(e.target.value)}
                placeholder="URL"
                className="md:col-span-2"
              />
              <Input
                type="number"
                value={newSocialFollowers}
                onChange={(e) => setNewSocialFollowers(e.target.value)}
                placeholder="Followers (optional)"
              />
            </div>
            <Input
              value={newSocialLabel}
              onChange={(e) => setNewSocialLabel(e.target.value)}
              placeholder="Custom label (optional)"
            />
            <Button
              type="button"
              onClick={addSocialLink}
              variant="outline"
              className="w-full bg-transparent"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Social Link
            </Button>
          </div>

          {socialLinks.length > 0 && (
            <div className="space-y-2">
              {socialLinks.map((link, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 rounded-md border"
                >
                  <div className="flex items-center gap-2 flex-1">
                    {getSocialIcon(link.platform)}
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-sm font-medium truncate">
                        {link.label || link.platform}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {link.url}
                      </span>
                      {link.follower_count && (
                        <span className="text-xs text-muted-foreground">
                          {link.follower_count.toLocaleString()} followers
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSocialLink(index)}
                    className="hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sponsors - keeping existing */}
      <Card>
        <CardHeader>
          <CardTitle>Sponsors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newSponsor}
              onChange={(e) => setNewSponsor(e.target.value)}
              placeholder="Add a sponsor"
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addSponsor())
              }
            />
            <Button type="button" onClick={addSponsor} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {sponsors.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {sponsors.map((sponsor, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  {sponsor}
                  <button
                    type="button"
                    onClick={() => removeSponsor(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements - keeping existing */}
      <Card>
        <CardHeader>
          <CardTitle>Notable Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="notable_achievements"
            value={formData.notable_achievements}
            onChange={(e) =>
              handleInputChange("notable_achievements", e.target.value)
            }
            placeholder="List major competitions, awards, or notable accomplishments..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting
            ? "Saving..."
            : athlete
            ? "Update Athlete"
            : "Create Athlete"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
