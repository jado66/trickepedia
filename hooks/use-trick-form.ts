"use client";

import { useState, useEffect } from "react";
import type { TrickData } from "@/types/trick";
import type { StepGuide, InventorType } from "@/types/trick-form";
import { toKebabCase } from "@/lib/trick-form-utils";
import { getAllTricks } from "@/lib/client/tricks-data-client"; // NEW: Import your client fetch function
import { fetchPrerequisiteTricksByIds } from "@/lib/client/tricks-data-client"; // NEW: For fetching linked prerequisites
import type { PrerequisiteTrick } from "@/types/trick"; // NEW: Import type
import { supabase } from "@/utils/supabase/client";

export function useTrickForm(
  initialTrick: TrickData,
  mode: "view" | "edit" | "create"
) {
  // Replace prerequisites with prerequisite_ids (uuid[])
  const initialFormData = {
    ...initialTrick,
    prerequisite_ids: initialTrick?.prerequisite_ids ?? [],
  };
  const [formData, setFormData] = useState<TrickData>(initialFormData);
  const [createMultiple, setCreateMultiple] = useState(false);

  // New state
  const [trickType, setTrickType] = useState<"single" | "combo">(
    initialTrick?.is_combo ? "combo" : "single"
  );
  const [components, setComponents] = useState(initialTrick?.components || []); // Load from prop/API
  const [allTricks, setAllTricks] = useState<
    { id: string; name: string; slug: string }[]
  >([]); // Updated type
  const [tricksLoading, setTricksLoading] = useState(true); // NEW: For UI if needed
  const [tricksError, setTricksError] = useState<string | null>(null); // NEW: For error handling

  // NEW: State for fetched prerequisite tricks (for display with names/slugs/links)
  const [prerequisiteTricks, setPrerequisiteTricks] = useState<
    PrerequisiteTrick[]
  >([]);

  // NEW: Fetch allTricks on mount
  useEffect(() => {
    if (!supabase) {
      return;
    }

    const fetchTricks = async () => {
      try {
        setTricksLoading(true);
        const tricks = await getAllTricks(supabase); // Assume returns filtered list (e.g., published roots)
        setAllTricks(tricks);
      } catch (error) {
        console.error("Failed to fetch tricks:", error);
        setTricksError("Failed to load tricks for selection");
      } finally {
        setTricksLoading(false);
      }
    };

    fetchTricks();
  }, [supabase]); // Empty dep array: Fetch once on mount

  // NEW: Fetch prerequisiteTricks whenever prerequisite_ids change
  useEffect(() => {
    if (!supabase) {
      return;
    }

    let isMounted = true;
    const fetchPrerequisites = async () => {
      try {
        if (formData.prerequisite_ids && formData.prerequisite_ids.length > 0) {
          const tricks = await fetchPrerequisiteTricksByIds(
            supabase,
            formData.prerequisite_ids
          );
          if (isMounted) {
            setPrerequisiteTricks(tricks);
          }
        } else {
          if (isMounted) {
            setPrerequisiteTricks([]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch prerequisite tricks:", error);
        if (isMounted) {
          setPrerequisiteTricks([]);
        }
      }
    };

    fetchPrerequisites();
    return () => {
      isMounted = false;
    };
  }, [formData.prerequisite_ids, supabase]);

  // New handlers
  const handleDetailsChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      trick_details: { ...prev.trick_details, [key]: value },
    }));
  };

  const handleComponentChange = (index: number, field: string, value: any) => {
    const newComponents = [...components];
    if (field.startsWith("component_details.")) {
      const detailKey = field.split(".")[1];
      newComponents[index] = {
        ...newComponents[index],
        component_details: {
          ...newComponents[index].component_details,
          [detailKey]: value,
        },
      };
    } else {
      newComponents[index] = { ...newComponents[index], [field]: value };
    }
    setComponents(newComponents);
  };

  const addComponent = () => {
    if (components.length < 5) {
      setComponents([
        ...components,
        {
          component_trick_id: "",
          sequence: components.length + 1,
          component_details: {},
        },
      ]);
    }
  };

  const removeComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  // Always set published to true for now
  useEffect(() => {
    setFormData((prev) => ({ ...prev, is_published: true }));
  }, []);

  // Section visibility states
  const [showPrerequisites, setShowPrerequisites] = useState<boolean>(
    mode !== "create" &&
      Array.isArray(initialTrick.prerequisite_ids) &&
      initialTrick.prerequisite_ids.length > 0
  );
  const [showStepGuide, setShowStepGuide] = useState<boolean>(
    mode !== "create" &&
      !!(
        initialTrick.step_by_step_guide &&
        initialTrick.step_by_step_guide.length > 0 &&
        initialTrick.step_by_step_guide.some(
          (step) => step.title || step.description
        )
      )
  );
  const [showTipsAndTricks, setShowTipsAndTricks] = useState<boolean>(
    mode !== "create" &&
      !!(
        initialTrick.tips_and_tricks?.trim() ||
        initialTrick.common_mistakes?.trim() ||
        initialTrick.safety_notes?.trim()
      )
  );
  const [showInventor, setShowInventor] = useState<boolean>(
    mode !== "create" &&
      !!(initialTrick.inventor_user_id || initialTrick.inventor_name)
  );
  const [showSources, setShowSources] = useState<boolean>(
    mode !== "create" && !!initialTrick.source_urls?.some((url) => url.trim())
  );

  const [openSections, setOpenSections] = useState<string[]>([
    "basic",
    "media",
  ]);
  const [inventorType, setInventorType] = useState<InventorType>(
    initialTrick.inventor_user_id
      ? "user"
      : initialTrick.inventor_name
      ? "name"
      : "none"
  );

  useEffect(() => {
    // Update inventor type when trick data changes
    if (initialTrick.inventor_user_id) {
      setInventorType("user");
    } else if (initialTrick.inventor_name) {
      setInventorType("name");
    } else {
      setInventorType("none");
    }

    // Update optional sections visibility when not in create mode and trick data has content
    if (mode !== "create") {
      const hasPrerequisites = !!initialTrick.prerequisite_ids?.some((p) =>
        p.trim()
      );
      const hasStepGuide = !!(
        initialTrick.step_by_step_guide &&
        initialTrick.step_by_step_guide.length > 0 &&
        initialTrick.step_by_step_guide.some(
          (step) => step.title || step.description
        )
      );
      const hasTipsAndTricks = !!(
        initialTrick.tips_and_tricks?.trim() ||
        initialTrick.common_mistakes?.trim() ||
        initialTrick.safety_notes?.trim()
      );
      const hasInventor = !!(
        initialTrick.inventor_user_id || initialTrick.inventor_name
      );
      const hasSources = !!initialTrick.source_urls?.some((url) => url.trim());

      setShowPrerequisites(hasPrerequisites);
      setShowStepGuide(hasStepGuide);
      setShowTipsAndTricks(hasTipsAndTricks);
      setShowInventor(hasInventor);
      setShowSources(hasSources);

      // Auto-expand sections that have content
      const sectionsToOpen = ["basic", "media"];
      if (hasPrerequisites) sectionsToOpen.push("prerequisites");
      if (hasStepGuide) sectionsToOpen.push("steps");
      if (hasTipsAndTricks) sectionsToOpen.push("tips-safety");
      if (hasInventor) sectionsToOpen.push("inventor");
      if (hasSources) sectionsToOpen.push("sources");
      setOpenSections(sectionsToOpen);
    }
  }, [
    initialTrick.inventor_user_id,
    initialTrick.inventor_name,
    initialTrick.prerequisite_ids,
    initialTrick.step_by_step_guide,
    initialTrick.tips_and_tricks,
    initialTrick.common_mistakes,
    initialTrick.safety_notes,
    mode,
  ]);

  const handleChange = (field: keyof TrickData, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Auto-populate slug when name changes (only in create/edit mode)
      if (field === "name" && (mode === "create" || mode === "edit")) {
        newData.slug = toKebabCase(value);
      }

      return newData;
    });
  };

  const handleInventorTypeChange = (type: InventorType) => {
    setInventorType(type);
    setFormData((prev) => ({
      ...prev,
      inventor_user_id: type === "user" ? prev.inventor_user_id : null,
      inventor_name: type === "name" ? prev.inventor_name : null,
    }));
  };

  // Array field handlers
  // Array field handlers (now for prerequisite_ids)
  const handleArrayChange = (
    field: keyof TrickData,
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) =>
        i === index ? value : item
      ),
    }));
  };

  const addArrayItem = (field: keyof TrickData) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] as string[]), ""],
    }));
  };

  const removeArrayItem = (field: keyof TrickData, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
  };

  // Step guide handlers
  const handleStepChange = (
    index: number,
    field: keyof StepGuide,
    value: string | number | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      step_by_step_guide: (prev.step_by_step_guide || []).map((step, i) =>
        i === index ? { ...step, [field]: value } : step
      ),
    }));
  };

  const addStep = () => {
    const newStep: StepGuide = {
      step: (formData.step_by_step_guide || []).length + 1,
      title: "",
      description: "",
      tips: [""],
    };
    setFormData((prev) => ({
      ...prev,
      step_by_step_guide: [...(prev.step_by_step_guide || []), newStep],
    }));
  };

  const removeStep = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      step_by_step_guide: (prev.step_by_step_guide || [])
        .filter((_, i) => i !== index)
        .map((step, i) => ({ ...step, step: i + 1 })),
    }));
  };

  const getInventorDisplayName = (
    users: Array<{
      id: string;
      first_name: string;
      last_name: string;
      username?: string;
    }> = []
  ) => {
    if (formData.inventor_user_id && users.length > 0) {
      const user = users.find((u) => u.id === formData.inventor_user_id);
      if (user) {
        return user.username || `${user.first_name} ${user.last_name}`;
      }
      return "Unknown User";
    }
    return formData.inventor_name || null;
  };

  return {
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
    setInventorType,
    handleChange,
    handleInventorTypeChange,
    handleArrayChange,
    addArrayItem,
    removeArrayItem,
    handleStepChange,
    addStep,
    removeStep,
    getInventorDisplayName,
    // New exports
    trickType,
    setTrickType,
    components,
    setComponents,
    allTricks,
    setAllTricks,
    handleDetailsChange,
    handleComponentChange,
    addComponent,
    removeComponent,
    // NEW: Export loading/error for UI handling if needed
    tricksLoading,
    tricksError,
    // NEW: Export for prerequisite display
    prerequisiteTricks,
  };
}
