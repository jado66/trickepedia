"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Check, Trophy } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface Sport {
  name: string;
  mastered: number;
  total: number;
  color: string;
}

const demoSports: Sport[] = [
  { name: "Parkour", mastered: 12, total: 45, color: "hsl(var(--primary))" },
  { name: "Tricking", mastered: 8, total: 38, color: "hsl(var(--primary))" },
  { name: "Trampoline", mastered: 15, total: 42, color: "hsl(var(--primary))" },
];

export function InteractiveProgressDemo() {
  const [sports, setSports] = useState(demoSports);
  // Track which sport was just incremented by name (avoids any potential index mismatch)
  const [animatingSport, setAnimatingSport] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  // Track when the demo is actually visible on screen (works for mobile & desktop)
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(containerRef, { amount: 0.3 }); // 30% visible to activate

  useEffect(() => {
    if (!inView) return;

    const interval = setInterval(() => {
      setSports((prev) => {
        // Gather indices that are not yet complete to avoid repeatedly picking finished sports
        const available = prev
          .map((s, i) => (s.mastered < s.total ? i : -1))
          .filter((i) => i !== -1);

        if (available.length === 0) return prev; // all complete

        const chosenIndex =
          available[Math.floor(Math.random() * available.length)];
        const chosen = prev[chosenIndex];

        const updated = [...prev];
        updated[chosenIndex] = { ...chosen, mastered: chosen.mastered + 1 };

        setAnimatingSport(chosen.name);

        const percentage =
          (updated[chosenIndex].mastered / updated[chosenIndex].total) * 100;
        if (percentage % 25 === 0) {
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 1000);
        }

        setTimeout(() => setAnimatingSport(null), 400);

        return updated;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [inView]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[400px] bg-background/50 lg:rounded-lg lg:border-2 lg:border-muted p-4 lg:p-8 flex flex-col justify-center transition-all duration-300 hover:border-primary/50"
    >
      <div className="space-y-8">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-2xl font-bold mb-2">Your Progress</h3>
          <p className="text-sm text-muted-foreground">
            {inView
              ? "Watch your skills grow!"
              : "Scroll into view to see live progress"}
          </p>
        </motion.div>

        {sports.map((sport, index) => {
          const percentage = Math.round((sport.mastered / sport.total) * 100);
          const isAnimating = animatingSport === sport.name;

          return (
            <motion.div
              key={sport.name}
              className="space-y-3"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.2 }}
                  >
                    <h4 className="font-semibold text-lg">{sport.name}</h4>
                  </motion.div>
                  <AnimatePresence>
                    {isAnimating && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-primary"
                      >
                        <Check className="w-5 h-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <motion.span
                  className="text-sm font-medium"
                  // Drive animation explicitly off of isAnimating so StrictMode remounts don't cause random highlights
                  animate={
                    isAnimating
                      ? { scale: [1, 1.3, 1], color: "hsl(var(--primary))" }
                      : { scale: 1, color: "hsl(var(--muted-foreground))" }
                  }
                  transition={{ duration: 0.5, times: [0, 0.25, 1] }}
                >
                  {sport.mastered}/{sport.total} mastered ({percentage}%)
                </motion.span>
              </div>
              <div className="relative">
                <Progress
                  value={percentage}
                  className="h-3  [&>div]:bg-accent"
                />
                <motion.div
                  className="absolute inset-0 bg-primary/20 rounded-full"
                  initial={{ opacity: 0 }}
                  animate={
                    isAnimating ? { opacity: [0, 1, 0] } : { opacity: 0 }
                  }
                  transition={{ duration: 0.4 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 200, duration: 0.3 }}
            >
              <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
              <p className="text-2xl font-bold">Milestone Reached!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
