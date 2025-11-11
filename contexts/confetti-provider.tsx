"use client";
import React, {
  createContext,
  useContext,
  useRef,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import confetti from "canvas-confetti";
import { soundManager } from "@/utils/sound-manager";

// Public API types
export interface ConfettiContextValue {
  // Basic celebratory burst
  celebrate: () => void;
  // Heavier firework style
  fireworks: () => void;
  // Custom dispatch allowing overrides
  shoot: (options?: confetti.Options & { particleRatio?: number }) => void;
  // Whether provider is currently cooling down (calls ignored)
  isCoolingDown: boolean;
}

const ConfettiContext = createContext<ConfettiContextValue | null>(null);

interface ConfettiProviderProps {
  children: ReactNode;
}

/*
  ConfettiProvider mounts ONE fullscreen canvas (pointer-events none) and exposes
  a few convenience helpers. This avoids creating a new canvas per component and
  allows any client component to trigger bursts through the useConfetti hook.
*/
export const ConfettiProvider: React.FC<ConfettiProviderProps> = ({
  children,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const confettiRef = useRef<confetti.CreateTypes | null>(null);
  const [coolingDown, setCoolingDown] = React.useState(false);
  const COOLDOWN_MS = 2500;

  const beginCooldown = useCallback(() => {
    setCoolingDown(true);
    setTimeout(() => setCoolingDown(false), COOLDOWN_MS);
  }, []);

  // Resize canvas to viewport when mounted/resized
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    resize();
    window.addEventListener("resize", resize);

    // Create confetti instance bound to our canvas
    confettiRef.current = confetti.create(canvasRef.current, {
      resize: true, // let confetti handle internal resize as well
      useWorker: true,
    });

    return () => {
      window.removeEventListener("resize", resize);
      confettiRef.current?.reset();
    };
  }, [resize]);

  const baseFire = useCallback(
    (particleRatio: number, opts: confetti.Options) => {
      confettiRef.current?.({
        origin: { y: 0.7 },
        ...opts,
        particleCount: Math.floor(200 * particleRatio),
      });
    },
    []
  );

  const celebrate = useCallback(() => {
    if (coolingDown) return;
    // Play a general notification sound when celebration begins
    try {
      // Ensure at least the general sound is available (idempotent if already preloaded elsewhere)
      soundManager.preload("general", "/sounds/general.mp3");
      soundManager.play("general", 0.5);
    } catch {}
    baseFire(0.25, { spread: 26, startVelocity: 55 });
    baseFire(0.2, { spread: 60 });
    baseFire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    baseFire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    baseFire(0.1, { spread: 120, startVelocity: 45 });
    setTimeout(() => {
      confettiRef.current?.({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [
          "#ff0000",
          "#00ff00",
          "#0000ff",
          "#ffff00",
          "#ff00ff",
          "#00ffff",
        ],
      });
    }, 300);
    setTimeout(() => {
      confettiRef.current?.({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.8 },
        colors: ["#ffd700", "#ff6347", "#98fb98", "#87ceeb"],
      });
    }, 600);
    beginCooldown();
  }, [baseFire, coolingDown, beginCooldown]);

  const fireworks = useCallback(() => {
    if (coolingDown) return;
    // Simple fireworks style: bursts from random positions
    const shots = 5;
    for (let i = 0; i < shots; i++) {
      setTimeout(() => {
        confettiRef.current?.({
          particleCount: 80,
          spread: 70,
          startVelocity: 50,
          ticks: 200,
          gravity: 0.7,
          origin: { x: Math.random(), y: Math.random() * 0.4 + 0.1 },
          scalar: 0.9,
        });
      }, i * 300);
    }
    beginCooldown();
  }, [coolingDown, beginCooldown]);

  const shoot = useCallback(
    (options?: confetti.Options & { particleRatio?: number }) => {
      if (coolingDown) return;
      if (!options) {
        confettiRef.current?.({
          particleCount: 40,
          spread: 45,
          origin: { y: 0.7 },
        });
      } else {
        const { particleRatio, ...rest } = options;
        const count = particleRatio
          ? Math.floor(200 * particleRatio)
          : rest.particleCount;
        confettiRef.current?.({ ...rest, particleCount: count });
      }
      beginCooldown();
    },
    [coolingDown, beginCooldown]
  );

  const value: ConfettiContextValue = {
    celebrate,
    fireworks,
    shoot,
    isCoolingDown: coolingDown,
  };

  return (
    <ConfettiContext.Provider value={value}>
      {children}
      {/* Layered above app content but below modals; pointer events off */}
      <canvas
        ref={canvasRef}
        id="global-confetti-canvas"
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 50,
        }}
        aria-hidden="true"
      />
    </ConfettiContext.Provider>
  );
};

export function useConfetti(): ConfettiContextValue {
  const ctx = useContext(ConfettiContext);
  if (!ctx)
    throw new Error("useConfetti must be used within a ConfettiProvider");
  return ctx;
}
