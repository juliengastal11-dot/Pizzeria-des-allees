"use client";

import Image from "next/image";
import { motion, useReducedMotion, useTransform } from "motion/react";
import { site } from "@/config/site";
import { useProgressionHero } from "./HeroScene";
import { PIZZA } from "./geometrie";

/**
 * La Passejada « sort du tableau » : elle déborde du coin bas droit de l'arche,
 * arrive en tournant, puis tourne doucement et monte au défilement.
 * Décorative (alt vide) : elle est présentée dans La carte.
 */
export function HeroPizza({ className }: { className?: string }) {
  const progression = useProgressionHero();
  const reduire = useReducedMotion();
  const rotation = useTransform(progression, [0, 1], [0, PIZZA.rotationFin]);
  const montee = useTransform(progression, [0, 1], [0, PIZZA.monteeFin]);
  // L'ombre reste sur l'eau : elle s'éloigne et pâlit quand la pizza monte
  const echelleOmbre = useTransform(progression, [0, 1], [1, 0.8]);
  const opaciteOmbre = useTransform(progression, [0, 1], [1, 0.5]);

  return (
    <div aria-hidden className={`pointer-events-none absolute ${className ?? ""}`}>
      <motion.div
        className="absolute inset-x-[4%] -bottom-[16%] h-[34%]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.45 }}
      >
        <motion.div
          className="size-full rounded-[50%] bg-[radial-gradient(closest-side,rgba(3,8,26,0.62),rgba(3,8,26,0.28)_55%,transparent)]"
          style={{ scale: reduire ? 1 : echelleOmbre, opacity: reduire ? 1 : opaciteOmbre }}
        />
      </motion.div>
      <motion.div style={{ rotate: reduire ? 0 : rotation, y: reduire ? 0 : montee }}>
        <motion.div
          initial={{ opacity: 0, y: 40, rotate: -24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 110, damping: 15, mass: 0.9, delay: 0.3, opacity: { duration: 0.4, delay: 0.3 } }}
        >
          <Image
            src={site.hero.pizza}
            alt=""
            width={800}
            height={800}
            sizes="(min-width: 1024px) 230px, (min-width: 640px) 170px, 36vw"
            className="h-auto w-full"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
