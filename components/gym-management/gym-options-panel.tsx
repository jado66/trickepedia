"use client";

import { useGym } from "@/contexts/gym/gym-provider";
import { useGymSetup } from "@/contexts/gym/gym-setup-provider";
import { usePlatform } from "@/contexts/platform/platform-provider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings2, Trash2, RotateCcw, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GymOptionsPanel() {
  const {
    allowOverEnrollment,
    toggleAllowOverEnrollment,
    autoCreateMemberOnWaiver,
    toggleAutoCreateMemberOnWaiver,
    purgeAllGymData,
    resetToSeed,
  } = useGym();
  const { resetSetup } = useGymSetup();
  const { resetAll, reseedAll } = usePlatform();
  const isDev = true; //process.env.NODE_ENV !== "production";

  const handleClear = async () => {
    if (
      !confirm("Clear ALL gym data? This leaves a blank slate (no seed data).")
    )
      return;
    try {
      await purgeAllGymData();
      // Optionally keep setup as-is; developer may want to re-run wizard
    } catch (e) {
      console.error(e);
      alert("Clear failed");
    }
  };

  const handleResetData = async () => {
    if (!confirm("Reset gym data back to seed datasets?")) return;
    try {
      await resetToSeed();
    } catch (e) {
      console.error(e);
      alert("Reset to seed failed");
    }
  };

  const handleResetCompletely = async () => {
    if (
      !confirm(
        "Full reset: clear setup, reseed data, and return to setup wizard?"
      )
    )
      return;
    try {
      resetSetup();
      await resetToSeed();
      setTimeout(() => window.location.reload(), 100);
    } catch (e) {
      console.error(e);
      alert("Full reset failed");
    }
  };

  return (
    <div className="w-full">
      <div className="px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          <h3 className="font-semibold">Settings</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Configure gym management options
        </p>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="font-medium text-sm">Class Management</div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label
                  htmlFor="allow-over-enrollment"
                  className="text-sm font-normal cursor-pointer"
                >
                  Allow Over-Enrollment
                </Label>
                <p className="text-xs text-muted-foreground">
                  Let classes exceed their capacity limits
                </p>
              </div>
              <Switch
                id="allow-over-enrollment"
                checked={allowOverEnrollment}
                onCheckedChange={toggleAllowOverEnrollment}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="font-medium text-sm">Waiver Signing</div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label
                  htmlFor="auto-create-member-waiver"
                  className="text-sm font-normal cursor-pointer"
                >
                  Auto-create Member on Waiver
                </Label>
                <p className="text-xs text-muted-foreground">
                  When enabled, signing a waiver creates a member if one
                  doesn&apos;t exist
                </p>
              </div>
              <Switch
                id="auto-create-member-waiver"
                checked={autoCreateMemberOnWaiver}
                onCheckedChange={toggleAutoCreateMemberOnWaiver}
              />
            </div>
          </div>
        </div>

        <Separator />

        {isDev && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="font-medium text-sm">Debug / Data Controls</div>
              <div className="grid gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="justify-start gap-2"
                >
                  <Trash2 className="h-3 w-3" /> Clear Data
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleResetData}
                  className="justify-start gap-2"
                >
                  <Database className="h-3 w-3" /> Reset Data (Seed)
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleResetCompletely}
                  className="justify-start gap-2"
                >
                  <RotateCcw className="h-3 w-3" /> Reset Completely
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground leading-snug">
                Clear Data: wipes all gym domain data (blank slate).
                <br />
                Reset Data: repopulates with seed demo data.
                <br />
                Reset Completely: clears setup + reseeds and reloads.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
