import * as React from "react";
import {
  Zap,
  Target,
  Dumbbell,
  Layers,
  RotateCcw,
  Activity,
  Circle,
  BrickWall,
  Diamond,
  Waypoints,
  Fan,
  Medal,
  Skull,
  Flame,
  RefreshCcwDot,
  Bubbles,
  Users,
  Disc3,
  CableCar,
  MountainSnow,
  Icon,
  type LucideProps,
} from "lucide-react";
import { iceSkate, surfboard } from "@lucide/lab";

// Minimal IconNode type (lucide defines this internally). Each lab icon exports
// an array of tuples: [tagName, { attrs }] used by the generic <Icon /> factory.
type IconNode = [string, Record<string, any>][];

type IconComponent = React.ComponentType<LucideProps>;

// Helper factory to wrap a Lucide Lab "iconNode" into a React component that
// behaves like a normal Lucide icon (accepts className, size, strokeWidth, etc.).
const labIcon = (node: IconNode): IconComponent => {
  const LabIcon: IconComponent = (props) =>
    React.createElement(Icon as any, { iconNode: node, ...props });
  LabIcon.displayName = "LabIcon";
  return LabIcon;
};

export const iconMap: Record<string, IconComponent> = {
  // Core / standard icons
  zap: Zap,
  target: Target,
  dumbbell: Dumbbell,
  layers: Layers,
  "rotate-ccw": RotateCcw,
  activity: Activity,
  bounce: Zap, // Fallback mapping for a non-existent "bounce" icon
  circle: Circle,
  mountainsnow: MountainSnow, // kebab/camel fallback handled by consumer if needed
  mountainSnow: MountainSnow,
  wall: BrickWall,
  cableCar: CableCar,
  diamond: Diamond,
  waypoints: Waypoints,
  fan: Fan,
  bubbles: Bubbles,
  users: Users,
  flame: Flame,
  refreshCcwDot: RefreshCcwDot,
  disc3: Disc3,

  // Lucide Lab icons (provide both kebab & camel case keys for convenience)
  "ice-skate": labIcon(iceSkate as unknown as IconNode),
  iceSkate: labIcon(iceSkate as unknown as IconNode),
  surfboard: labIcon(surfboard as unknown as IconNode),

  // Legacy naming support
  medal: Medal,
  skull: Skull,

  // Also expose some originals by their PascalCase (optional convenience)
  Zap,
  Target,
  Dumbbell,
  Layers,
  Fan,
};
