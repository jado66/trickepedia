"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { iconMap } from "../side-nav";

interface CategoryHeroProps {
  visual?: { image?: string } | null;
  name: string;
  description?: string | null;
  moveName?: string | null;
  trickCount?: number; // now optional
  isActive: boolean;
  iconName?: string; // use string instead of component reference
  /**
   * Optional className overrides (outer wrapper)
   */
  className?: string;
}

/**
 * Animated hero/banner for a category page.
 * (Stabilized version: no scale or layout shift on route change)
 * - Pure fade + blur reveal to avoid any perceptible size change
 * - Accent ring & glow retained but do not affect layout
 */
export function CategoryHero({
  visual,
  name,
  description,
  moveName = "trick",
  trickCount = 0,
  isActive,
  iconName = "circle",
  className = "",
}: CategoryHeroProps) {
  // Lazy import iconMap to keep this component tree-shake friendly
  const IconComponent = iconMap[iconName] || iconMap.circle;

  const [loaded, setLoaded] = useState(false);
  const hasImage = !!visual?.image;

  // If the image URL changes, reset loaded state to retrigger animation
  useEffect(() => {
    setLoaded(false);
  }, [visual?.image]);

  return (
    <motion.div
      key={visual?.image || name} // retrigger enter animation when visual changes
      // Removed scale & translate to prevent perceived size growth between pages
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
      className={
        "relative mb-4 rounded-3xl lg:w-1/2 mx-auto overflow-hidden border bg-muted/30 min-h-[280px] sm:min-h-[320px] md:min-h-[360px] flex items-stretch group " +
        className
      }
    >
      {/* Animated accent ring (subtle) */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[2rem]"
        style={{ padding: 2 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: hasImage ? 1 : 0.35 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="w-full h-full rounded-[1.6rem]"
          style={{
            background:
              "linear-gradient(120deg, hsl(var(--primary)) 0%, transparent 40%, transparent 60%, hsl(var(--primary)) 100%)",
            filter: "blur(8px)",
            opacity: 0.3,
          }}
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%"],
          }}
          transition={{ duration: 12, ease: "linear", repeat: Infinity }}
        />
      </motion.div>

      {/* Soft glow pulse */}
      <AnimatePresence>
        {hasImage && (
          <motion.div
            aria-hidden
            className="absolute -inset-4 rounded-[3rem] bg-primary/10 blur-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.12, 0.28, 0.12] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>

      {hasImage ? (
        <>
          {/* Background blur layer */}
          <motion.div
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `url(${visual!.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            initial={{ filter: "blur(25px)", opacity: 0 }}
            animate={{
              filter: loaded ? "blur(0px)" : "blur(12px)",
              opacity: 1,
            }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Foreground image (opacity only) */}
          <motion.img
            src={visual!.image}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover object-top"
            loading="lazy"
            onLoad={() => setLoaded(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: loaded ? 1 : 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/55 to-black/20" />
        </>
      ) : (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: "hsl(var(--muted))" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <IconComponent className="h-24 w-24 text-white/60 drop-shadow-lg" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        </motion.div>
      )}

      {/* Foreground content */}
      <div className="relative z-10 px-6 md:px-12 py-12 md:py-16 flex flex-col justify-end w-full max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.06 } },
          }}
        >
          <motion.div
            className="flex flex-wrap items-center gap-3 mb-4"
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
          >
            <Badge
              variant="secondary"
              className="text-xs backdrop-blur-sm bg-white/15 text-white border-white/25 shadow-lg"
            >
              {trickCount} total {moveName ? `${moveName}s` : "tricks"}
            </Badge>
            {!isActive && (
              <Badge
                variant="outline"
                className="text-xs backdrop-blur-sm bg-amber-500/25 text-amber-50 border-amber-300/40 shadow-lg"
              >
                Unlisted
              </Badge>
            )}
          </motion.div>

          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-balance mb-3 drop-shadow-2xl"
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
            transition={{ duration: 0.35 }}
          >
            {name}
          </motion.h1>

          {description && (
            <motion.p
              className="text-base sm:text-lg md:text-xl text-white/95 max-w-3xl leading-relaxed drop-shadow-lg"
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              {description}
            </motion.p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
