// @ts-nocheck

"use client";

import React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useReducedMotion,
  useAnimationFrame,
  MotionValue,
} from "framer-motion";

type Props = {
  intensity?: number; // tweak parallax intensity 0.5 - 1.5
};

const SPRING = { damping: 40, stiffness: 90, mass: 0.35 };

/**
 * BackgroundAnimation
 * - Next.js + TypeScript + Tailwind (shadcn token-friendly classes)
 * - Framer Motion: scroll-parallax + idle/wind motion + springs
 *
 * Minimal install:
 *   pnpm add framer-motion
 *   (Tailwind + shadcn tokens recommended)
 */

export default function BackgroundAnimation({ intensity = 1 }: Props) {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // Base scroll-driven transforms (numbers in px / deg)
  const rawLeafX = useTransform(scrollYProgress, [0, 1], [-140 * intensity, 160 * intensity]);
  const rawLeafY = useTransform(scrollYProgress, [0, 1], [-6 * intensity, 46 * intensity]);
  const rawLeafR = useTransform(scrollYProgress, [0, 1], [-4, 18]);

  const rawSeedX = useTransform(scrollYProgress, [0, 1], [130 * intensity, -140 * intensity]);
  const rawSeedY = useTransform(scrollYProgress, [0, 1], [18, -36]);
  const rawSeedR = useTransform(scrollYProgress, [0, 1], [6, -14]);

  const rawPolyX = useTransform(scrollYProgress, [0, 1], [-80 * intensity, 120 * intensity]);
  const rawPolyY = useTransform(scrollYProgress, [0, 1], [-12, 28]);
  const rawPolyR = useTransform(scrollYProgress, [0, 1], [-2, 10]);

  // Idle float motion (slow sine wave) & wind micro-jitter
  const idle = useMotionValue(0);
  const wind = useMotionValue(0);

  useAnimationFrame((t: number) => {
    // t is milliseconds-ish; scale down for gentle motion
    // Idle: slow vertical float (px)
    idle.set(Math.sin(t / 2200) * 8); // ~8px float
    // Wind: slow micro horizontal jitter (px)
    wind.set(Math.sin(t / 1400) * 2.2 + Math.cos(t / 900) * 1.2);
  });

  // Combine base scroll transforms with idle & wind using useTransform arrays.
  // This avoids using translateX/translateY style props directly and keeps types happy.

  const leafX = useSpring(
    useTransform([rawLeafX, wind], ([sx, w]) => sx + w),
    SPRING
  );
  const leafY = useSpring(
    useTransform([rawLeafY, idle], ([sy, id]) => sy + id),
    SPRING
  );
  const leafR = useSpring(rawLeafR, SPRING);

  const seedX = useSpring(
    useTransform([rawSeedX, wind], ([sx, w]) => sx + w * 0.6),
    SPRING
  );
  const seedY = useSpring(
    useTransform([rawSeedY, idle], ([sy, id]) => sy + id * 0.6),
    SPRING
  );
  const seedR = useSpring(rawSeedR, SPRING);

  const polyX = useSpring(
    useTransform([rawPolyX, wind], ([sx, w]) => sx + w * 0.9),
    SPRING
  );
  const polyY = useSpring(
    useTransform([rawPolyY, idle], ([sy, id]) => sy + id * 0.9),
    SPRING
  );
  const polyR = useSpring(rawPolyR, SPRING);

  // For reduced motion users: provide subtle static layout (no animation).
  if (prefersReducedMotion) {
    return (
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* Soft background wash */}
        <div className="absolute inset-0 bg-accent/12" aria-hidden />

        {/* Static SVG shapes (minimal, no motion) */}
        <div className="absolute top-12 left-6 w-44 h-44 opacity-70">
          <svg viewBox="0 0 200 200" className="w-full h-full text-primary/50">
            <path d="M100 15c-30 20-55 46-65 76-8 23 2 44 20 56 18 12 43 13 63 3 22-11 39-33 46-58 7-25 4-53-12-66-13-11-33-13-52-11z" fill="currentColor" />
          </svg>
        </div>

        <div className="absolute bottom-20 right-14 w-36 h-36 opacity-60">
          <svg viewBox="0 0 160 160" className="w-full h-full text-secondary/50">
            <polygon points="80,12 120,40 148,88 128,128 80,148 32,128 12,88 40,40" fill="currentColor" />
          </svg>
        </div>

        <div className="absolute top-2/4 left-3/4 w-44 h-44 opacity-60">
          <svg viewBox="0 0 220 220" className="w-full h-full text-primary/40">
            <polygon points="110,20 170,60 190,120 150,180 90,200 40,150 30,90 70,40" fill="currentColor" />
          </svg>
        </div>
      </div>
    );
  }

  // Helper to coerce MotionValue<number> type for style props
  const mv = (v: MotionValue<number>) => v as unknown as number | MotionValue<number>;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Soft layered wash & subtle mid glow */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20"
        style={{
          // Use shadcn token friendly class for color mixing; fallback in comments
          background:
            "linear-gradient(180deg, rgba(34,197,94,0.04), rgba(250,204,21,0.02))",
        }}
      />

      {/* Very subtle grain/noise via CSS radial gradients (no external asset) */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "6px 6px, 10px 10px",
          mixBlendMode: "overlay",
        }}
      />

      <motion.svg
        viewBox="0 0 1200 400"
        className="absolute left-0 top-0 w-[1200px] max-w-none opacity-30 blur-[6px] -translate-y-8 text-accent/20"
        style={{
          x: mv(useSpring(useTransform(scrollYProgress, [0, 1], [ -20 * intensity, 20 * intensity ]), SPRING)),
        }}
        aria-hidden
      >
        <defs>
          <linearGradient id="contourG" x1="0" x2="1">
            <stop offset="0%" stopColor="rgba(34,197,94,0.12)" />
            <stop offset="100%" stopColor="rgba(34,197,94,0.02)" />
          </linearGradient>
        </defs>
        <path
          d="M0 140 C160 90, 320 60, 480 86 C640 112, 800 180, 960 150 C1120 120, 1200 100, 1200 100 L1200 400 L0 400 Z"
          fill="url(#contourG)"
        />
      </motion.svg>

      {/* Stylized Leaf (main focal decorative shape) */}
      <motion.svg
        role="img"
        aria-label="Decorative organic leaf"
        viewBox="0 0 200 200"
        className="absolute top-[6%] left-[4%] w-28 sm:w-36 md:w-52 lg:w-64 text-primary/60 drop-shadow-[0_8px_24px_rgba(16,185,129,0.06)]"
        style={{ x: leafX as unknown as number | MotionValue<number>, y: leafY as unknown as MotionValue<number>, rotate: leafR as unknown as MotionValue<number> }}
      >
        <defs>
          <linearGradient id="leafGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="rgba(34,197,94,0.18)" />
            <stop offset="100%" stopColor="rgba(34,197,94,0.04)" />
          </linearGradient>
        </defs>
        <path
          d="M100 18c-28 18-50 42-60 70-7 22 3 41 20 53 17 11 42 12 62 3 21-10 36-30 44-54 7-23 3-50-12-63-12-10-30-12-54-12z"
          fill="url(#leafGrad)"
          stroke="rgba(34,197,94,0.22)"
          strokeWidth={1.2}
        />
        <path
          d="M98 30c-6 18-12 36-18 54M75 72c13 6 26 12 39 18"
          stroke="rgba(34,197,94,0.36)"
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
        />
      </motion.svg>

      {/* Seed/Grain Cluster (secondary decorative) */}
      <motion.svg
        role="img"
        aria-label="Decorative seed cluster"
        viewBox="0 0 160 160"
        className="absolute bottom-[12%] right-[8%] w-20 sm:w-28 md:w-40 lg:w-56 text-secondary/55 opacity-80"
        style={{ x: seedX as unknown as MotionValue<number>, y: seedY as unknown as MotionValue<number>, rotate: seedR as unknown as MotionValue<number> }}
      >
        <defs>
          <linearGradient id="seedG" x1="0" x2="1">
            <stop offset="0%" stopColor="rgba(250,204,21,0.14)" />
            <stop offset="100%" stopColor="rgba(250,204,21,0.04)" />
          </linearGradient>
        </defs>

        <g transform="translate(0,0)">
          <polygon points="80,12 120,40 148,88 128,128 80,148 32,128 12,88 40,40" fill="url(#seedG)" />
          <g fill="rgba(255,255,255,0.06)" transform="translate(12,12)">
            {/* small seed dust dots */}
            <circle cx="8" cy="8" r="1.4" />
            <circle cx="22" cy="6" r="1.6" />
            <circle cx="36" cy="12" r="1.2" />
            <circle cx="50" cy="8" r="1.4" />
            <circle cx="64" cy="18" r="1.1" />
          </g>
        </g>
      </motion.svg>

      {/* Abstract low-poly polygon (depth layer) */}
      <motion.svg
        role="img"
        aria-label="Decorative abstract polygon"
        viewBox="0 0 220 220"
        className="absolute top-[42%] left-[60%] w-28 sm:w-36 md:w-44 lg:w-56 text-primary/40 opacity-75"
        style={{ x: polyX as unknown as MotionValue<number>, y: polyY as unknown as MotionValue<number>, rotate: polyR as unknown as MotionValue<number> }}
      >
        <polygon points="110,20 170,60 190,120 150,180 90,200 40,150 30,90 70,40" fill="currentColor" />
        <polyline points="110,20 170,60 190,120 150,180 90,200 40,150 30,90 70,40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={2} />
      </motion.svg>

      {/* Subtle vignette/gradients for depth */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.04) 100%)" }} />
      </div>
    </div>
  );
}
