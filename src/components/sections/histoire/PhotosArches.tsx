"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArcheImage } from "@/components/ui/ArcheImage";
import type { Photo } from "@/config/site";
import { typographie } from "./outils";
import { BUREAU, MOUVEMENT_REDUIT, useMedia } from "./useMedia";

const RATIO_GRANDE = 0.72;
const RATIO_PETITE = 0.8;

/** Rayon d'arche (haut en demi-cercle) pour un rapport largeur / hauteur donné. */
function rayonArche(ratio: number) {
  const v = Math.min(50, 50 * ratio);
  return `50% 50% 1.75rem 1.75rem / ${v}% ${v}% 1.75rem 1.75rem`;
}

type Props = { grande?: Photo; petite?: Photo; className?: string };

/**
 * Deux arches qui se chevauchent : la grande à droite, la petite posée sur son pied gauche.
 * Sur ordinateur, léger parallaxe : la petite avance plus vite que la grande.
 */
export function PhotosArches({ grande, petite, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const bureau = useMedia(BUREAU);
  const reduire = useMedia(MOUVEMENT_REDUIT);
  const actif = bureau && !reduire;

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yGrande = useTransform(scrollYProgress, [0, 1], actif ? [36, -36] : [0, 0]);
  const yPetite = useTransform(scrollYProgress, [0, 1], actif ? [96, -96] : [0, 0]);
  // L'arche en filet reste un peu en arrière de la grande photo
  const yEcho = useTransform(scrollYProgress, [0, 1], actif ? [-18, 18] : [0, 0]);

  if (!grande && !petite) return null;

  return (
    <div
      ref={ref}
      className={`mx-auto grid w-full max-w-[30rem] md:ml-auto md:mr-6 lg:mx-0 lg:max-w-none ${className ?? ""}`}
    >
      {grande && (
        <motion.figure style={{ y: yGrande }} className="col-start-1 row-start-1 ml-auto w-[72%]">
          <div className="relative">
            <motion.span
              aria-hidden
              style={{ y: yEcho, borderRadius: rayonArche(RATIO_GRANDE) }}
              className="absolute -right-3 -top-3 bottom-3 left-3 border border-filet/60"
            >
              <span className="absolute left-1/2 top-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-halo shadow-[0_0_10px_2px_rgba(242,211,140,0.55)]" />
            </motion.span>
            <ArcheImage
              src={grande.src}
              alt={grande.alt}
              ratio={RATIO_GRANDE}
              cadrage={grande.cadrage}
              sizes="(min-width: 1024px) 340px, (min-width: 520px) 350px, 72vw"
            />
          </div>
          <figcaption className="mt-4 text-right font-display text-[0.98rem] italic leading-snug text-pierre">
            {typographie(grande.legende)}
          </figcaption>
        </motion.figure>
      )}

      {petite && (
        <motion.figure
          style={{ y: yPetite }}
          className={`relative z-10 col-start-1 row-start-1 w-[46%] self-start ${grande ? "mt-[64%]" : ""}`}
        >
          <ArcheImage
            src={petite.src}
            alt={petite.alt}
            ratio={RATIO_PETITE}
            cadrage={petite.cadrage}
            sizes="(min-width: 520px) 230px, 46vw"
          />
          <figcaption className="mt-4 font-display text-[0.98rem] italic leading-snug text-pierre">
            {typographie(petite.legende)}
          </figcaption>
        </motion.figure>
      )}
    </div>
  );
}
