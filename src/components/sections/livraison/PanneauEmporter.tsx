"use client";

import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { Navigation } from "lucide-react";
import { BoutonCommander } from "@/components/actions/Boutons";
import { adresseComplete, estPlaceholder, site } from "@/config/site";
import { TEXTES } from "./textes";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Panneau « À emporter » : trois étapes en ovales, comme les écluses de Fonseranes.
 * Sur grand écran chaque bassin est 12 px plus haut que le précédent ; ils se remplissent l'un après l'autre.
 * Sur mobile, les bassins descendent en escalier.
 */
export function PanneauEmporter() {
  const derniere = TEXTES.etapes.length - 1;

  return (
    <div>
      <h3 className="font-display text-[1.6rem] font-semibold italic leading-tight text-calcaire">{TEXTES.emporterTitre}</h3>

      <ol role="list" className="mt-8 flex flex-col gap-3 lg:mt-14 lg:flex-row lg:items-end lg:gap-7">
        {TEXTES.etapes.map((titre, i) => (
          <motion.li
            key={titre}
            className="lg:flex-1"
            initial={{ y: 24 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, delay: i * 0.12, ease: EASE }}
          >
            <div
              className="relative ml-(--retrait) lg:mb-(--marche) lg:ml-0"
              style={{ "--retrait": `${i * 1.25}rem`, "--marche": `${i * 12}px` } as CSSProperties}
            >
              <div className="relative flex min-h-[5.5rem] items-center gap-4 overflow-hidden rounded-full border border-filet bg-grain py-4 pl-6 pr-7 lg:aspect-[1.4] lg:flex-col lg:justify-center lg:gap-2 lg:rounded-[50%] lg:px-10 lg:text-center">
                {/* L'eau monte dans le bassin */}
                <motion.span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-1/2 origin-bottom bg-[linear-gradient(to_top,rgba(95,127,160,0.22),rgba(95,127,160,0.05))]"
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: 0.35 + i * 0.35, ease: EASE }}
                />
                <span className="relative font-display text-[2.1rem] font-semibold leading-none text-or-clair lg:text-[2.4rem]">{i + 1}</span>
                <div className="relative">
                  <p className="text-[1.0625rem] font-semibold leading-snug text-calcaire">{titre}</p>
                  {i === derniere && <p className="mt-1 text-[0.9375rem] leading-snug text-pierre">{adresseComplete}</p>}
                </div>
              </div>
              {i < derniere && (
                <span
                  aria-hidden
                  className="absolute left-full top-1/2 hidden h-[3px] w-[1.9rem] origin-left -translate-y-1/2 -rotate-[23deg] rounded-full bg-orb/70 lg:block"
                />
              )}
            </div>
          </motion.li>
        ))}
      </ol>

      <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 lg:mt-12">
        <BoutonCommander>{TEXTES.boutonEmporter}</BoutonCommander>
        {!estPlaceholder(site.liens.itineraire) && (
          <a
            href={site.liens.itineraire}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-2 font-semibold text-calcaire underline decoration-filet decoration-1 underline-offset-[6px] transition-colors duration-200 hover:text-or-clair hover:decoration-or-clair"
          >
            <Navigation aria-hidden className="size-[1.05em] shrink-0 text-or-clair" strokeWidth={2.2} />
            {TEXTES.itineraire}
            <span className="sr-only"> (nouvel onglet)</span>
          </a>
        )}
      </div>
    </div>
  );
}
