"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useTransform } from "motion/react";
import { site } from "@/config/site";
import { useProgressionHero } from "./HeroScene";
import { CIEL_FRESQUE, PAYSAGE, SCENE, TITRE } from "./geometrie";
import { MOUVEMENT_REDUIT, useMedia } from "@/components/ui/useMedia";
import { useVideoPermise } from "./media";
import styles from "./hero.module.css";

const VIDEO = site.hero.video;

/** Poster, vidéo et horizon partagent la scène, qui déborde de l'écran sur téléphone (tranche centrée sur la cathédrale). */
const TAILLES = "(min-width: 768px) 100vw, 225vw";

const variablesScene = { "--scene-x": SCENE.x, "--scene-y": SCENE.y } as CSSProperties;

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
 * Le haut de page : la fresque de la salle, animée, en paysage sur toute la
 * largeur. De bas en haut dans la scène : le poster, la vidéo, le titre, puis
 * la ligne d'horizon détourée (cathédrale, colline) qui passe DEVANT le titre :
 * « La Pizzeria des Allées » se lève derrière Saint-Nazaire.
 */
export function HeroPaysage({ titreId }: { titreId: string }) {
  const progression = useProgressionHero();
  // Faux au serveur et à l'hydratation : aucun écart, puis la vraie préférence
  const reduire = useMedia(MOUVEMENT_REDUIT);
  const videoPermise = useVideoPermise();
  const yPaysage = useTransform(progression, [0, 1], ["0%", PAYSAGE.yFin]);
  const echellePaysage = useTransform(progression, [0, 1], [1, PAYSAGE.echelleFin]);
  const yTitre = useTransform(progression, [0, 1], ["0%", TITRE.finDefilement]);

  return (
    <div data-animation="paysage-hero" className={`${styles.bande} relative isolate overflow-hidden`} style={{ background: CIEL_FRESQUE }}>
      <div className={styles.scene} style={variablesScene}>
        <div className={`${styles.paysage} absolute inset-0`}>
          {/* Un seul calque porte la parallaxe : vidéo, titre et horizon ne se décalent jamais */}
          <motion.div
            className="absolute inset-0 will-change-transform"
            style={{ y: reduire ? 0 : yPaysage, scale: reduire ? 1 : echellePaysage }}
          >
            <Image src={VIDEO.poster} alt={VIDEO.alt} fill preload sizes={TAILLES} draggable={false} className="object-cover" />
            {videoPermise && !reduire && <VideoPaysage />}
            <motion.div className="absolute inset-0" style={{ y: reduire ? 0 : yTitre }}>
              <h1 data-animation="titre-hero" id={titreId} className={styles.titre} style={variablesTitre}>
                <span className={styles.ligne}>{site.nomLignes[0]}</span>{" "}
                <span className={`${styles.ligne} ${styles.ligne2}`}>{site.nomLignes[1]}</span>
                <span className="sr-only">{site.seo.complementTitre}</span>
              </h1>
            </motion.div>
            <Image
              src={VIDEO.horizon}
              alt=""
              fill
              loading="eager"
              sizes={TAILLES}
              draggable={false}
              className="pointer-events-none object-cover"
            />
          </motion.div>
        </div>
      </div>
      {/* La bande se fond dans la nuit, où le Pont Vieux dessiné prend le relais */}
      <div aria-hidden className={styles.fondu} />
    </div>
  );
}

/**
 * La vidéo en boucle, posée sur son poster. Jamais rendue côté serveur, ni en
 * mouvement réduit, ni sur un réseau lent. Rien n'est téléchargé
 * (preload="none", pas d'autoplay) avant que la page ait fini de charger et que
 * le hero soit à l'écran ; en pause sinon (aucun bouton pause visible : choix de
 * Julien — la préférence « mouvement réduit » suffit à l'arrêter).
 */
function VideoPaysage() {
  const ref = useRef<HTMLVideoElement>(null);
  const etat = useRef({ visible: false, prete: false });
  const [lecture, setLecture] = useState(false);

  const synchroniser = useCallback(() => {
    const video = ref.current;
    if (!video) return;
    const { visible, prete } = etat.current;
    if (visible && prete) video.play().catch(() => {});
    else if (!video.paused) video.pause();
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    let actif = true;

    const observateur = new IntersectionObserver(([entree]) => {
      etat.current.visible = !!entree?.isIntersecting;
      synchroniser();
    });
    observateur.observe(video);

    // Après le chargement de la page, au premier moment calme : la vidéo ne concurrence pas le poster
    const autoriser = () => {
      const plusTard = (f: () => void) => {
        if ("requestIdleCallback" in window) window.requestIdleCallback(f, { timeout: 2000 });
        else setTimeout(f, 300);
      };
      plusTard(() => {
        if (!actif) return;
        etat.current.prete = true;
        synchroniser();
      });
    };
    if (document.readyState === "complete") autoriser();
    else window.addEventListener("load", autoriser, { once: true });

    return () => {
      actif = false;
      observateur.disconnect();
      window.removeEventListener("load", autoriser);
    };
  }, [synchroniser]);

  return (
    <video
      data-animation="video-hero"
      ref={ref}
      aria-hidden
      tabIndex={-1}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      disableRemotePlayback
      onPlaying={() => setLecture(true)}
      className={`${styles.video} ${lecture ? styles.videoVisible : ""} pointer-events-none absolute inset-0 size-full object-cover`}
    >
      <source src={VIDEO.webm} type="video/webm" />
      <source src={VIDEO.mp4} type="video/mp4" />
    </video>
  );
}
