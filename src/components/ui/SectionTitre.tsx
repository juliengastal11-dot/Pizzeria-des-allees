"use client";

import { motion } from "motion/react";

type Props = {
  surtitre: string;
  titre: string;
  intro?: string;
  id?: string;
  /** "clair" pour les fonds clairs (La carte) : textes en bleu. */
  surface?: "sombre" | "clair";
  align?: "gauche" | "centre";
  className?: string;
};

/**
 * Surtitre + titre H2 (qui sort d'un masque ligne par ligne) + chapô.
 * Le masque a une marge verticale compensée pour ne jamais couper les accents.
 */
export function SectionTitre({ surtitre, titre, intro, id, surface = "sombre", align = "gauche", className }: Props) {
  const clair = surface === "clair";
  return (
    <div className={`${align === "centre" ? "mx-auto text-center" : ""} max-w-3xl ${className ?? ""}`}>
      <p className={`surtitre flex items-center gap-2.5 ${align === "centre" ? "justify-center" : ""} ${clair ? "text-nuit" : "text-pierre"}`}>
        <span aria-hidden className={`inline-block size-1.5 rounded-full ${clair ? "bg-nuit" : "bg-or shadow-[0_0_10px_2px_rgba(242,211,140,0.55)]"}`} />
        {surtitre}
      </p>
      <h2 id={id} className={`mt-4 text-[clamp(2.1rem,1.4rem+3.4vw,3.9rem)] font-semibold tracking-[-0.018em] ${clair ? "text-nuit" : "text-calcaire"}`}>
        {/* On observe le masque (immobile) et non le texte : un élément entièrement
            hors de son parent overflow-hidden n'est jamais « visible » pour l'IntersectionObserver. */}
        <motion.span
          className="-my-[0.15em] block overflow-hidden py-[0.15em]"
          initial="cache"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.span
            className="block"
            variants={{ cache: { y: "105%" }, visible: { y: "0%" } }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {titre}
          </motion.span>
        </motion.span>
      </h2>
      {intro && (
        <p className={`mt-5 max-w-[62ch] text-[1.0625rem] leading-relaxed ${align === "centre" ? "mx-auto" : ""} ${clair ? "text-nuit/90" : "text-pierre"}`}>
          {intro}
        </p>
      )}
    </div>
  );
}
