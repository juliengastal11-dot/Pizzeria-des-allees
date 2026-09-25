"use client";

import Image from "next/image";
import { motion } from "motion/react";

type Props = {
  src: string;
  alt: string;
  /** Rapport largeur / hauteur de l'arche, ex. 3 / 4. */
  ratio?: number;
  sizes: string;
  cadrage?: string;
  /** Cadre chêne clair autour de l'arche (écho aux cadres végétaux de la salle). */
  cadre?: boolean;
  /** Couleur du fond autour (pour l'écart entre l'arche et le cadre). */
  fond?: string;
  className?: string;
  preload?: boolean;
};

/**
 * Photo masquée en arche du Pont Vieux (haut en demi-cercle, bas arrondi).
 * À l'arrivée à l'écran, « la fenêtre s'ouvre » : l'arche monte et l'image se dézoome.
 */
export function ArcheImage({ src, alt, ratio = 3 / 4, sizes, cadrage, cadre = true, fond = "var(--color-nuit)", className, preload }: Props) {
  return (
    <motion.div
      className={`relative isolate overflow-hidden transform-gpu ${className ?? ""}`}
      style={{
        aspectRatio: String(ratio),
        borderRadius: `50% 50% 1.75rem 1.75rem / ${Math.min(50, 50 * ratio)}% ${Math.min(50, 50 * ratio)}% 1.75rem 1.75rem`,
        boxShadow: cadre ? `0 0 0 5px ${fond}, 0 0 0 7px var(--color-chene)` : undefined,
      }}
      initial={{ y: 40, opacity: 0.4 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.15 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image src={src} alt={alt} fill sizes={sizes} preload={preload} className="object-cover" style={{ objectPosition: cadrage }} />
      </motion.div>
    </motion.div>
  );
}
