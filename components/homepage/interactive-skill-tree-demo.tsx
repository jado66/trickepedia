"use client";

import { useConfetti } from "@/contexts";
import { motion } from "framer-motion";
import { useState, useRef, useEffect, useMemo } from "react";

interface Trick {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface Connection {
  from: string;
  to: string;
}

const tricks: Trick[] = [
  { id: "1", label: "Roll", x: 50, y: 180 },
  { id: "2", label: "Cartwheel", x: 220, y: 100 },
  { id: "3", label: "Roundoff", x: 220, y: 260 },
  { id: "4", label: "Aerial", x: 420, y: 100 },
  { id: "5", label: "Back Handspring", x: 420, y: 260 },
];

const connections: Connection[] = [
  { from: "1", to: "2" },
  { from: "1", to: "3" },
  { from: "2", to: "4" },
  { from: "3", to: "5" },
];

export function InteractiveSkillTreeDemo() {
  const [completedTricks, setCompletedTricks] = useState<Set<string>>(
    new Set(["1"])
  );

  const { celebrate } = useConfetti();

  const handleToggle = (id: string) => {
    if (!completedTricks.has(id)) {
      celebrate();
    }

    setCompletedTricks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getTrickPosition = (id: string) => {
    const trick = tricks.find((t) => t.id === id);
    return trick ? { x: trick.x + 70, y: trick.y + 25 } : { x: 0, y: 0 };
  };

  // --- Mobile (vertical) layout helpers ---
  // Build levels (root(s) first) so we can render a simple vertical tree on small screens
  const buildLevels = () => {
    const childMap: Record<string, string[]> = {};
    connections.forEach((c) => {
      if (!childMap[c.from]) childMap[c.from] = [];
      childMap[c.from].push(c.to);
    });

    const allTo = new Set(connections.map((c) => c.to));
    const roots = tricks.filter((t) => !allTo.has(t.id));
    const visited = new Set<string>();
    const levels: Trick[][] = [];
    let current = roots;
    while (current.length) {
      levels.push(current);
      const next: Trick[] = [];
      current.forEach((t) => {
        visited.add(t.id);
        const children = (childMap[t.id] || []).map(
          (id) => tricks.find((tr) => tr.id === id)!
        );
        children.forEach((c) => {
          if (!visited.has(c.id) && !next.find((n) => n.id === c.id)) {
            next.push(c);
          }
        });
      });
      current = next;
    }
    return levels;
  };

  // Memoize to avoid new array identity each render causing effects to loop
  const verticalLevels = useMemo(() => buildLevels(), []);

  // --- Vertical layout connection rendering ---
  const verticalContainerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [verticalLines, setVerticalLines] = useState<
    {
      from: string;
      to: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      completed: boolean;
    }[]
  >([]);

  const recomputeVerticalLines = () => {
    const container = verticalContainerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();
    const lines: typeof verticalLines = [];
    connections.forEach((conn) => {
      const fromEl = nodeRefs.current[conn.from];
      const toEl = nodeRefs.current[conn.to];
      if (!fromEl || !toEl) return;
      const fRect = fromEl.getBoundingClientRect();
      const tRect = toEl.getBoundingClientRect();
      const x1 = fRect.left + fRect.width / 2 - cRect.left;
      const y1 = fRect.bottom - cRect.top; // start at bottom center of parent
      const x2 = tRect.left + tRect.width / 2 - cRect.left;
      const y2 = tRect.top - cRect.top; // end at top center of child
      const completed =
        completedTricks.has(conn.from) && completedTricks.has(conn.to);
      lines.push({ from: conn.from, to: conn.to, x1, y1, x2, y2, completed });
    });
    // Avoid unnecessary state updates
    setVerticalLines((prev) => {
      if (
        prev.length === lines.length &&
        prev.every((p, i) => {
          const n = lines[i];
          return (
            p.x1 === n.x1 &&
            p.y1 === n.y1 &&
            p.x2 === n.x2 &&
            p.y2 === n.y2 &&
            p.completed === n.completed
          );
        })
      ) {
        return prev;
      }
      return lines;
    });
  };

  useEffect(() => {
    // Measure after layout
    recomputeVerticalLines();
  }, [completedTricks, verticalLevels]);

  useEffect(() => {
    const handleResize = () => recomputeVerticalLines();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initial defer to ensure DOM painted
  useEffect(() => {
    const id = requestAnimationFrame(() => recomputeVerticalLines());
    return () => cancelAnimationFrame(id);
  }, []);

  const renderNodeButton = (trick: Trick, index?: number) => {
    const isCompleted = completedTricks.has(trick.id);
    return (
      <motion.button
        key={trick.id + (index !== undefined ? `-${index}` : "")}
        onClick={() => handleToggle(trick.id)}
        ref={(el) => {
          nodeRefs.current[trick.id] = el;
        }}
        className={`px-3 py-2 md:px-4 md:py-3 rounded-lg border-2 cursor-pointer transition-all min-w-[110px] md:min-w-[140px] text-center font-bold text-xs md:text-sm relative flex-shrink-0
          ${
            isCompleted
              ? "border-[#32792cff] bg-[#36b32bff] shadow-xl text-white"
              : "bg-white border-gray-300 hover:border-gray-400 shadow-md text-black hover:shadow-lg"
          }
        `}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: (index || 0) * 0.1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {trick.label}
      </motion.button>
    );
  };

  return (
    <div>
      {/* Mobile vertical layout */}
      <div
        ref={verticalContainerRef}
        className="md:hidden relative w-full h-full min-h-[400px] bg-transparent   overflow-hidden py-6 flex flex-col"
      >
        {/* SVG connectors */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
        >
          {verticalLines.map((l) => {
            // Use a slight curve for aesthetics
            const midY = l.y1 + (l.y2 - l.y1) / 2;
            const path = `M ${l.x1} ${l.y1} C ${l.x1} ${midY}, ${l.x2} ${midY}, ${l.x2} ${l.y2}`;
            return (
              <path
                key={`${l.from}-${l.to}`}
                d={path}
                stroke={l.completed ? "#22c55e" : "#9ca3af"}
                strokeWidth={2}
                strokeDasharray={l.completed ? undefined : "5 5"}
                fill="none"
                markerEnd={undefined}
              />
            );
          })}
        </svg>
        <div className="flex-1 flex flex-col justify-center gap-8">
          {verticalLevels.map((level, li) => (
            <div
              key={li}
              className={`flex gap-3 sm:gap-4 justify-center ${
                level.length > 1 ? "flex-wrap" : ""
              }`}
            >
              {level.map((tr, ti) => (
                <div
                  key={tr.id}
                  className="flex flex-col items-center relative"
                >
                  {renderNodeButton(tr, li + ti)}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-auto text-center">
          <motion.p
            className="text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full inline-block"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Tap tricks to mark as learned
          </motion.p>
        </div>
      </div>

      {/* Desktop / large screens original horizontal layout */}
      <div className="hidden md:block relative w-full h-full min-h-[400px] bg-background/50 rounded-lg border-2 border-muted overflow-hidden">
        {/* Background dots pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* SVG for connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <marker
              id="arrowhead-gray"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L9,3 z" fill="#9ca3af" />
            </marker>
            <marker
              id="arrowhead-green"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L9,3 z" fill="#22c55e" />
            </marker>
          </defs>

          {connections.map((conn) => {
            const fromPos = getTrickPosition(conn.from);
            const toPos = getTrickPosition(conn.to);
            const isCompleted =
              completedTricks.has(conn.from) && completedTricks.has(conn.to);

            return (
              <motion.path
                key={`${conn.from}-${conn.to}`}
                d={`M ${fromPos.x} ${fromPos.y} L ${toPos.x} ${toPos.y}`}
                stroke={isCompleted ? "#22c55e" : "#9ca3af"}
                strokeWidth="2"
                strokeDasharray={isCompleted ? "0" : "5,5"}
                fill="none"
                markerEnd={`url(#arrowhead-${isCompleted ? "green" : "gray"})`}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            );
          })}
        </svg>

        {/* Trick nodes */}
        {tricks.map((trick, index) => {
          const isCompleted = completedTricks.has(trick.id);
          return (
            <motion.button
              key={trick.id}
              onClick={() => handleToggle(trick.id)}
              className={`
              absolute px-4 py-3 rounded-lg border-2 cursor-pointer transition-all
              min-w-[140px] text-center font-bold text-sm md:text-sm
              ${
                isCompleted
                  ? "border-[#32792cff] bg-[#36b32bff] shadow-xl text-white"
                  : "bg-white border-gray-300 hover:border-gray-400 shadow-md text-black hover:shadow-lg"
              }
            `}
              style={{
                left: `${trick.x}px`,
                top: `${trick.y}px`,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {trick.label}
            </motion.button>
          );
        })}

        {/* Instructions overlay */}
        <div className="absolute bottom-4 left-4 right-4 text-center pointer-events-none">
          <motion.p
            className="text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full inline-block"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Click tricks to mark as learned and see your progression
          </motion.p>
        </div>
      </div>
    </div>
  );
}
