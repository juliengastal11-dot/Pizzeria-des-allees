"use client";

import Image from "next/image";
import { useId, useRef, useState, type RefObject } from "react";
import { motion, useScroll, useTransform, type Variants } from "motion/react";
import { Flame } from "lucide-react";
import type { Pizza } from "@/config/site";
import { Valeur } from "@/components/ui/Valeur";
import { BadgeDuMoment } from "./BadgeDuMoment";

// Arche du Pont Vieux : 50cqw = la moitié de la largeur de la carte, donc un haut en demi-cercle.
const ARCHE = "50cqw 50cqw 1.75rem 1.75rem";
const ARCHE_FILET = "calc(50cqw - 0.5rem) calc(50cqw - 0.5rem) 1.25rem 1.25rem";

// Apparition échelonnée (lue depuis la liste parente : "cache" → "visible").
const ENTREE: Variants = {
  cache: { opacity: 0, y: 36 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: (i % 3) * 0.09 + Math.floor(i / 3) * 0.14 },
  }),
};

const RESSORT = { type: "spring", stiffness: 220, damping: 15 } as const;

const PASTILLE = "inline-flex min-h-8 items-center gap-1.5 rounded-full px-3.5 text-[0.875rem] font-semibold leading-none text-nuit";

type Props = {
  pizza: Pizza;
  index: number;
  /** Le carrousel qui défile horizontalement (mobile). */
  defileur: RefObject<HTMLDivElement | null>;
  /** La pizza roule en traversant le centre du carrousel. */
  roule: boolean;
  /** Au survol de la souris, la pizza tourne et se soulève. */
  survolActif: boolean;
};

/**
 * Une pizza posée sur une arche de pierre claire : l'image ronde déborde
 * du sommet de l'arche, le nom et la garniture sont dessous.
 */
export function CartePizza({ pizza, index, defileur, roule, survolActif }: Props) {
  const ref = useRef<HTMLLIElement>(null);
  const titreId = useId();
  const [survol, setSurvol] = useState(false);

  const { scrollXProgress } = useScroll({
    container: defileur,
    target: ref,
    axis: "x",
    offset: ["start end", "end start"],
  });
  // 0,5 = carte centrée. Elle arrive par la droite et roule vers la gauche.
  const rotate = useTransform(scrollXProgress, [0, 0.5, 1], [12, 0, -12]);
  const scale = useTransform(scrollXProgress, [0, 0.5, 1], [0.92, 1, 0.92]);

  const leve = survol && survolActif;

  return (
    <motion.li
      ref={ref}
      data-pizza
      custom={index}
      variants={ENTREE}
      className="@container flex w-(--carte) shrink-0 snap-center snap-always lg:w-auto lg:nth-[3n+2]:mt-14"
    >
      <article
        aria-labelledby={titreId}
        onPointerEnter={(e) => e.pointerType === "mouse" && setSurvol(true)}
        onPointerLeave={() => setSurvol(false)}
        className="relative flex w-full flex-col bg-calcaire-clair shadow-[0_28px_50px_-30px_rgba(5,26,75,0.6)]"
        style={{ borderRadius: ARCHE }}
      >
        {/* Filet chêne qui suit l'arche, comme les cadres de la salle */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-2 border border-chene/45"
          style={{ borderRadius: ARCHE_FILET }}
        />

        <div aria-hidden className="relative mx-auto -mt-[22%] aspect-square w-[80%]">
          <motion.span
            className="absolute inset-x-[12%] -bottom-[2%] h-[14%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(5,26,75,0.32),rgba(5,26,75,0))]"
            animate={leve ? { opacity: 0.55, scale: 0.86 } : { opacity: 1, scale: 1 }}
            transition={RESSORT}
          />
          <motion.div className="absolute inset-0" style={roule ? { rotate, scale } : { rotate: 0, scale: 1 }}>
            <motion.div
              className="relative size-full"
              animate={leve ? { rotate: 25, y: -10 } : { rotate: 0, y: 0 }}
              transition={RESSORT}
            >
              <Image
                src={pizza.image}
                alt=""
                fill
                sizes="(min-width: 452px) 282px, 63vw"
                draggable={false}
                className="select-none object-contain"
              />
            </motion.div>
          </motion.div>
        </div>

        <div className="flex flex-1 flex-col px-6 pb-7 pt-3 text-center sm:px-7">
          <h3 id={titreId} className="font-display text-[1.45rem] font-semibold leading-tight text-nuit">
            {pizza.nom}
          </h3>
          {pizza.duMoment && <BadgeDuMoment />}
          <p className="mt-2 text-[0.96875rem] leading-relaxed text-eau">{pizza.description}</p>
          {pizza.prix && (
            <p className="mt-3 font-display text-xl font-semibold tabular-nums text-nuit">
              <Valeur valeur={pizza.prix} />
            </p>
          )}
          <ul className="mt-auto flex flex-wrap justify-center gap-2 pt-5">
            <li className={`${PASTILLE} bg-ciel-pale`}>Base {pizza.base}</li>
            {pizza.vegetarienne && <li className={`${PASTILLE} ring-1 ring-inset ring-nuit/35`}>Végétarienne</li>}
            {pizza.pimentee && (
              <li className={`${PASTILLE} bg-or-clair`}>
                <Flame aria-hidden className="size-3.5 shrink-0" strokeWidth={2.4} />
                Pimentée
              </li>
            )}
          </ul>
        </div>
      </article>
    </motion.li>
  );
}
