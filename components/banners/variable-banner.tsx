"use client";
import React from "react";
import { DarkModeUnlockBanner } from "./dark-mode-banner";
import { ContributorBanner } from "./contributor-banner";
import { useUser } from "@/contexts";

export const VariableBanner = ({}) => {
  const { user, isLoading } = useUser();

  if (isLoading) return null;

  if (user) return <DarkModeUnlockBanner />;

  return <ContributorBanner />;
};
