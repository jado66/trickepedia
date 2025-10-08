"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Eye, CheckCircle2, Share2, Edit, Trash2, Circle } from "lucide-react";

import { PermissionGate } from "@/components/permission-gate";
import { toast } from "sonner";
import { incrementTrickViews } from "@/lib/client/tricks-data-client";
import { useConfetti } from "@/contexts/confetti-provider";
import { TrickWithLinkedPrerequisites } from "@/types/trick";
import { MoveTrickDialog } from "./move-trick-dialog";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@/contexts/user-provider";
import { AddToGoalsButton } from "@/components/tricks/add-to-goals-button";

interface ClientInteractionsProps {
  trick: TrickWithLinkedPrerequisites;
}

export function ClientInteractions({ trick }: ClientInteractionsProps) {
  const router = useRouter();
  const { user, hasModeratorAccess } = useUser();
  const [canDo, setCanDo] = useState(false);
  const [canDoCount, setCanDoCount] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleShare = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link to clipboard");
    }
  };

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const initializeInteractions = async (supabase: any) => {
      // Increment view count
      await incrementTrickViews(supabase, trick.id);

      // Check if user can do this trick and get the count
      if (user) {
        const { data: canDoData } = await supabase
          .from("user_tricks")
          .select("can_do")
          .eq("trick_id", trick.id)
          .eq("user_id", user.id)
          .single();

        setCanDo(canDoData?.can_do || false);
      }

      // Get the total count of users who can do this trick
      const { count } = await supabase
        .from("user_tricks")
        .select("*", { count: "exact", head: true })
        .eq("trick_id", trick.id)
        .eq("can_do", true);

      setCanDoCount(count || 0);
    };

    initializeInteractions(supabase);
  }, [trick.id, user, supabase]);

  const { celebrate } = useConfetti();

  const handleToggleCanDo = async () => {
    if (!user) {
      toast.error("Please login to track your progress");
      return;
    }

    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const newCanDoStatus = !canDo;

      if (newCanDoStatus) {
        // User can now do this trick - upsert the record
        const { error } = await supabase.from("user_tricks").upsert(
          {
            user_id: user.id,
            trick_id: trick.id,
            can_do: true,
            achieved_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,trick_id",
          }
        );

        if (error) throw error;

        setCanDo(true);
        setCanDoCount((prev) => prev + 1);
        toast.success("Great job! You've marked this trick as learned!");
        celebrate();
      } else {
        // User can't do this trick anymore - remove the record
        const { error } = await supabase
          .from("user_tricks")
          .delete()
          .eq("user_id", user.id)
          .eq("trick_id", trick.id);

        if (error) throw error;

        setCanDo(false);
        setCanDoCount((prev) => Math.max(0, prev - 1));
        toast.info("Trick removed from your learned tricks");
      }
    } catch (error) {
      console.error("Failed to toggle can-do status:", error);
      toast.error("Failed to update your progress");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("tricks")
        .delete()
        .eq("id", trick.id);

      if (error) throw error;

      toast.success("Trick deleted successfully");
      router.push(
        `/${trick.subcategory?.master_category.slug}/${trick.subcategory?.slug}`
      );
    } catch (error) {
      console.error("Failed to delete trick:", error);
      toast.error("Failed to delete trick");
    }
  };

  const canEdit = user;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Eye className="h-4 w-4" />
          <span className="font-medium">
            {trick.view_count.toLocaleString()}
          </span>
          <span>Views</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <CheckCircle2 className="h-4 w-4" />
          <span className="font-medium whitespace-nowrap">{canDoCount}</span>
          <span className="whitespace-nowrap">Can Do This</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={canDo ? "default" : "outline"}
          size="sm"
          onClick={handleToggleCanDo}
          disabled={isUpdating}
          className={
            canDo ? "bg-green-600 hover:bg-green-700 border-green-600" : ""
          }
        >
          {canDo ? (
            <CheckCircle2 className="h-4 w-4 mr-2" />
          ) : (
            <Circle className="h-4 w-4 mr-2" />
          )}
          {canDo ? "I Can Do This" : "Mark as Learned"}
        </Button>

        <AddToGoalsButton trick={trick} />

        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>

        {canEdit && (
          <>
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/${trick.subcategory?.master_category.slug}/${trick.subcategory?.slug}/${trick.slug}/edit`}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>

            {/* <MoveTrickDialog trick={trick} /> */}

            <PermissionGate requireModerator>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive bg-transparent"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Trick</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete &quot;
                      {trick.name}&quot;? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </PermissionGate>
          </>
        )}
      </div>
    </div>
  );
}
