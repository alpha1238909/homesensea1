"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const randomColors = (count: number) =>
  Array.from({ length: count }, () =>
    `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`,
  );

type TubesApp = {
  tubes?: {
    setColors?: (colors: string[]) => void;
    setLightsColors?: (colors: string[]) => void;
  };
  destroy?: () => void;
};

interface TubesBackgroundProps {
  children?: ReactNode;
  className?: string;
  enableClickInteraction?: boolean;
}

export function TubesBackground({
  children,
  className,
  enableClickInteraction = true,
}: TubesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tubesRef = useRef<TubesApp | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const initTubes = async () => {
      try {
        // Runtime import keeps the WebGL effect replaceable and out of the server bundle.
        const importFromCdn = new Function("url", "return import(url)") as (
          url: string,
        ) => Promise<{ default: (target: HTMLCanvasElement, options: unknown) => TubesApp }>;
        const tubesModule = await importFromCdn(
          "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js",
        );
        if (!mounted) return;
        tubesRef.current = tubesModule.default(canvas, {
          tubes: {
            colors: ["#818cf8", "#2dd4bf", "#5262d9"],
            lights: {
              intensity: 180,
              colors: ["#2dd4bf", "#818cf8", "#fcd34d", "#64b5f6"],
            },
          },
        });
        setIsLoaded(true);
      } catch (error) {
        console.error("HomeSense background could not load", error);
        if (mounted) setIsLoaded(true);
      }
    };

    void initTubes();
    return () => {
      mounted = false;
      tubesRef.current?.destroy?.();
      tubesRef.current = null;
    };
  }, []);

  const handleClick = () => {
    if (!enableClickInteraction) return;
    tubesRef.current?.tubes?.setColors?.(randomColors(3));
    tubesRef.current?.tubes?.setLightsColors?.(randomColors(4));
  };

  return (
    <div className={cn("relative min-h-screen w-full overflow-hidden bg-[#071426]", className)} onClick={handleClick}>
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" style={{ touchAction: "none" }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_25%,rgba(7,20,38,.05),rgba(7,20,38,.72)_58%,#071426_100%)]" />
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            className="absolute inset-0 bg-[#071426]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
          />
        )}
      </AnimatePresence>
      <div className="relative z-10 min-h-screen w-full pointer-events-none">{children}</div>
    </div>
  );
}

export default TubesBackground;
