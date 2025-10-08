"use client";

import type React from "react";

import { useState, useEffect, useMemo } from "react";
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
  Check,
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
import {
  Athlete,
  AthleteStatus,
  SocialLink,
  SocialMediaPlatform,
} from "@/lib/types/athlete";
import { supabase } from "@/utils/supabase/client";
import { TrickSearch } from "@/components/trick-search";
import { useUser } from "@/contexts/user-provider";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Countries with their flags and codes
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
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "LR", name: "Liberia", flag: "🇱🇷" },
  { code: "MM", name: "Myanmar", flag: "🇲🇲" },
].sort((a, b) => a.name.localeCompare(b.name));

// Countries that use imperial units
const IMPERIAL_COUNTRIES = ["US", "LR", "MM"];

// Social media platforms with their icons
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

const getSocialLabel = (platform: SocialMediaPlatform) => {
  const platformData = SOCIAL_PLATFORMS.find((p) => p.value === platform);
  return platformData?.label || platform;
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

  // Form state
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

  // Parse social links - handle both correct format and malformed string format
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(() => {
    if (!athlete?.social_links) return [];

    // If it's already an array of objects, use it
    if (
      Array.isArray(athlete.social_links) &&
      athlete.social_links.length > 0 &&
      typeof athlete.social_links[0] === "object"
    ) {
      return athlete.social_links;
    }

    // If it's an array of stringified JSON (malformed data), try to parse
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

  const [newSponsor, setNewSponsor] = useState("");
  const [newSocialPlatform, setNewSocialPlatform] =
    useState<SocialMediaPlatform>("instagram");
  const [newSocialUrl, setNewSocialUrl] = useState("");
  const [newSocialLabel, setNewSocialLabel] = useState("");

  // Determine if we should use imperial units
  const useImperial = useMemo(() => {
    const countryCode = COUNTRIES.find(
      (c) => c.name === formData.country
    )?.code;
    return countryCode ? IMPERIAL_COUNTRIES.includes(countryCode) : false;
  }, [formData.country]);

  // Convert between metric and imperial
  const cmToFeetInches = (cm: number) => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { feet, inches };
  };

  const feetInchesToCm = (feet: number, inches: number) => {
    return Math.round((feet * 12 + inches) * 2.54);
  };

  const kgToLbs = (kg: number) => {
    return Math.round(kg * 2.20462);
  };

  const lbsToKg = (lbs: number) => {
    return Math.round(lbs / 2.20462);
  };

  // Display values
  const [displayHeight, setDisplayHeight] = useState({ feet: 0, inches: 0 });
  const [displayWeight, setDisplayWeight] = useState("");

  // Debug: Log social links on mount to verify parsing
  useEffect(() => {
    if (athlete) {
      console.log("Raw athlete.social_links:", athlete.social_links);
      console.log("Parsed socialLinks state:", socialLinks);
      console.log("Social links type check:", {
        isArray: Array.isArray(athlete.social_links),
        firstItemType: athlete.social_links?.[0]
          ? typeof athlete.social_links[0]
          : "none",
        firstItem: athlete.social_links?.[0],
      });
    }
  }, []);

  useEffect(() => {
    if (formData.height_cm) {
      const cm = parseInt(formData.height_cm);
      if (useImperial && cm) {
        setDisplayHeight(cmToFeetInches(cm));
      }
    }
  }, [formData.height_cm, useImperial]);

  useEffect(() => {
    if (formData.weight_kg) {
      const kg = parseInt(formData.weight_kg);
      if (useImperial && kg) {
        setDisplayWeight(kgToLbs(kg).toString());
      } else {
        setDisplayWeight(formData.weight_kg);
      }
    }
  }, [formData.weight_kg, useImperial]);

  // Load trick details for selected tricks
  useEffect(() => {
    const loadTricks = async () => {
      if (selectedTricks.size === 0) {
        setLoadedTricks([]);
        return;
      }

      const { data } = await supabase
        .from("tricks")
        .select("id, name, slug")
        .in("id", Array.from(selectedTricks));

      if (data) {
        setLoadedTricks(data);
      }
    };

    loadTricks();
  }, [selectedTricks]);

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

  const handleToggleTrick = (trickId: string) => {
    setSelectedTricks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(trickId)) {
        newSet.delete(trickId);
      } else {
        newSet.add(trickId);
      }
      return newSet;
    });
  };

  const removeTrick = (trickId: string) => {
    setSelectedTricks((prev) => {
      const newSet = new Set(prev);
      newSet.delete(trickId);
      return newSet;
    });
  };

  const handleToggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const removeCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      newSet.delete(categoryId);
      return newSet;
    });
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
    };

    setSocialLinks((prev) => [...prev, newLink]);
    setNewSocialUrl("");
    setNewSocialLabel("");
    setNewSocialPlatform("instagram");
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
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
      };

      let result;
      if (athlete) {
        // Update existing athlete
        result = await supabase
          .from("athletes")
          .update(athleteData)
          .eq("id", athlete.id)
          .select()
          .single();
      } else {
        // Create new athlete
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
              <Label>Sport Categories</Label>
              <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={categoryOpen}
                    className="w-full justify-between"
                  >
                    {selectedCategories.size > 0
                      ? `${selectedCategories.size} selected`
                      : "Select categories..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search categories..." />
                    <CommandList>
                      <CommandEmpty>No category found.</CommandEmpty>
                      <CommandGroup>
                        {userCategories.map((category) => (
                          <CommandItem
                            key={category.id}
                            value={category.id}
                            onSelect={() => handleToggleCategory(category.id)}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                selectedCategories.has(category.id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                            {category.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {selectedCategories.size > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {Array.from(selectedCategories).map((categoryId) => {
                    const category = userCategories.find(
                      (c) => c.id === categoryId
                    );
                    return category ? (
                      <Badge
                        key={categoryId}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {category.name}
                        <button
                          type="button"
                          onClick={() => removeCategory(categoryId)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="years_experience">Years of Experience</Label>
              <Input
                id="years_experience"
                type="number"
                min="0"
                max="50"
                value={formData.years_experience}
                onChange={(e) =>
                  handleInputChange("years_experience", e.target.value)
                }
                placeholder="Years"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Details */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Country</Label>
              <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={countryOpen}
                    className="w-full justify-between"
                  >
                    {formData.country ? (
                      <span className="flex items-center gap-2">
                        <span>
                          {
                            COUNTRIES.find((c) => c.name === formData.country)
                              ?.flag
                          }
                        </span>
                        {formData.country}
                      </span>
                    ) : (
                      "Select country..."
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search country..." />
                    <CommandList>
                      <CommandEmpty>No country found.</CommandEmpty>
                      <CommandGroup>
                        {COUNTRIES.map((country) => (
                          <CommandItem
                            key={country.code}
                            value={country.name}
                            onSelect={() => {
                              handleInputChange("country", country.name);
                              setCountryOpen(false);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                formData.country === country.name
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                            <span className="mr-2">{country.flag}</span>
                            {country.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="City"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) =>
                  handleInputChange("date_of_birth", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">
                Height {useImperial ? "(ft/in)" : "(cm)"}
              </Label>
              {useImperial ? (
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="3"
                    max="8"
                    placeholder="Feet"
                    value={displayHeight.feet || ""}
                    onChange={(e) => {
                      const feet = parseInt(e.target.value) || 0;
                      setDisplayHeight((prev) => ({ ...prev, feet }));
                      const cm = feetInchesToCm(feet, displayHeight.inches);
                      handleInputChange("height_cm", cm.toString());
                    }}
                  />
                  <Input
                    type="number"
                    min="0"
                    max="11"
                    placeholder="Inches"
                    value={displayHeight.inches || ""}
                    onChange={(e) => {
                      const inches = parseInt(e.target.value) || 0;
                      setDisplayHeight((prev) => ({ ...prev, inches }));
                      const cm = feetInchesToCm(displayHeight.feet, inches);
                      handleInputChange("height_cm", cm.toString());
                    }}
                  />
                </div>
              ) : (
                <Input
                  id="height_cm"
                  type="number"
                  min="100"
                  max="250"
                  value={formData.height_cm}
                  onChange={(e) =>
                    handleInputChange("height_cm", e.target.value)
                  }
                  placeholder="Height in cm"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">
                Weight {useImperial ? "(lbs)" : "(kg)"}
              </Label>
              <Input
                id="weight"
                type="number"
                min={useImperial ? "66" : "30"}
                max={useImperial ? "440" : "200"}
                value={displayWeight}
                onChange={(e) => {
                  const value = e.target.value;
                  setDisplayWeight(value);
                  if (useImperial) {
                    const kg = lbsToKg(parseInt(value) || 0);
                    handleInputChange("weight_kg", kg.toString());
                  } else {
                    handleInputChange("weight_kg", value);
                  }
                }}
                placeholder={useImperial ? "Weight in lbs" : "Weight in kg"}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stance">Stance (for board sports)</Label>
            <Select
              value={formData.stance}
              onValueChange={(value) => handleInputChange("stance", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select stance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not-applicable">Not applicable</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="goofy">Goofy</SelectItem>
                <SelectItem value="switch">Switch</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
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

      {/* Signature Tricks */}
      <Card>
        <CardHeader>
          <CardTitle>Signature Tricks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TrickSearch
            mode="select"
            selectedTricks={selectedTricks}
            onToggleTrick={handleToggleTrick}
          />

          {loadedTricks.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {loadedTricks.map((trick) => (
                <Badge
                  key={trick.id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {trick.name}
                  <button
                    type="button"
                    onClick={() => removeTrick(trick.id)}
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

      {/* Sponsors */}
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

      {/* Social Media Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Select
                value={newSocialPlatform}
                onValueChange={(value) =>
                  setNewSocialPlatform(value as SocialMediaPlatform)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
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
                placeholder={
                  SOCIAL_PLATFORMS.find((p) => p.value === newSocialPlatform)
                    ?.placeholder || "https://..."
                }
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addSocialLink())
                }
              />

              {(newSocialPlatform === "other" ||
                socialLinks.filter((l) => l.platform === newSocialPlatform)
                  .length > 0) && (
                <Input
                  value={newSocialLabel}
                  onChange={(e) => setNewSocialLabel(e.target.value)}
                  placeholder="Label (optional)"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addSocialLink())
                  }
                />
              )}
            </div>

            <Button
              type="button"
              onClick={addSocialLink}
              variant="outline"
              className="w-full"
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
                  className="flex items-center gap-2 p-2 rounded-md border bg-muted/50"
                >
                  <div className="flex items-center gap-2 flex-1">
                    {getSocialIcon(link.platform)}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {getSocialLabel(link.platform)}
                        </span>
                        {link.label && (
                          <Badge variant="outline" className="text-xs">
                            {link.label}
                          </Badge>
                        )}
                      </div>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:underline truncate"
                      >
                        {link.url}
                      </a>
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

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Notable Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notable_achievements">Achievements</Label>
            <Textarea
              id="notable_achievements"
              value={formData.notable_achievements}
              onChange={(e) =>
                handleInputChange("notable_achievements", e.target.value)
              }
              placeholder="List major competitions, awards, or notable accomplishments..."
              rows={4}
            />
          </div>
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
