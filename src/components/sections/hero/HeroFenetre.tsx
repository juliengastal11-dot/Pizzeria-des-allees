"use client";

import Image from "next/image";
import { useCallback, useState, useSyncExternalStore, type CSSProperties } from "react";
import { motion, useReducedMotion, useTransform } from "motion/react";
import { site } from "@/config/site";
import { useProgressionHero } from "./HeroScene";
import { CIEL_FRESQUE, PAYSAGE, TITRE } from "./geometrie";
import styles from "./hero.module.css";

/** Poster, vidéo et horizon partagent le même cadrage : mêmes tailles, même object-cover. */
const TAILLES = "(min-width: 1024px) 540px, 92vw";

const variablesTitre = {
  "--titre-taille": TITRE.taille,
  "--titre-interligne": TITRE.interligne,
  "--titre-gauche": TITRE.gauche,
  "--titre-haut": TITRE.haut,
  "--titre-retrait": TITRE.retraitLigne2,
  "--titre-depart": TITRE.depart,
  "--titre-duree": TITRE.duree,
  "--titre-delai": TITRE.delai,
  "--titre-decalage": TITRE.decalageLigne2,
  "--titre-courbe": TITRE.courbe,
} as CSSProperties;

/**
 * La fenêtre en arche sur la fresque animée. De bas en haut : poster, vidéo,
 * titre, puis la ligne d'horizon détourée (cathédrale, remparts, colline) qui
 * passe DEVANT le titre : « La Pizzeria des Allées » se lève derrière Saint-Nazaire.
 */
export function HeroFenetre({ titreId }: { titreId: string }) {
  const progression = useProgressionHero();
  const reduire = useReducedMotion();
  const yPaysage = useTransform(progression, [0, 1], ["0%", PAYSAGE.yFin]);
  const echellePaysage = useTransform(progression, [0, 1], [1, PAYSAGE.echelleFin]);
  const yTitre = useTransform(progression, [0, 1], ["0%", TITRE.finDefilement]);

  return (
    <div className={`${styles.arche} relative isolate size-full overflow-hidden`} style={{ background: CIEL_FRESQUE }}>
      <div className={`${styles.paysage} absolute inset-0`}>
        {/* Un seul calque porte la parallaxe : vidéo et horizon ne se décalent jamais */}
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{ y: reduire ? 0 : yPaysage, scale: reduire ? 1 : echellePaysage }}
        >
          <Image src={site.hero.poster} alt={site.hero.alt} fill preload sizes={TAILLES} className="object-cover" />
          <VideoFresque />
          <motion.div className="absolute inset-0" style={{ y: reduire ? 0 : yTitre }}>
            <h1 id={titreId} className={styles.titre} style={variablesTitre}>
              <span className={styles.ligne}>{site.nomLignes[0]}</span>{" "}
              <span className={`${styles.ligne} ${styles.ligne2}`}>{site.nomLignes[1]}</span>
            </h1>
          </motion.div>
          <Image
            src={site.hero.horizon}
            alt=""
            fill
            loading="eager"
            sizes={TAILLES}
            className="pointer-events-none object-cover"
          />
        </motion.div>
      </div>
    </div>
  );
}

const sansAbonnement = () => () => {};

function economieDeDonnees() {
  const connexion = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return connexion?.saveData === true;
}

/**
 * La vidéo en boucle (8 s), posée sur le poster. Jamais rendue côté serveur,
 * ni en mouvement réduit, ni en mode économie de données. En pause hors écran.
 */
function VideoFresque() {
  const reduire = useReducedMotion();
  // Côté serveur et à l'hydratation : pas de vidéo (le poster suffit)
  const economie = useSyncExternalStore(sansAbonnement, economieDeDonnees, () => true);
  const [lecture, setLecture] = useState(false);

  const brancher = useCallback((video: HTMLVideoElement | null) => {
    if (!video) return;
    video.muted = true;
    const observateur = new IntersectionObserver(([entree]) => {
      if (entree?.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
    observateur.observe(video);
    return () => observateur.disconnect();
  }, []);

  if (reduire || economie) return null;

  return (
    <video
      ref={brancher}
      aria-hidden
      tabIndex={-1}
      muted
      autoPlay
      loop
      playsInline
      preload="metadata"
      disablePictureInPicture
      disableRemotePlayback
      onPlaying={() => setLecture(true)}
      className={`${styles.video} ${lecture ? styles.videoVisible : ""} pointer-events-none absolute inset-0 size-full object-cover`}
    >
      <source src={site.hero.videoMp4} type="video/mp4" />
      <source src={site.hero.videoWebm} type="video/webm" />
    </video>
  );
}
