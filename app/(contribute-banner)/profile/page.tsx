"use client";

import { useState, useEffect } from "react";
import { XP_LEVELS, calculateXPProgress } from "@/lib/xp/levels";
import { MiniContributeCTA } from "@/components/xp";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Camera,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Shield,
  UserCheck,
  Trash,
  Plus,
  LinkIcon,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  Globe,
  Youtube,
  Twitch,
  ExternalLink,
  Trophy,
  Users,
  Star,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useUser } from "@/contexts/user-provider";

interface SocialLink {
  id?: string;
  platform: string;
  url: string;
  displayName: string;
  isPublic: boolean;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  bio: string;
  profileImageUrl: string;
  socialLinks: SocialLink[];
}

// Social platform options
const SOCIAL_PLATFORMS = [
  { id: "github", label: "GitHub", icon: <Github className="h-4 w-4" /> },
  { id: "twitter", label: "Twitter", icon: <Twitter className="h-4 w-4" /> },
  { id: "linkedin", label: "LinkedIn", icon: <Linkedin className="h-4 w-4" /> },
  {
    id: "instagram",
    label: "Instagram",
    icon: <Instagram className="h-4 w-4" />,
  },
  { id: "facebook", label: "Facebook", icon: <Facebook className="h-4 w-4" /> },
  { id: "youtube", label: "YouTube", icon: <Youtube className="h-4 w-4" /> },
  { id: "twitch", label: "Twitch", icon: <Twitch className="h-4 w-4" /> },
  { id: "website", label: "Website", icon: <Globe className="h-4 w-4" /> },
  { id: "other", label: "Other", icon: <LinkIcon className="h-4 w-4" /> },
];

// Get platform icon by id
const getPlatformIcon = (platformId: string) => {
  const platform = SOCIAL_PLATFORMS.find((p) => p.id === platformId);
  return platform?.icon || <LinkIcon className="h-4 w-4" />;
};

// Adapter to maintain legacy usage shape until fully refactored
const calculateLevel = (xp: number) => {
  const result = calculateXPProgress(xp);
  return {
    currentLevel: {
      level: result.currentLevel.level,
      minXP: result.currentLevel.nextLevelXP, // not strictly accurate but unused externally
      maxXP: result.nextLevel ? result.nextLevel.nextLevelXP - 1 : Infinity,
      name: result.currentLevel.name,
      color: result.currentLevel.color,
    },
    nextLevel: result.nextLevel && {
      level: result.nextLevel.level,
      minXP: result.nextLevel.nextLevelXP,
      maxXP: Infinity,
      name: result.nextLevel.name,
      color: result.nextLevel.color,
    },
    progress: result.progressPct,
    xpToNext: result.xpToNext,
  } as any;
};

export default function ProfilePage() {
  const {
    user,

    isLoading: authLoading,
    updateUser,
  } = useUser();

  // Initialize with current user data or defaults
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    bio: "",
    profileImageUrl: "",
    socialLinks: [],
  });

  // Load user data when available
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        dateOfBirth: user.date_of_birth || "",
        bio: user.bio || "",
        profileImageUrl: user.profile_image_url || "",
        socialLinks: [], // Will load from database if needed
      });
    }
  }, [user]);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const addSocialLink = () => {
    setProfileData((prev) => ({
      ...prev,
      socialLinks: [
        ...prev.socialLinks,
        { platform: "website", url: "", displayName: "", isPublic: true },
      ],
    }));
  };

  const updateSocialLink = (
    index: number,
    field: keyof SocialLink,
    value: any
  ) => {
    setProfileData((prev) => {
      const updatedLinks = [...prev.socialLinks];
      updatedLinks[index] = { ...updatedLinks[index], [field]: value };
      return { ...prev, socialLinks: updatedLinks };
    });
  };

  const removeSocialLink = (index: number) => {
    setProfileData((prev) => {
      const updatedLinks = [...prev.socialLinks];
      updatedLinks.splice(index, 1);
      return { ...prev, socialLinks: updatedLinks };
    });
  };

  const handleSave = async () => {
    console.log("Starting save process...");
    setIsSaving(true);
    setMessage(null);

    try {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      if (!updateUser) {
        throw new Error("Update function not available");
      }

      console.log("Updating profile with data:", {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone: profileData.phone,
        date_of_birth: profileData.dateOfBirth || undefined,
        bio: profileData.bio,
        profile_image_url: profileData.profileImageUrl,
      });

      // Update user profile using auth context method
      await updateUser({
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone: profileData.phone,
        date_of_birth: profileData.dateOfBirth || undefined,
        bio: profileData.bio,
        profile_image_url: profileData.profileImageUrl,
      });

      console.log("Profile updated successfully");
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: "Failed to update profile. Please try again.",
      });
    } finally {
      console.log("Finishing save process...");
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original data
    if (user) {
      setProfileData({
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        dateOfBirth: user.date_of_birth || "",
        bio: user.bio || "",
        profileImageUrl: user.profile_image_url || "",
        socialLinks: [], // Will load from database if needed
      });
    }
    setIsEditing(false);
    setMessage(null);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "moderator":
        return <UserCheck className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "moderator":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Loading State */}
        {authLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!authLoading && (
          <>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-balance mb-2">
                My Profile
              </h1>
              <p className="text-muted-foreground">
                Manage your account information and preferences
              </p>
            </div>

            {/* Success/Error Messages */}
            {message && (
              <Alert
                className={`mb-6 ${
                  message.type === "success"
                    ? "border-green-200 bg-green-50"
                    : ""
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription
                  className={message.type === "success" ? "text-green-800" : ""}
                >
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Overview Card */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader className="text-center">
                    <div className="relative mx-auto mb-4">
                      <Avatar className="h-24 w-24 mx-auto">
                        <AvatarImage
                          src={
                            profileData.profileImageUrl || "/placeholder.svg"
                          }
                          alt="Profile picture"
                        />
                        <AvatarFallback className="text-lg">
                          {profileData.firstName.charAt(0)}
                          {profileData.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <CardTitle className="text-xl">
                      {profileData.firstName} {profileData.lastName}
                    </CardTitle>
                    <CardDescription className="flex items-center justify-center gap-2">
                      {user && (
                        <Badge
                          variant={getRoleBadgeVariant(user.role)}
                          className="flex items-center gap-1"
                        >
                          {getRoleIcon(user.role)}
                          {user.role}
                        </Badge>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{profileData.email}</span>
                    </div>
                    {profileData.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{profileData.phone}</span>
                      </div>
                    )}
                    {profileData.dateOfBirth && (
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {new Date(
                            profileData.dateOfBirth
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {/* Social Links */}
                    {profileData.socialLinks &&
                      profileData.socialLinks.length > 0 && (
                        <>
                          <Separator className="my-2" />
                          <div className="flex flex-wrap gap-2 justify-center">
                            {profileData.socialLinks
                              .filter((link) => link.isPublic)
                              .map((link, index) => (
                                <TooltipProvider key={index}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                      >
                                        {getPlatformIcon(link.platform)}
                                      </a>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>
                                        {link.displayName ||
                                          SOCIAL_PLATFORMS.find(
                                            (p) => p.id === link.platform
                                          )?.label}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ))}
                          </div>
                        </>
                      )}
                  </CardContent>
                </Card>

                {/* XP and Referrals Card */}
                <div className="mt-6">
                  <MiniContributeCTA variant="profile" />
                </div>
              </div>

              {/* Profile Details Card */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>
                        Update your personal details and preferences
                      </CardDescription>
                    </div>
                    {!isEditing && (
                      <Button onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={profileData.firstName}
                            onChange={(e) =>
                              handleInputChange("firstName", e.target.value)
                            }
                            disabled={!isEditing}
                            placeholder="Enter your first name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={profileData.lastName}
                            onChange={(e) =>
                              handleInputChange("lastName", e.target.value)
                            }
                            disabled={!isEditing}
                            placeholder="Enter your last name"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          disabled
                          placeholder="Enter your email address"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                            disabled={!isEditing}
                            placeholder="Enter your phone number"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dateOfBirth">Date of Birth</Label>
                          <Input
                            id="dateOfBirth"
                            type="date"
                            value={profileData.dateOfBirth}
                            onChange={(e) =>
                              handleInputChange("dateOfBirth", e.target.value)
                            }
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Bio Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">About</h3>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={profileData.bio}
                          onChange={(e) =>
                            handleInputChange("bio", e.target.value)
                          }
                          disabled={!isEditing}
                          placeholder="Tell us about yourself..."
                          rows={4}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Social Links Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Social Links</h3>
                        {isEditing && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={addSocialLink}
                            className="flex items-center gap-1 bg-transparent"
                          >
                            <Plus className="h-4 w-4" />
                            Add Link
                          </Button>
                        )}
                      </div>

                      {profileData.socialLinks.length === 0 ? (
                        <div className="text-muted-foreground text-sm italic">
                          No social links added yet.
                          {isEditing &&
                            " Click 'Add Link' to add your first social media link."}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {profileData.socialLinks.map((link, index) => (
                            <div
                              key={index}
                              className="grid grid-cols-12 gap-2 items-start p-3 rounded-md border"
                            >
                              <div className="col-span-12 md:col-span-3">
                                <Label className="mb-1 block text-xs">
                                  Platform
                                </Label>
                                {isEditing ? (
                                  <Select
                                    value={link.platform}
                                    onValueChange={(value) =>
                                      updateSocialLink(index, "platform", value)
                                    }
                                    disabled={!isEditing}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select platform" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {SOCIAL_PLATFORMS.map((platform) => (
                                        <SelectItem
                                          key={platform.id}
                                          value={platform.id}
                                        >
                                          <div className="flex items-center gap-2">
                                            {platform.icon}
                                            <span>{platform.label}</span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <div className="flex items-center gap-2 text-sm py-2">
                                    {getPlatformIcon(link.platform)}
                                    <span>
                                      {SOCIAL_PLATFORMS.find(
                                        (p) => p.id === link.platform
                                      )?.label || "Other"}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="col-span-12 md:col-span-4">
                                <Label className="mb-1 block text-xs">
                                  URL
                                </Label>
                                {isEditing ? (
                                  <Input
                                    value={link.url}
                                    onChange={(e) =>
                                      updateSocialLink(
                                        index,
                                        "url",
                                        e.target.value
                                      )
                                    }
                                    disabled={!isEditing}
                                    placeholder="https://..."
                                  />
                                ) : (
                                  <div className="flex items-center gap-2 text-sm py-2 truncate">
                                    <a
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary flex items-center hover:underline truncate"
                                    >
                                      <span className="truncate">
                                        {link.url}
                                      </span>
                                      <ExternalLink className="h-3 w-3 ml-1 inline-block flex-shrink-0" />
                                    </a>
                                  </div>
                                )}
                              </div>
                              <div className="col-span-12 md:col-span-3">
                                <Label className="mb-1 block text-xs">
                                  Display Name
                                </Label>
                                {isEditing ? (
                                  <Input
                                    value={link.displayName}
                                    onChange={(e) =>
                                      updateSocialLink(
                                        index,
                                        "displayName",
                                        e.target.value
                                      )
                                    }
                                    disabled={!isEditing}
                                    placeholder="My GitHub"
                                  />
                                ) : (
                                  <div className="text-sm py-2">
                                    {link.displayName || "-"}
                                  </div>
                                )}
                              </div>
                              <div className="col-span-12 md:col-span-2">
                                <div className="flex justify-between items-center h-full">
                                  {isEditing ? (
                                    <>
                                      <div className="flex items-center space-x-2 mt-6">
                                        <Label
                                          className="text-xs"
                                          htmlFor={`public-${index}`}
                                        >
                                          Public
                                        </Label>
                                        <input
                                          type="checkbox"
                                          id={`public-${index}`}
                                          checked={link.isPublic}
                                          onChange={(e) =>
                                            updateSocialLink(
                                              index,
                                              "isPublic",
                                              e.target.checked
                                            )
                                          }
                                          className="h-4 w-4"
                                        />
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive mt-5"
                                        onClick={() => removeSocialLink(index)}
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </>
                                  ) : (
                                    <Badge
                                      variant={
                                        link.isPublic ? "secondary" : "outline"
                                      }
                                    >
                                      {link.isPublic ? "Public" : "Private"}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {isEditing && (
                      <div className="flex gap-4 pt-4">
                        <Button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={handleCancel}
                          disabled={isSaving}
                          className="flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
