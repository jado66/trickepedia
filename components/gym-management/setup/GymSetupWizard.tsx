"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Building2,
  Palette,
  LayoutGrid,
  Settings,
  Dumbbell,
  Users,
  Calendar,
  Shield,
  DollarSign,
  Activity,
  ClipboardList,
  Wrench,
  AlertTriangle,
  FileText,
  Package,
  Mountain,
  Waves,
  Zap,
  TreePine,
  Target,
  Crown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGymSetup } from "@/contexts/gym/gym-setup-provider";
import { useTheme } from "next-themes";

const facilityTypes = [
  {
    id: "traditional-gym",
    name: "Traditional Gym",
    description:
      "Full-service fitness facility with weights, cardio, and group classes",
    icon: Dumbbell,
    gradient: "from-blue-500 to-cyan-500",
    apps: [
      "members",
      "classes",
      "staff",
      "equipment",
      "payments",
      "checkin",
      "waivers",
      "incidents",
      "analytics",
      "store",
    ],
  },
  {
    id: "gymnastics",
    name: "Gymnastics Gym",
    description:
      "Specialized gymnastics training facility with competitive programs",
    icon: Crown,
    gradient: "from-purple-500 to-pink-500",
    apps: [
      "members",
      "classes",
      "staff",
      "equipment",
      "payments",
      "checkin",
      "waivers",
      "incidents",
      "analytics",
    ],
  },
  {
    id: "martial-arts",
    name: "Martial Arts Dojo",
    description: "Traditional or modern martial arts training facility",
    icon: Target,
    gradient: "from-red-500 to-orange-500",
    apps: [
      "members",
      "classes",
      "staff",
      "payments",
      "checkin",
      "waivers",
      "incidents",
      "analytics",
      "store",
    ],
  },
  {
    id: "climbing-gym",
    name: "Climbing Gym",
    description: "Indoor rock climbing and bouldering facility",
    icon: Mountain,
    gradient: "from-green-500 to-emerald-500",
    apps: [
      "members",
      "staff",
      "equipment",
      "payments",
      "checkin",
      "waivers",
      "incidents",
      "analytics",
      "store",
    ],
  },
  {
    id: "aquatic-center",
    name: "Aquatic Center",
    description: "Swimming and water-based fitness programs",
    icon: Waves,
    gradient: "from-cyan-500 to-blue-500",
    apps: [
      "members",
      "classes",
      "staff",
      "payments",
      "checkin",
      "waivers",
      "incidents",
      "analytics",
    ],
  },
  {
    id: "crossfit-box",
    name: "CrossFit Box",
    description: "High-intensity functional fitness training facility",
    icon: Zap,
    gradient: "from-orange-500 to-red-500",
    apps: [
      "members",
      "classes",
      "staff",
      "equipment",
      "payments",
      "checkin",
      "waivers",
      "incidents",
      "analytics",
      "store",
    ],
  },
  {
    id: "outdoor-adventure",
    name: "Outdoor Adventure",
    description: "Outdoor recreation and adventure sports facility",
    icon: TreePine,
    gradient: "from-emerald-500 to-green-600",
    apps: [
      "members",
      "staff",
      "equipment",
      "payments",
      "checkin",
      "waivers",
      "incidents",
      "analytics",
      "store",
    ],
  },
];

const availableApps = [
  {
    id: "members",
    name: "Member Management",
    description: "Track member profiles, memberships, and contact information",
    icon: Users,
    essential: true,
  },
  {
    id: "classes",
    name: "Class Management",
    description: "Manage class schedules, instructors, and enrollment",
    icon: Calendar,
    essential: false,
  },
  {
    id: "staff",
    name: "Staff Management",
    description: "Handle staff scheduling, payroll, and certifications",
    icon: Shield,
    essential: true,
  },
  {
    id: "equipment",
    name: "Equipment Tracking",
    description: "Monitor equipment maintenance, usage, and inventory",
    icon: Wrench,
    essential: false,
  },
  {
    id: "payments",
    name: "Payment Processing",
    description: "Process membership fees, class payments, and transactions",
    icon: DollarSign,
    essential: true,
  },
  {
    id: "checkin",
    name: "Check-in System",
    description: "Digital check-in for members and class attendance",
    icon: Activity,
    essential: false,
  },
  {
    id: "waivers",
    name: "Waiver Management",
    description: "Digital waivers and liability documentation",
    icon: FileText,
    essential: true,
  },
  {
    id: "incidents",
    name: "Incident Reporting",
    description: "Track and manage safety incidents and injuries",
    icon: AlertTriangle,
    essential: true,
  },
  {
    id: "analytics",
    name: "Analytics Dashboard",
    description: "Business insights, reports, and performance metrics",
    icon: ClipboardList,
    essential: false,
  },
  {
    id: "store",
    name: "Retail Management",
    description: "Inventory and sales for merchandise and equipment",
    icon: Package,
    essential: false,
  },
];

const themes = [
  {
    id: "iron-forge",
    name: "Iron Forge",
    description: "Dark industrial aesthetic",
    colors: ["#1a0f0a", "#a54a28", "#b8a96b"],
    preview: "bg-gradient-to-br from-zinc-900 via-zinc-800 to-amber-900",
  },
  {
    id: "energy-rush",
    name: "Energy Rush",
    description: "High-energy fitness vibe",
    colors: ["#f8fafc", "#8fbc8f", "#ff69b4"],
    preview: "bg-gradient-to-br from-slate-50 via-green-100 to-pink-100",
  },
  {
    id: "ocean-depths",
    name: "Ocean Depths",
    description: "Calm professional aqua",
    colors: ["#f0f9ff", "#2563eb", "#06b6d4"],
    preview: "bg-gradient-to-br from-sky-50 via-blue-100 to-cyan-100",
  },
  {
    id: "sunset-power",
    name: "Sunset Power",
    description: "Warm motivational energy",
    colors: ["#fef7ed", "#ea580c", "#dc2626"],
    preview: "bg-gradient-to-br from-orange-50 via-orange-200 to-red-200",
  },
  {
    id: "trickipedia",
    name: "Trickipedia",
    description: "Original light theme",
    colors: ["#fefefe", "#dc2626", "#65a30d"],
    preview: "bg-gradient-to-br from-white via-red-50 to-lime-50",
  },
];

export default function GymSetupWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [facilityName, setFacilityName] = useState("");
  const [facilityType, setFacilityType] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("trickipedia");
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [contactEmail, setContactEmail] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const { completeSetup } = useGymSetup();
  const { setTheme } = useTheme();

  const steps = [
    { id: "facility", name: "Facility Info", icon: Building2 },
    { id: "type", name: "Facility Type", icon: LayoutGrid },
    { id: "theme", name: "Theme & Style", icon: Palette },
    { id: "apps", name: "Select Apps", icon: Settings },
    { id: "review", name: "Review & Finish", icon: Check },
  ];

  const selectedFacilityType = facilityTypes.find(
    (type) => type.id === facilityType
  );

  const handleFacilityTypeSelect = (typeId: string) => {
    setFacilityType(typeId);
    const type = facilityTypes.find((t) => t.id === typeId);
    if (type) {
      setSelectedApps(type.apps);
    }
  };

  const toggleApp = (appId: string) => {
    setSelectedApps((prev) =>
      prev.includes(appId)
        ? prev.filter((id) => id !== appId)
        : [...prev, appId]
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return facilityName.trim().length > 0;
      case 1:
        return facilityType.length > 0;
      case 2:
        return selectedTheme.length > 0;
      case 3:
        return selectedApps.length > 0;
      default:
        return true;
    }
  };

  const handleFinish = () => {
    // Ensure essential apps cannot be omitted even if user deselected them somehow
    const essentialAppIds = availableApps
      .filter((a) => a.essential)
      .map((a) => a.id);
    const finalSelectedApps = Array.from(
      new Set([...essentialAppIds, ...selectedApps])
    );

    console.log("Setup configuration:", {
      facilityName,
      facilityType,
      selectedTheme,
      selectedApps: finalSelectedApps,
      contactEmail,
      timezone,
    });

    // Apply the selected theme
    setTheme(selectedTheme);

    completeSetup({
      facilityName,
      facilityType,
      selectedTheme,
      selectedApps: finalSelectedApps,
      contactEmail,
      timezone,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-balance">
            Welcome to Your Gym Management System
          </h1>
          <p className="text-muted-foreground text-lg text-balance">
            Let&apos; get your facility set up in just a few steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300",
                      index <= currentStep
                        ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "border-muted-foreground/30 text-muted-foreground bg-background"
                    )}
                  >
                    {index < currentStep ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <p
                    className={cn(
                      "text-xs sm:text-sm font-medium transition-colors hidden sm:block text-center",
                      index <= currentStep
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.name}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-2 sm:mx-4 transition-all duration-300",
                      index < currentStep
                        ? "bg-primary"
                        : "bg-muted-foreground/30"
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="w-full shadow-xl border-2">
          {/* Step 0: Facility Information */}
          {currentStep === 0 && (
            <div className="min-h-[500px] flex flex-col">
              <CardHeader className="space-y-3 pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  Facility Information
                </CardTitle>
                <CardDescription className="text-base">
                  Let&apos; start by setting up your facility&apos; basic
                  information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 flex-1">
                <div className="space-y-3">
                  <Label
                    htmlFor="facility-name"
                    className="text-base font-semibold"
                  >
                    Facility Name *
                  </Label>
                  <Input
                    id="facility-name"
                    placeholder="e.g., Iron Will Fitness, Apex Gymnastics"
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                    className="text-lg h-12"
                  />
                  <p className="text-sm text-muted-foreground">
                    This will appear in the header and on all reports
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="contact-email"
                      className="text-base font-semibold"
                    >
                      Contact Email
                    </Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="admin@yourfacility.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="h-11"
                    />
                    <p className="text-sm text-muted-foreground">
                      For system notifications and support
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="timezone"
                      className="text-base font-semibold"
                    >
                      Timezone
                    </Label>
                    <select
                      id="timezone"
                      className="w-full h-11 px-3 py-2 border border-input rounded-md bg-background text-base"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                    >
                      <option value="America/New_York">
                        Eastern Time (ET)
                      </option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">
                        Pacific Time (PT)
                      </option>
                    </select>
                    <p className="text-sm text-muted-foreground">
                      Used for scheduling and reports
                    </p>
                  </div>
                </div>
              </CardContent>
            </div>
          )}

          {/* Step 1: Facility Type */}
          {currentStep === 1 && (
            <div className="min-h-[500px] flex flex-col">
              <CardHeader className="space-y-3 pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <LayoutGrid className="w-6 h-6 text-primary" />
                  </div>
                  Choose Your Facility Type
                </CardTitle>
                <CardDescription className="text-base">
                  Select the type that best describes your facility. We&apos;ll
                  pre-configure the most relevant apps for you.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {facilityTypes.map((type) => (
                    <Card
                      key={type.id}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:shadow-lg group relative overflow-hidden",
                        facilityType === type.id
                          ? "ring-2 ring-primary border-primary shadow-md"
                          : "hover:border-primary/50"
                      )}
                      onClick={() => handleFacilityTypeSelect(type.id)}
                    >
                      <CardContent className="p-5">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div
                              className={cn(
                                "p-3 rounded-xl bg-gradient-to-br transition-transform group-hover:scale-110",
                                type.gradient
                              )}
                            >
                              <type.icon className="w-6 h-6 text-white" />
                            </div>
                            {facilityType === type.id && (
                              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-4 h-4 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-base mb-1.5">
                              {type.name}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {type.description}
                            </p>
                          </div>
                          <div className="pt-2">
                            <p className="text-xs text-muted-foreground mb-2">
                              Includes {type.apps.length} apps
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </div>
          )}

          {/* Step 2: Theme Selection */}
          {currentStep === 2 && (
            <div className="min-h-[500px] flex flex-col">
              <CardHeader className="space-y-3 pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Palette className="w-6 h-6 text-primary" />
                  </div>
                  Choose Your Theme
                </CardTitle>
                <CardDescription className="text-base">
                  Select a visual theme that matches your facility&apos; brand
                  and atmosphere
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {themes.map((theme) => (
                    <Card
                      key={theme.id}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:shadow-lg group overflow-hidden",
                        selectedTheme === theme.id
                          ? "ring-2 ring-primary border-primary shadow-md"
                          : "hover:border-primary/50"
                      )}
                      onClick={() => setSelectedTheme(theme.id)}
                    >
                      <div
                        className={cn(
                          "h-32 transition-transform group-hover:scale-105",
                          theme.preview
                        )}
                      />
                      <CardContent className="p-5">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-base">
                              {theme.name}
                            </h3>
                            {selectedTheme === theme.id && (
                              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-3 h-3 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {theme.description}
                          </p>
                          <div className="flex gap-2 pt-1">
                            {theme.colors.map((color, index) => (
                              <div
                                key={index}
                                className="w-7 h-7 rounded-full border-2 border-background shadow-sm"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </div>
          )}

          {/* Step 3: App Selection */}
          {currentStep === 3 && (
            <div className="min-h-[500px] flex flex-col">
              <CardHeader className="space-y-3 pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Settings className="w-6 h-6 text-primary" />
                  </div>
                  Select Your Apps
                </CardTitle>
                <CardDescription className="text-base">
                  Choose which apps you want to enable. Essential apps are
                  pre-selected.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 flex-1">
                {selectedFacilityType && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-lg bg-gradient-to-br flex-shrink-0",
                          selectedFacilityType.gradient
                        )}
                      >
                        <selectedFacilityType.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">
                          Pre-configured for {selectedFacilityType.name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedApps.length} apps selected • You can
                          customize these below
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableApps.map((app) => {
                    const isSelected = selectedApps.includes(app.id);
                    return (
                      <Card
                        key={app.id}
                        className={cn(
                          "cursor-pointer transition-all duration-200 hover:shadow-md group",
                          isSelected
                            ? "ring-2 ring-primary border-primary bg-primary/5"
                            : "hover:border-primary/30"
                        )}
                        onClick={() => toggleApp(app.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                "flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0 transition-colors",
                                isSelected ? "bg-primary/20" : "bg-muted"
                              )}
                            >
                              <app.icon
                                className={cn(
                                  "w-5 h-5",
                                  isSelected
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                )}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-sm">
                                  {app.name}
                                </h3>
                                {app.essential && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Essential
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {app.description}
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              <div
                                className={cn(
                                  "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                                  isSelected
                                    ? "bg-primary border-primary"
                                    : "border-muted-foreground/30 group-hover:border-primary/50"
                                )}
                              >
                                {isSelected && (
                                  <Check className="w-3 h-3 text-primary-foreground" />
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="min-h-[500px] flex flex-col">
              <CardHeader className="space-y-3 pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Check className="w-6 h-6 text-primary" />
                  </div>
                  Review Your Setup
                </CardTitle>
                <CardDescription className="text-base">
                  Review your configuration before completing the setup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        Facility Details
                      </h3>
                      <div className="space-y-3 pl-7">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-muted-foreground">
                            Name
                          </span>
                          <span className="font-medium text-base">
                            {facilityName}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-muted-foreground">
                            Type
                          </span>
                          <div className="flex items-center gap-2">
                            {selectedFacilityType && (
                              <>
                                <div
                                  className={cn(
                                    "p-1.5 rounded-md bg-gradient-to-br",
                                    selectedFacilityType.gradient
                                  )}
                                >
                                  <selectedFacilityType.icon className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-medium">
                                  {selectedFacilityType.name}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        {contactEmail && (
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-muted-foreground">
                              Email
                            </span>
                            <span className="font-medium">{contactEmail}</span>
                          </div>
                        )}
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-muted-foreground">
                            Timezone
                          </span>
                          <span className="font-medium">
                            {timezone === "America/New_York" && "Eastern Time"}
                            {timezone === "America/Chicago" && "Central Time"}
                            {timezone === "America/Denver" && "Mountain Time"}
                            {timezone === "America/Los_Angeles" &&
                              "Pacific Time"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Palette className="w-5 h-5 text-primary" />
                        Selected Theme
                      </h3>
                      <div className="pl-7">
                        {themes.find((t) => t.id === selectedTheme) && (
                          <Card className="overflow-hidden">
                            <div
                              className={cn(
                                "h-24",
                                themes.find((t) => t.id === selectedTheme)
                                  ?.preview
                              )}
                            />
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                <p className="font-medium">
                                  {
                                    themes.find((t) => t.id === selectedTheme)
                                      ?.name
                                  }
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {
                                    themes.find((t) => t.id === selectedTheme)
                                      ?.description
                                  }
                                </p>
                                <div className="flex gap-2 pt-1">
                                  {themes
                                    .find((t) => t.id === selectedTheme)
                                    ?.colors.map((color, index) => (
                                      <div
                                        key={index}
                                        className="w-6 h-6 rounded-full border-2 border-background shadow-sm"
                                        style={{ backgroundColor: color }}
                                      />
                                    ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5 text-primary" />
                      Enabled Apps ({selectedApps.length})
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2 pl-7">
                      {selectedApps.map((appId) => {
                        const app = availableApps.find((a) => a.id === appId);
                        if (!app) return null;
                        return (
                          <div
                            key={appId}
                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                              <app.icon className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{app.name}</p>
                            </div>
                            {app.essential && (
                              <Badge variant="secondary" className="text-xs">
                                Essential
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg">
                  <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    What happens next?
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        Your facility name will appear in the header and all
                        reports
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        The selected theme will be applied across your dashboard
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        Only the chosen apps will be available in navigation
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        You can modify these settings anytime from the settings
                        panel
                      </span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center p-6 border-t bg-muted/30">
            <Button
              variant="outline"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              disabled={currentStep === 0}
              size="lg"
              className="min-w-[100px]"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </div>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                disabled={!canProceed()}
                size="lg"
                className="min-w-[100px]"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                size="lg"
                className="min-w-[140px]"
              >
                Complete Setup
                <Check className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
