"use client";

import Image from "next/image";
import { motion, useTransform } from "motion/react";
import { site } from "@/config/site";
import { useProgressionHero } from "./HeroScene";
import { FOND_DEVANTURE, PAYSAGE } from "./geometrie";
import { MOUVEMENT_REDUIT, useMedia } from "@/components/ui/useMedia";
import styles from "./hero.module.css";

const PHOTO = site.hero.photo;

/**
 * Le haut de page (27/09, choix de Julien) : la devanture de la pizzeria, son
 * enseigne bleu nuit et or, en bannière sur toute la largeur. L'enseigne porte
 * déjà le nom : le H1 est lu par les lecteurs d'écran et les moteurs, sans
 * être répété par-dessus la photo.
 */
export function HeroDevanture({ titreId }: { titreId: string }) {
  const progression = useProgressionHero();
  // Faux au serveur et à l'hydratation : aucun écart, puis la vraie préférence
  const reduire = useMedia(MOUVEMENT_REDUIT);
  const y = useTransform(progression, [0, 1], ["0%", PAYSAGE.yFin]);
  const echelle = useTransform(progression, [0, 1], [1, PAYSAGE.echelleFin]);

  return (
    // data-hero-photo : l'en-tête reste incrusté (bouton menu seul) tant que cette bande passe sous lui
    <div
      data-animation="paysage-hero"
      data-hero-photo
      className={`${styles.bande} relative isolate overflow-hidden`}
      style={{ background: FOND_DEVANTURE }}
    >
      <h1 id={titreId} className="sr-only">
        {site.nom}
        {site.seo.complementTitre}
      </h1>
      <div className={`${styles.paysage} ${styles.cadre} absolute inset-x-0 bottom-0`}>
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{ y: reduire ? 0 : y, scale: reduire ? 1 : echelle }}
        >
          <Image
            src={PHOTO.src}
            alt={PHOTO.alt}
            fill
            preload
            sizes="100vw"
            draggable={false}
            className="object-cover"
            style={{ objectPosition: PHOTO.cadrage }}
          />
        </motion.div>
      </div>
      {/* Téléphone : la nuit au-dessus de la devanture, où flotte le bouton menu */}
      <div aria-hidden className={styles.nuitHaute} />
      {/* La bande se fond dans la nuit, où le Pont Vieux dessiné prend le relais */}
      <div aria-hidden className={styles.fondu} />
    </div>
  );
}
