"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useTransform } from "motion/react";
import { Pause, Play } from "lucide-react";
import { site } from "@/config/site";
import { useProgressionHero } from "./HeroScene";
import { CIEL_FRESQUE, PAYSAGE, TITRE } from "./geometrie";
import { MOUVEMENT_REDUIT, useMedia } from "@/components/ui/useMedia";
import { useVideoPermise } from "./media";
import styles from "./hero.module.css";

/** Poster, vidéo et horizon partagent le même cadrage : mêmes tailles, même object-cover. */
const TAILLES = "(min-width: 1024px) 540px, (min-width: 640px) 416px, 92vw";

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
  // Faux au serveur et à l'hydratation : aucun écart, puis la vraie préférence
  const reduire = useMedia(MOUVEMENT_REDUIT);
  const videoPermise = useVideoPermise();
  const [enPause, setEnPause] = useState(false);
  const yPaysage = useTransform(progression, [0, 1], ["0%", PAYSAGE.yFin]);
  const echellePaysage = useTransform(progression, [0, 1], [1, PAYSAGE.echelleFin]);
  const yTitre = useTransform(progression, [0, 1], ["0%", TITRE.finDefilement]);
  const video = videoPermise && !reduire;

  return (
    <div className={`${styles.arche} relative isolate size-full overflow-hidden`} style={{ background: CIEL_FRESQUE }}>
      <div className={`${styles.paysage} absolute inset-0`}>
        {/* Un seul calque porte la parallaxe : vidéo et horizon ne se décalent jamais */}
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{ y: reduire ? 0 : yPaysage, scale: reduire ? 1 : echellePaysage }}
        >
          <Image src={site.hero.poster} alt={site.hero.alt} fill preload sizes={TAILLES} className="object-cover" />
          {video && <VideoFresque enPause={enPause} />}
          <motion.div className="absolute inset-0" style={{ y: reduire ? 0 : yTitre }}>
            <h1 id={titreId} className={styles.titre} style={variablesTitre}>
              <span className={styles.ligne}>{site.nomLignes[0]}</span>{" "}
              <span className={`${styles.ligne} ${styles.ligne2}`}>{site.nomLignes[1]}</span>
              <span className="sr-only">{site.seo.complementTitre}</span>
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

      {/* WCAG 2.2.2 : la boucle peut être arrêtée (bouton absent quand la vidéo ne joue pas) */}
      {video && (
        <button
          type="button"
          aria-pressed={enPause}
          aria-label={site.textes.hero.pauseVideo}
          onClick={() => setEnPause((v) => !v)}
          className="absolute bottom-3 left-3 z-10 grid size-10 place-items-center rounded-full border border-calcaire/40 bg-minuit/70 text-calcaire transition-colors before:absolute before:-inset-1 before:rounded-full before:content-[''] hover:border-calcaire/80 hover:bg-minuit/90 sm:bottom-4 sm:left-4"
        >
          {enPause ? (
            <Play aria-hidden className="size-4 translate-x-px" strokeWidth={2.2} />
          ) : (
            <Pause aria-hidden className="size-4" strokeWidth={2.2} />
          )}
        </button>
      )}
    </div>
  );
}

/**
 * La vidéo en boucle (8 s), posée sur le poster. Jamais rendue côté serveur,
 * ni en mouvement réduit, ni sur un réseau lent. Rien n'est téléchargé
 * (preload="none", pas d'autoplay) avant que la page ait fini de charger et
 * que le hero soit à l'écran ; en pause hors écran ou à la demande.
 */
function VideoFresque({ enPause }: { enPause: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const etat = useRef({ visible: false, prete: false, enPause });
  const [lecture, setLecture] = useState(false);

  const synchroniser = useCallback(() => {
    const video = ref.current;
    if (!video) return;
    const { visible, prete, enPause: arret } = etat.current;
    if (visible && prete && !arret) video.play().catch(() => {});
    else if (!video.paused) video.pause();
  }, []);

  useEffect(() => {
    etat.current.enPause = enPause;
    synchroniser();
  }, [enPause, synchroniser]);

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
      <source src={site.hero.videoMp4} type="video/mp4" />
      <source src={site.hero.videoWebm} type="video/webm" />
    </video>
  );
}
