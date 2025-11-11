"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  Users,
  Link,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@/types/event";
import { createEvent, updateEvent } from "@/lib/client/events-client";
import { supabase } from "@/utils/supabase/client";

export const eventUpsertSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().optional().or(z.literal("")),
  event_type: z.string().min(1, "Event type is required"),
  custom_event_type: z.string().optional().or(z.literal("")),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional().or(z.literal("")),
  start_time: z.string().optional().or(z.literal("")),
  end_time: z.string().optional().or(z.literal("")),
  location_name: z.string().optional().or(z.literal("")),
  location_address: z.string().optional().or(z.literal("")),
  location_scope: z.string().optional().or(z.literal("")),
  location_city: z.string().optional().or(z.literal("")),
  location_state: z.string().optional().or(z.literal("")),
  location_country: z.string().optional().or(z.literal("")),
  event_url: z.string().url().optional().or(z.literal("")),
  image_url: z.string().url().optional().or(z.literal("")),
  skill_level: z.string().optional().or(z.literal("")),
  entry_fee: z.string().optional().or(z.literal("")),
  organizer_name: z.string().optional().or(z.literal("")),
  organizer_contact: z.string().optional().or(z.literal("")),
  age_restrictions: z.string().optional().or(z.literal("")),
  equipment_requirements: z.string().optional().or(z.literal("")),
  registration_deadline: z.string().optional().or(z.literal("")),
  max_participants: z.coerce.number().optional(),
  status: z.string().optional(),
});

export type EventUpsertFormData = z.infer<typeof eventUpsertSchema>;

type BaseProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
  onSuccess?: (event: Event) => void;
};

type CreateModeProps = BaseProps & {
  mode: "create";
  categoryId: string;
  categorySlug: string;
  event?: never;
};

type EditModeProps = BaseProps & {
  mode: "edit";
  event: Event;
  categoryId?: never;
  categorySlug?: string;
};

export type EventUpsertDialogProps = CreateModeProps | EditModeProps;

export function EventUpsertDialog(props: EventUpsertDialogProps) {
  const { open, onOpenChange, trigger, mode } = props;
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<EventUpsertFormData>({
    // @ts-expect-error fix me
    resolver: zodResolver(eventUpsertSchema),
    defaultValues: {
      title: mode === "edit" ? props.event.title || "" : "",
      description: mode === "edit" ? props.event.description || "" : "",
      event_type: mode === "edit" ? props.event.event_type || "" : "",
      start_date: mode === "edit" ? props.event.start_date || "" : "",
      location_name: mode === "edit" ? props.event.location_name || "" : "",
      location_city: mode === "edit" ? props.event.location_city || "" : "",
      skill_level: mode === "edit" ? props.event.skill_level || "all" : "all",
      entry_fee: mode === "edit" ? props.event.entry_fee || "Free" : "Free",
      status: mode === "edit" ? props.event.status : "upcoming",
    },
  });

  const eventType = form.watch("event_type");

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    const values = form.getValues();
    if (currentStep === 0) {
      return values.title && values.event_type;
    }
    if (currentStep === 1) {
      return values.start_date;
    }
    return true;
  };

  // Helper function to convert undefined to null for database compatibility
  const transformFormData = (data: EventUpsertFormData) => {
    const transformed: any = {};

    for (const [key, value] of Object.entries(data)) {
      // Convert empty strings and undefined to null, except for required string fields
      if (
        key === "title" ||
        key === "event_type" ||
        key === "start_date" ||
        key === "status"
      ) {
        transformed[key] = value || "";
      } else if (key === "max_participants") {
        transformed[key] = value || null;
      } else {
        transformed[key] = value === undefined || value === "" ? null : value;
      }
    }

    return transformed;
  };

  async function onSubmit(data: EventUpsertFormData) {
    setIsSubmitting(true);
    try {
      const transformedData = transformFormData(data);

      if (mode === "create") {
        const result = await createEvent(supabase, {
          ...transformedData,
          master_category_id: props.categoryId,
          status: "upcoming",
          social_links: null,
          is_featured: false,
          media_urls: null,
        });
        props.onSuccess?.(result);
      } else {
        const result = await updateEvent(supabase, props.event.id, {
          ...transformedData,
          social_links: null,
        });
        props.onSuccess?.(result);
      }

      onOpenChange(false);
      setCurrentStep(0);
      form.reset();
      router.refresh();
    } catch (e) {
      console.error("Event upsert failed", e);
    } finally {
      setIsSubmitting(false);
    }
  }

  const stepTitles = [
    "Event Basics",
    "When & Where",
    "Event Details",
    "Links & Media",
  ];
  const stepDescriptions = [
    "What's your event about?",
    "Date, time, and location",
    "Who can join and how?",
    "Social links and images",
  ];
  const stepIcons = [Calendar, MapPin, Users, Link];
  const stepRequired = [true, true, false, false];

  const renderStepContent = () => {
    if (currentStep === 0) {
      return (
        <div className="space-y-4" key="step-0">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What&apos;s your event called? *</FormLabel>
                <FormControl>
                  <Input
                    key="title-input"
                    placeholder="Summer Parkour Jam"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="event_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What type of event is this? *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger key="event-type-select">
                      <SelectValue placeholder="Choose the best fit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="competition">Competition</SelectItem>
                    <SelectItem value="jam">Jam/Gathering</SelectItem>
                    <SelectItem value="workshop">Workshop/Training</SelectItem>
                    <SelectItem value="demo">Demo/Show</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tell people about your event</FormLabel>
                <FormControl>
                  <Textarea
                    key="description-textarea"
                    placeholder="What should people expect? What makes this event special?"
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This helps people decide if they want to join
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    }

    if (currentStep === 1) {
      return (
        <div className="space-y-4" key="step-1">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>When does it start? *</FormLabel>
                <FormControl>
                  <Input key="start-date-input" type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Where is it happening?</FormLabel>
                <FormControl>
                  <Input
                    key="location-name-input"
                    placeholder="Central Park, Local Gym, Online, etc."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location_city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input
                    key="location-city-input"
                    placeholder="New York"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="space-y-4" key="step-2">
          <FormField
            control={form.control}
            name="skill_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Who can join?</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger key="skill-level-select">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="all">Everyone welcome</SelectItem>
                    <SelectItem value="beginner">Beginners only</SelectItem>
                    <SelectItem value="intermediate">
                      Intermediate level
                    </SelectItem>
                    <SelectItem value="advanced">Advanced only</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="entry_fee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost to join</FormLabel>
                <FormControl>
                  <Input
                    key="entry-fee-input"
                    placeholder="Free, $20, Donation welcome"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    }

    if (currentStep === 3) {
      return (
        <div className="space-y-4" key="step-3">
          <FormField
            control={form.control}
            name="event_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Website or Registration Link</FormLabel>
                <FormControl>
                  <Input
                    key="event-url-input"
                    placeholder="https://example.com/register"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Where can people learn more or register?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Image</FormLabel>
                <FormControl>
                  <Input
                    key="image-url-input"
                    placeholder="https://example.com/event-photo.jpg"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A photo that represents your event
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {mode === "create"
              ? `Create ${props.categorySlug} Event`
              : "Edit Event"}
          </DialogTitle>
          <DialogDescription>{stepDescriptions[currentStep]}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between mb-6">
          {stepTitles.map((title, index) => {
            const StepIcon = stepIcons[index];
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const isOptional = !stepRequired[index];

            return (
              <div key={index} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : isActive
                      ? "border-primary text-primary"
                      : "border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <StepIcon className="w-4 h-4" />
                  )}
                </div>
                <div className="ml-2 hidden sm:block">
                  <div
                    className={`text-sm font-medium ${
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {title}
                    {isOptional && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        Optional
                      </Badge>
                    )}
                  </div>
                </div>
                {index < stepTitles.length - 1 && (
                  <div
                    className={`w-8 h-px mx-2 ${
                      isCompleted ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <Form {...form}>
          {/* @ts-expect-error todo */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {renderStepContent()}

            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <div className="flex gap-2">
                {currentStep < 3 ? (
                  <>
                    {!stepRequired[currentStep + 1] && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setCurrentStep(3)}
                      >
                        Skip to finish
                      </Button>
                    )}
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={!canProceed()}
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting || !canProceed()}
                  >
                    {isSubmitting && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {mode === "create" ? "Create Event" : "Update Event"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
