"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { ActionsProvider } from "@/components/providers/ActionsProvider";
import { DefilementDoux } from "@/components/providers/DefilementDoux";

/**
 * - MotionConfig reducedMotion="user" : toutes les animations Motion respectent
 *   « réduire les animations » de l'appareil (transformations coupées, fondus gardés).
 * - DefilementDoux : Lenis à la molette seulement ; le toucher reste natif (mobile).
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}>
      <DefilementDoux>
        <ActionsProvider>{children}</ActionsProvider>
      </DefilementDoux>
    </MotionConfig>
  );
}
