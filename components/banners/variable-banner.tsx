"use client";
import React from "react";
import { DarkModeUnlockBanner } from "./dark-mode-banner";
import { ContributorBanner } from "./contributor-banner";
import { useUser } from "@/contexts";

export interface VariableBannerProps {}

export const VariableBanner: React.FC<VariableBannerProps> = ({}) => {
  const { user, isLoading } = useUser();

  if (isLoading) return null;

  if (user) return <DarkModeUnlockBanner />;

  return <ContributorBanner />;
};
