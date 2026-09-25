"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { useMotionValueEvent } from "motion/react";
import { useActions } from "@/components/providers/ActionsProvider";
import { useProgressionHero } from "./HeroScene";

/** Part visible exigée de chaque arche-bouton pour que l'en-tête et la barre mobile n'en rajoutent pas. */
const SEUIL_VISIBLE = 0.9;

/**
 * Enveloppe cliente du pont :
 * - une seule valeur de défilement pilote toutes les lumières, écrite en --p sur le conteneur
 *   (les travées la lisent en CSS : aucun composant animé, rien à hydrater par point) ;
 * - tant que Commander et Réserver sont entiers à l'écran sous l'en-tête, on le signale
 *   (setCtaHeroVisibles) pour que l'en-tête et la barre mobile ne les répètent pas.
 */
export function PontScene({ className, style, children }: { className?: string; style?: CSSProperties; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const progression = useProgressionHero();
  const { setCtaHeroVisibles } = useActions();

  useMotionValueEvent(progression, "change", (p) => ref.current?.style.setProperty("--p", p.toFixed(3)));
  useEffect(() => {
    ref.current?.style.setProperty("--p", progression.get().toFixed(3));
  }, [progression]);

  useEffect(() => {
    const racine = ref.current;
    if (!racine) return;
    const cibles = [...racine.querySelectorAll<HTMLElement>("[data-arche-bouton]")];
    if (cibles.length === 0) return;
    const entete = document.querySelector<HTMLElement>("header");
    const parts = new Map<Element, number>();
    let observateur: IntersectionObserver | undefined;
    let hauteurEntete = -1;

    // La marge haute suit la hauteur réelle de l'en-tête (encoche comprise : env(safe-area-inset-top))
    const observer = () => {
      const hauteur = Math.ceil(entete?.getBoundingClientRect().height ?? 0);
      if (hauteur === hauteurEntete) return;
      hauteurEntete = hauteur;
      observateur?.disconnect();
      parts.clear();
      observateur = new IntersectionObserver(
        (entrees) => {
          for (const e of entrees) parts.set(e.target, e.isIntersecting ? e.intersectionRatio : 0);
          setCtaHeroVisibles(cibles.every((c) => (parts.get(c) ?? 0) >= SEUIL_VISIBLE));
        },
        { rootMargin: `-${hauteur}px 0px 0px 0px`, threshold: [0, SEUIL_VISIBLE, 1] },
      );
      cibles.forEach((c) => observateur?.observe(c));
    };

    observer();
    const redimension = entete ? new ResizeObserver(observer) : undefined;
    if (entete) redimension?.observe(entete);
    return () => {
      redimension?.disconnect();
      observateur?.disconnect();
      setCtaHeroVisibles(false);
    };
  }, [setCtaHeroVisibles]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
