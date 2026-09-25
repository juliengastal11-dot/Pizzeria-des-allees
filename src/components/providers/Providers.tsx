"use client";

import type { ReactNode } from "react";
import { MotionConfig, useReducedMotion } from "motion/react";
import { ReactLenis } from "lenis/react";
import { ActionsProvider } from "@/components/providers/ActionsProvider";

/**
 * - MotionConfig reducedMotion="user" : toutes les animations Motion respectent
 *   « réduire les animations » de l'appareil (transformations coupées, fondus gardés).
 * - Lenis : défilement fluide à la molette ; le toucher reste natif (mobile).
 */
export function Providers({ children }: { children: ReactNode }) {
  const reduire = useReducedMotion();
  return (
    <MotionConfig reducedMotion="user" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}>
      <ReactLenis
        root
        options={{
          lerp: 0.11,
          smoothWheel: !reduire,
          syncTouch: false,
          // Le décalage de l'en-tête vient de scroll-padding-top (globals.css), que Lenis lit déjà
          anchors: true,
          autoRaf: true,
        }}
      >
        <ActionsProvider>{children}</ActionsProvider>
      </ReactLenis>
    </MotionConfig>
  );
}
