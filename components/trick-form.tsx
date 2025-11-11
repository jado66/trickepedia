"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTrickForm } from "@/hooks/use-trick-form";

import { BasicInfoSection } from "./trick-form/basic-info-section";
import { MediaTagsSection } from "./media-tags-section";
import { PrerequisitesSection } from "./trick-form/prerequisites-section";
import { StepGuideSection } from "./trick-form/step-guide-section";
import { TipsAndSafetySection } from "./trick-form/tips-and-safety-section";
import { InventorSection } from "./trick-form/inventor-section";
import { SourcesSection } from "./trick-form/sources-section";
import { AddSectionButtons } from "./trick-form/add-section-buttons";

import type { TrickFormProps } from "@/types/trick-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Star } from "lucide-react";

export function TrickForm({
  mode,
  trick,
  onSubmit,
  loading,
  users = [],
  onCancel,
}: TrickFormProps) {
  const {
    formData,
    setFormData,

    createMultiple,
    setCreateMultiple,
    showPrerequisites,
    setShowPrerequisites,
    showStepGuide,
    setShowStepGuide,
    showTipsAndTricks,
    setShowTipsAndTricks,
    showInventor,
    setShowInventor,
    showSources,
    setShowSources,
    openSections,
    setOpenSections,
    inventorType,
    handleChange,
    handleInventorTypeChange,
    handleArrayChange,
    addArrayItem,
    removeArrayItem,
    handleStepChange,
    addStep,
    removeStep,
    getInventorDisplayName,
    // NEW: Additions to hook
    trickType, // 'single' | 'combo'
    setTrickType,
    components, // Array<{component_trick_id: string, sequence: number, component_details: {twists?: number, grab?: string, ...}}>
    setComponents,
    handleDetailsChange, // (key: string, value: any) => void
    handleComponentChange, // (index: number, field: 'component_trick_id' | 'sequence' | etc., value: any) => void
    addComponent,
    removeComponent,
    allTricks, // Fetched list for selects [{id: string, name: string}]
    // NEW: For prerequisites display with names/slugs/links
    prerequisiteTricks,
  } = useTrickForm(trick, mode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      const cleanData = {
        ...formData,
        prerequisite_ids: (formData.prerequisite_ids ?? []).filter((p) =>
          p.trim()
        ),
        video_urls: (formData.video_urls ?? []).filter((v) => v.trim()),
        image_urls: (formData.image_urls ?? []).filter((i) => i.trim()),
        tags: (formData.tags ?? []).filter((t) => t.trim()),
        source_urls: (formData.source_urls ?? []).filter((s) => s.trim()),
        inventor_user_id:
          inventorType === "user" ? formData.inventor_user_id : null,
        inventor_name:
          inventorType === "name"
            ? formData.inventor_name?.trim() || null
            : null,
        // NEW: Include new fields
        is_combo: trickType === "combo",
        components: trickType === "combo" ? components : [], // Send to backend for trick_components table
      };
      // Convert empty string UUIDs to null
      if (cleanData.parent_id === "") cleanData.parent_id = undefined;
      if (cleanData.subcategory_id === "") cleanData.subcategory_id = null;
      if (cleanData.inventor_user_id === "") cleanData.inventor_user_id = null;
      if (cleanData.created_by === "") cleanData.created_by = null;

      // Call onSubmit and only call onCancel if submission was successful
      const result = await onSubmit(cleanData, !createMultiple);
      // If parent returns false, do not navigate away
      if (result === false) {
        // Do not navigate away
        return;
      }
      if (mode === "create" && createMultiple) {
        setFormData({ ...trick });
        setTrickType("single"); // Reset
        setComponents([]); // Reset
      } else if (onCancel) {
        onCancel();
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto lg:p-6 space-y-8">
      {/* <LivePreview formData={formData} mode={mode} /> */}

      <div className="flex-1">
        <form onSubmit={handleSubmit} className="space-y-6 flex flex-col">
          {/* NEW: Trick Type Toggle as Cards */}
          {/* <div className="space-y-2">
            <Label>Trick Type *</Label>
            <div className="flex gap-6">
              <Card
                className={`flex-1 min-w-[220px] cursor-pointer transition border-2 ${
                  trickType === "single"
                    ? "border-primary shadow-lg"
                    : "border-muted"
                } hover:border-primary`}
                onClick={() => setTrickType("single")}
                tabIndex={0}
                role="button"
                aria-pressed={trickType === "single"}
              >
                <CardHeader>
                  <CardTitle>Single Trick or Variation</CardTitle>
                  <CardDescription>
                    A single trick or a variation of a trick.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card
                className={`flex-1 min-w-[220px] cursor-pointer transition border-2 ${
                  trickType === "combo"
                    ? "border-primary shadow-lg"
                    : "border-muted"
                } hover:border-primary`}
                onClick={() => setTrickType("combo")}
                tabIndex={0}
                role="button"
                aria-pressed={trickType === "combo"}
              >
                <CardHeader>
                  <CardTitle>Combo (double/triple or sequence)</CardTitle>
                  <CardDescription>
                    A combination of tricks performed in sequence.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div> */}

          <Accordion
            type="multiple"
            value={openSections}
            onValueChange={setOpenSections}
            className="space-y-4"
          >
            {/* Basic Information - Now includes parent_id, is_promoted, trick_details */}

            <BasicInfoSection
              formData={formData}
              mode={mode}
              onFieldChange={handleChange}
              users={users}
              trickType={trickType}
              onDetailsChange={handleDetailsChange}
            />

            {/* NEW: Combo Section if trickType === 'combo' */}
            {trickType === "combo" && (
              <AccordionItem value="components" className="border rounded-lg">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Star className="h-5 w-5 text-primary" />{" "}
                      {/* Reuse icon or change */}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">Combo Components</h3>
                      <p className="text-sm text-muted-foreground">
                        Add up to 5 components (e.g., flips with twists)
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-4">
                    {components.map((comp, index) => (
                      <div
                        key={index}
                        className="border p-4 rounded-lg space-y-2"
                      >
                        <Label>Component {index + 1}</Label>
                        <Select
                          value={comp.component_trick_id}
                          onValueChange={(val) =>
                            handleComponentChange(
                              index,
                              "component_trick_id",
                              val
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select base trick" />
                          </SelectTrigger>
                          <SelectContent>
                            {(allTricks as { id: string; name: string }[]).map(
                              (t) => (
                                <SelectItem key={t.id} value={t.id}>
                                  {t.name}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          placeholder="Sequence (order)"
                          value={comp.sequence}
                          onChange={(e) =>
                            handleComponentChange(
                              index,
                              "sequence",
                              Number(e.target.value)
                            )
                          }
                        />
                        {/* Component Details - e.g., twists, grab */}
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="Twists (e.g., 1.5)"
                          value={comp.component_details.twists || ""}
                          onChange={(e) =>
                            handleComponentChange(
                              index,
                              "component_details.twists",
                              Number(e.target.value)
                            )
                          }
                        />
                        <Input
                          placeholder="Grab (e.g., indy)"
                          value={comp.component_details.grab || ""}
                          onChange={(e) =>
                            handleComponentChange(
                              index,
                              "component_details.grab",
                              e.target.value
                            )
                          }
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => removeComponent(index)}
                        >
                          Remove Component
                        </Button>
                      </div>
                    ))}
                    {components.length < 5 && (
                      <Button type="button" onClick={addComponent}>
                        Add Component
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Existing sections remain */}
            <MediaTagsSection
              formData={{
                ...formData,
                image_urls: formData.image_urls ?? [],
                video_urls: formData.video_urls ?? [],
                tags: formData.tags ?? [],
              }}
              mode={mode}
              onArrayChange={(field, index, value) =>
                handleArrayChange(field as keyof typeof formData, index, value)
              }
              onAddItem={(field) =>
                addArrayItem(field as keyof typeof formData)
              }
              onRemoveItem={(field, index) =>
                removeArrayItem(field as keyof typeof formData, index)
              }
            />

            {showPrerequisites && (
              <PrerequisitesSection
                formData={formData}
                mode={mode}
                onFieldChange={handleChange}
                users={users}
                currentTrick={trick}
                // NEW: Pass prerequisiteTricks for display with names/slugs/links
                prerequisiteTricks={prerequisiteTricks}
              />
            )}

            {showStepGuide && (
              <StepGuideSection
                formData={formData}
                mode={mode}
                onFieldChange={handleChange}
                users={users}
                onStepChange={handleStepChange}
                onAddStep={addStep}
                onRemoveStep={removeStep}
              />
            )}

            {showTipsAndTricks && (
              <TipsAndSafetySection
                formData={formData}
                mode={mode}
                onFieldChange={handleChange}
                users={users}
              />
            )}

            {showInventor && (
              <InventorSection
                formData={formData}
                mode={mode}
                onFieldChange={handleChange}
                users={users}
                inventorType={inventorType}
                onInventorTypeChange={handleInventorTypeChange}
                getInventorDisplayName={() => getInventorDisplayName(users)}
              />
            )}

            {showSources && (
              <SourcesSection
                formData={formData}
                mode={mode}
                onArrayChange={(field, index, value) =>
                  handleArrayChange(
                    field as keyof typeof formData,
                    index,
                    value
                  )
                }
                onAddItem={(field) =>
                  addArrayItem(field as keyof typeof formData)
                }
                onRemoveItem={(field, index) =>
                  removeArrayItem(field as keyof typeof formData, index)
                }
              />
            )}
          </Accordion>

          <AddSectionButtons
            mode={mode}
            showPrerequisites={showPrerequisites}
            showStepGuide={showStepGuide}
            showTipsAndTricks={showTipsAndTricks}
            showInventor={showInventor}
            showSources={showSources}
            onShowPrerequisites={() => {
              setShowPrerequisites(true);
              setOpenSections((prev) => [...prev, "prerequisites"]);
            }}
            onShowStepGuide={() => {
              setShowStepGuide(true);
              setOpenSections((prev) => [...prev, "steps"]);
            }}
            onShowTipsAndTricks={() => {
              setShowTipsAndTricks(true);
              setOpenSections((prev) => [...prev, "tips-safety"]);
            }}
            onShowInventor={() => {
              setShowInventor(true);
              setOpenSections((prev) => [...prev, "inventor"]);
            }}
            onShowSources={() => {
              setShowSources(true);
              setOpenSections((prev) => [...prev, "sources"]);
            }}
            onSetFormData={setFormData}
          />

          {(mode === "edit" || mode === "create") && (
            <div className="border-t py-4">
              <div className="flex gap-3 justify-end items-center">
                {mode === "create" && (
                  <div className="flex items-center mr-auto">
                    <input
                      type="checkbox"
                      id="create-multiple"
                      className="form-checkbox h-4 w-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
                      checked={createMultiple}
                      onChange={(e) => setCreateMultiple(e.target.checked)}
                    />
                    <Label
                      htmlFor="create-multiple"
                      className="ml-2 text-sm cursor-pointer"
                    >
                      Create Multiple
                    </Label>
                  </div>
                )}
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading
                    ? "Saving..."
                    : mode === "create"
                    ? "Create Trick"
                    : "Save Trick"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
