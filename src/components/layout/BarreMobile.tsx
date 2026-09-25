"use client";

import { useId } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { BoutonCommander, BoutonReserver } from "@/components/actions/Boutons";
import { useActions } from "@/components/providers/ActionsProvider";
import { FRISE } from "./pont";

const bouton = "h-full rounded-[22px_22px_14px_14px] px-3! xs:px-5!";

/** Frise des 15 arches : l'or la remplit à mesure que l'on descend dans la page. */
function FriseArches() {
  const id = `frise-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const reduire = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const largeur = useTransform(scrollYProgress, [0, 1], [0, FRISE.largeur]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-8 bottom-full h-3">
      <svg viewBox={`0 0 ${FRISE.largeur} ${FRISE.hauteur}`} preserveAspectRatio="none" className="size-full overflow-visible">
        <defs>
          <clipPath id={id}>
            <motion.rect x="0" y="-2" height={FRISE.hauteur + 4} width={reduire ? FRISE.largeur : largeur} />
          </clipPath>
        </defs>
        <path
          d={FRISE.d}
          fill="none"
          style={{ stroke: "var(--color-or)" }}
          strokeOpacity="0.35"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <g clipPath={`url(#${id})`}>
          <path
            d={FRISE.d}
            style={{ fill: "var(--color-or)", stroke: "var(--color-or-clair)" }}
            fillOpacity="0.22"
            strokeWidth="1.25"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </svg>
    </div>
  );
}

/**
 * Barre Commander / Réserver du mobile, en forme de tablier de pont.
 * Elle arrive quand les boutons du hero quittent l'écran et se retire quand une fenêtre s'ouvre.
 */
export function BarreMobile() {
  const { ctaHeroVisibles, fenetreOuverte } = useActions();
  const surAccueil = usePathname() === "/";
  const visible = !(surAccueil && ctaHeroVisibles) && !fenetreOuverte;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="barre-mobile"
          role="group"
          aria-label="Commander ou réserver"
          className="fixed inset-x-3 z-40 md:hidden"
          style={{ bottom: "calc(12px + env(safe-area-inset-bottom))" }}
          initial={{ y: "130%" }}
          animate={{ y: 0 }}
          exit={{ y: "130%" }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.55 }}
        >
          <FriseArches />
          <div className="grid h-16 grid-cols-[1.2fr_1fr] gap-1.5 rounded-[30px_30px_20px_20px] border border-filet/60 bg-minuit p-1.5 shadow-[0_12px_28px_rgba(6,15,46,0.45)]">
            <BoutonCommander variante="or" forme="libre" className={bouton} />
            <BoutonReserver variante="contour" forme="libre" className={bouton}>
              Réserver<span className="sr-only"> une table</span>
            </BoutonReserver>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
