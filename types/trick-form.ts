// Types for trick form components
import type { TrickData } from "@/types/trick";

export interface StepGuide {
  step: number;
  title: string;
  description: string;
  tips: string[];
}

export interface TrickFormProps {
  mode: "view" | "edit" | "create";
  trick: TrickData;
  onSubmit?: (
    data: TrickData,
    shouldNavigateAway?: boolean
  ) => Promise<boolean>;
  loading?: boolean;
  users?: {
    id: string;
    first_name: string;
    last_name: string;
    username?: string;
  }[];
  onCancel?: () => void;
}

export interface TrickFormSectionProps {
  formData: TrickData;
  mode: "view" | "edit" | "create";
  onFieldChange: (field: keyof TrickData, value: any) => void;
  users?: TrickFormProps["users"];
  trickType?: string;
  allTricks?: Array<{ id: string; name: string }>;
  onParentChange?: (parentId: string) => void;
  onPromotedChange?: (isPromoted: boolean) => void;
  onDetailsChange?: (field: string, value: any) => void;
}

export interface StepGuideSectionProps extends TrickFormSectionProps {
  onStepChange: (
    index: number,
    field: keyof StepGuide,
    value: string | number | string[]
  ) => void;
  onAddStep: () => void;
  onRemoveStep: (index: number) => void;
}

export type InventorType = "none" | "user" | "name";
