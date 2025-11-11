import { Zap } from "lucide-react";

export default function SectionDivider() {
  return (
    <div className="flex items-center justify-center my-16">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
      <div className="px-4">
        <Zap className="w-6 h-6 text-muted-foreground" />
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
    </div>
  );
}
