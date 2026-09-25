"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { animate } from "motion/react";
import { ENTREE, preparerApparition } from "./apparition";

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
 * Le serveur rend la photo en place : l'effet n'est préparé qu'après le montage,
 * si l'arche est encore hors écran (voir preparerApparition).
 */
export function ArcheImage({ src, alt, ratio = 3 / 4, sizes, cadrage, cadre = true, fond = "var(--color-nuit)", className, preload }: Props) {
  const refArche = useRef<HTMLDivElement>(null);
  const refPhoto = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const arche = refArche.current;
    const photo = refPhoto.current;
    if (!arche || !photo) return;
    return preparerApparition(
      arche,
      () => {
        arche.style.opacity = "0.4";
        arche.style.transform = "translateY(40px)";
        photo.style.transform = "scale(1.15)";
      },
      () => {
        animate(arche, { opacity: [0.4, 1], y: [40, 0] }, { duration: 0.9, ease: ENTREE });
        animate(photo, { scale: [1.15, 1] }, { duration: 1.1, ease: ENTREE });
      },
      0.3,
    );
  }, []);

  return (
    <div
      ref={refArche}
      className={`relative isolate overflow-hidden transform-gpu ${className ?? ""}`}
      style={{
        aspectRatio: String(ratio),
        borderRadius: `50% 50% 1.75rem 1.75rem / ${Math.min(50, 50 * ratio)}% ${Math.min(50, 50 * ratio)}% 1.75rem 1.75rem`,
        boxShadow: cadre ? `0 0 0 5px ${fond}, 0 0 0 7px var(--color-chene)` : undefined,
      }}
    >
      <div ref={refPhoto} className="absolute inset-0">
        <Image src={src} alt={alt} fill sizes={sizes} preload={preload} className="object-cover" style={{ objectPosition: cadrage }} />
      </div>
    </div>
  );
}
