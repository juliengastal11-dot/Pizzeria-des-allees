"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";
import { useScroll, type MotionValue } from "motion/react";

const Progression = createContext<MotionValue<number> | null>(null);

/**
 * La section du hero : elle mesure son propre défilement (0 en haut de page,
 * 1 quand son bas passe le haut de l'écran) et le partage à la fenêtre,
 * à la pizza et au pont.
 */
export function HeroScene({ titreId, className, children }: { titreId: string; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  return (
    <section ref={ref} id="accueil" aria-labelledby={titreId} className={className}>
      <Progression.Provider value={scrollYProgress}>{children}</Progression.Provider>
    </section>
  );
}

export function useProgressionHero(): MotionValue<number> {
  const progression = useContext(Progression);
  if (!progression) throw new Error("useProgressionHero doit être utilisé dans <HeroScene>");
  return progression;
}
