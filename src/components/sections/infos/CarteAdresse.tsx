"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Map as MapIcon, Navigation } from "lucide-react";
import { site } from "@/config/site";
import { remplir } from "@/lib/textes";
import { PlanAllees } from "@/components/sections/infos/PlanAllees";

const { actions } = site.textes;
const TEXTES = site.textes.infos.adresse;

const pression = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.96 },
  transition: { type: "spring", stiffness: 500, damping: 30 },
} as const;

const fondu = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
} as const;

/**
 * Carte « Adresse » au sommet en arche : l'adresse, le plan illustré des Allées
 * (une fenêtre sur la nuit, où la pizzeria s'allume en or) et, seulement si le
 * visiteur le demande, la carte Google Maps (cookies tiers).
 * Mobile : plan à l'horizontale, pour que la carte tienne dans un écran.
 */
export function CarteAdresse() {
  const [carteVisible, setCarteVisible] = useState(false);
  const idCadre = useId();
  const idNote = useId();

  return (
    <article
      data-surface="clair"
      aria-labelledby="infos-adresse"
      className="flex h-full flex-col items-center rounded-[50%_50%_2.5rem_2.5rem/8rem_8rem_2.5rem_2.5rem] bg-calcaire-clair px-5 pb-6 pt-11 text-center text-nuit shadow-[0_40px_80px_-40px_rgba(6,15,46,0.9)] sm:px-8 md:rounded-[50%_50%_2.5rem_2.5rem/9rem_9rem_2.5rem_2.5rem] md:pt-16 lg:rounded-[50%_50%_2.5rem_2.5rem/13rem_13rem_2.5rem_2.5rem] lg:pb-9 lg:pt-20"
    >
      <h3 id="infos-adresse" className="surtitre text-eau">
        {TEXTES.titre}
      </h3>
      <address className="mt-2 font-display text-[clamp(1.5rem,1rem+1.4vw,2.1rem)] font-semibold not-italic leading-[1.1] tracking-[-0.01em] md:mt-3">
        <span className="block">{site.adresse.rue}</span>
        <span className="mt-1 block text-[0.62em] font-medium italic text-eau md:mt-1.5">
          {site.adresse.codePostal} {site.adresse.ville}
        </span>
      </address>

      <div
        id={idCadre}
        className={`relative mt-4 w-full overflow-hidden rounded-[1.75rem] bg-nuit md:mt-6 md:aspect-auto md:min-h-[22rem] md:flex-1 lg:min-h-[16rem] ${
          carteVisible ? "aspect-[4/3]" : "aspect-[432/240]"
        }`}
      >
        <AnimatePresence initial={false} mode="wait">
          {carteVisible ? (
            <motion.iframe
              key="carte"
              src={site.liens.carteIntegree}
              title={remplir(TEXTES.titreCarte, { rue: site.adresse.rue })}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="absolute inset-0 size-full border-0"
              {...fondu}
            />
          ) : (
            <motion.div key="plan" className="absolute inset-0 lg:inset-x-5" {...fondu}>
              <PlanAllees />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-5 flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-1.5 md:mt-6">
        <motion.a
          href={site.liens.itineraire}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-nuit px-6 font-semibold leading-none text-calcaire transition-colors duration-200 hover:bg-grain"
          {...pression}
        >
          <Navigation aria-hidden className="size-[1.05em] shrink-0" strokeWidth={2.2} />
          {actions.itineraire}
          <ArrowUpRight
            aria-hidden
            className="size-[1em] shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
          <span className="sr-only">{` ${actions.nouvelOnglet}`}</span>
        </motion.a>
        {/* Action secondaire : un lien-bouton souligné, sans cadre, pour ne pas concurrencer l'itinéraire */}
        <button
          type="button"
          aria-controls={idCadre}
          aria-describedby={carteVisible ? undefined : idNote}
          onClick={() => setCarteVisible((v) => !v)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-2 font-semibold leading-tight text-nuit underline decoration-eau/50 decoration-1 underline-offset-4 transition-colors duration-200 hover:decoration-nuit"
        >
          <MapIcon aria-hidden className="size-[1.05em] shrink-0" strokeWidth={2.2} />
          {carteVisible ? TEXTES.carteMasquer : TEXTES.carteAfficher}
        </button>
      </div>
      {!carteVisible && (
        <p id={idNote} className="mt-1 max-w-[34ch] text-sm leading-snug text-eau">
          {TEXTES.avertissement}
        </p>
      )}
    </article>
  );
}
