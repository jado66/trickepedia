"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { XP_LEVELS, type XPLevel } from "@/lib/xp/levels";
import React, { useEffect, useRef, useState } from "react";

export default function LevelProgressionTimeline() {
  // Dynamically measure vertical line span between first & last icons
  const { containerRef, lineTop, lineHeight } = useTimelineLineMetrics();
  return (
    <div className="mb-20" id="levels">
      <div className="text-center mb-16">
        <h3 className="text-2xl md:text-3xl font-bold mb-4">
          Level Progression
        </h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Advance through 5 distinct levels, each unlocking new privileges and
          recognition.
        </p>
      </div>

      <div
        className="relative max-w-4xl mx-auto px-2 sm:px-4"
        ref={containerRef}
      >
        {/* Timeline line (visible on all breakpoints, sits behind content) */}
        {lineHeight > 0 && (
          <div
            className="absolute left-1/2 -translate-x-0.5 w-1 bg-gradient-to-b from-primary/20 via-primary/35 to-primary/20 dark:from-primary/35 dark:via-primary/55 dark:to-primary/35 rounded-full pointer-events-none z-0 transition-colors"
            style={{ top: lineTop, height: lineHeight }}
          />
        )}

        {XP_LEVELS.map((level: XPLevel, index) => {
          const IconComponent = level.icon;
          const isEven = index % 2 === 0;

          return (
            <div
              key={level.level}
              className="relative flex flex-col md:flex-row items-center mb-16 last:mb-0"
            >
              {/* Timeline node (flow on mobile, centered absolute on md+) */}
              <div className="md:absolute md:left-1/2 md:-translate-x-1/2 z-10 mb-6 md:mb-0">
                <div
                  className="w-14 h-14 md:w-16 md:h-16 bg-background dark:bg-background/80 backdrop-blur-sm border-4 border-primary/20 dark:border-primary/40 rounded-full flex items-center justify-center shadow-lg dark:shadow-primary/10 ring-0 dark:ring-1 dark:ring-primary/30 transition-colors"
                  data-timeline-icon
                >
                  <IconComponent
                    className={`w-7 h-7 md:w-8 md:h-8 ${level.color}`}
                  />
                </div>
              </div>

              {/* Content card */}
              <div
                className={`w-full flex relative z-10 ${
                  isEven ? "md:justify-start" : "md:justify-end"
                }`}
              >
                <div
                  className={`w-full md:max-w-sm ${
                    isEven ? "md:mr-8 md:pr-8" : "md:ml-8 md:pl-8"
                  }`}
                >
                  <Card
                    className={`${level.borderColor} ${level.bgColor} shadow-lg hover:shadow-xl transition-all duration-300 dark:shadow-primary/10 dark:border-primary/30`}
                  >
                    <CardHeader className="text-center">
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-2">
                        <CardTitle className="text-xl md:text-2xl">
                          {level.name}
                        </CardTitle>
                        <Badge
                          className={`${level.badgeBg} text-white text-xs md:text-sm font-semibold border-0 shadow-sm`}
                        >
                          Level {level.level}
                        </Badge>
                      </div>
                      <div
                        className={`text-base md:text-lg font-bold ${level.color}`}
                      >
                        {index > 0 && `${level.nextLevelXP} XP needed`}
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3">
                        <h5 className="font-semibold text-xs md:text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          What You Unlock
                        </h5>
                        <div className="space-y-2">
                          {level.unlocks.map((unlock, unlockIndex) => (
                            <div
                              key={unlockIndex}
                              className="flex items-start gap-3 text-xs md:text-sm"
                            >
                              <div
                                className={`mt-1 w-2 h-2 rounded-full ${level.color.replace(
                                  "text-",
                                  "bg-"
                                )} flex-shrink-0 dark:opacity-90`}
                              ></div>
                              <span>{unlock}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Hooks & helpers placed after component (to avoid re-ordering large blocks) ----------
function useTimelineLineMetrics() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [metrics, setMetrics] = useState({ top: 0, height: 0 });

  useEffect(() => {
    function measure() {
      const container = containerRef.current;
      if (!container) return;
      const icons = Array.from(
        container.querySelectorAll<HTMLElement>("[data-timeline-icon]")
      );
      if (icons.length < 2) {
        setMetrics({ top: 0, height: 0 });
        return;
      }
      const first = icons[0].getBoundingClientRect();
      const last = icons[icons.length - 1].getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const firstCenter = first.top - containerRect.top + first.height / 2;
      const lastCenter = last.top - containerRect.top + last.height / 2;
      const height = Math.max(0, lastCenter - firstCenter);
      setMetrics({ top: firstCenter, height });
    }

    measure();
    window.addEventListener("resize", measure);
    const raf = requestAnimationFrame(measure); // capture post-layout
    const timeout = setTimeout(measure, 120); // fallback after async assets
    return () => {
      window.removeEventListener("resize", measure);
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, []);

  return { containerRef, lineTop: metrics.top, lineHeight: metrics.height };
}

// Dark Mode Notes:
// ---------------------------------------------------------------------------
// This component now adds dark: variants for the vertical timeline line, icon
// wrapper, and card accents. For richer theming, ensure each XP_LEVEL object
// in `XP_LEVELS` supplies dark-aware utility classes (e.g.
// color: "text-sky-600 dark:text-sky-400", bgColor: "bg-sky-50 dark:bg-sky-900/30", etc.).
// The dynamic bullet color uses `level.color.replace('text-', 'bg-')`; if you
// introduce multi-token color strings, consider adding an explicit `bulletBg`
// field to avoid brittle replacements.
