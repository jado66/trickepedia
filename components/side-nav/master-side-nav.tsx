"use client";

import { MobileSideNav } from "@/components/side-nav/mobile-side-nav";
import { DesktopSideNav } from "@/components/side-nav/desktop-side-nav";

export function MasterSideNav({
  onItemClick,
}: { onItemClick?: () => void } = {}) {
  return (
    <>
      <MobileSideNav onItemClick={onItemClick} />
      <DesktopSideNav onItemClick={onItemClick} />
    </>
  );
}
