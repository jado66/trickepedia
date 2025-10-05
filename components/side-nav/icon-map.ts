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
} from "lucide-react";

export const iconMap = {
  zap: Zap,
  target: Target,
  dumbbell: Dumbbell,
  layers: Layers,
  "rotate-ccw": RotateCcw,
  activity: Activity,
  bounce: Zap, // Using Zap as fallback for bounce
  circle: Circle,
  wall: BrickWall,
  diamond: Diamond,
  waypoints: Waypoints,
  fan: Fan,
  // Legacy support for old naming convention
  Zap,
  Target,
  Dumbbell,
  Layers,
  Fan,
};
