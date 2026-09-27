"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useTransform } from "motion/react";
import { site } from "@/config/site";
import { useProgressionHero } from "./HeroScene";
import { FOND_DEVANTURE, PAYSAGE } from "./geometrie";
import { useVideoPermise } from "./media";
import { MOUVEMENT_REDUIT, useMedia } from "@/components/ui/useMedia";
import styles from "./hero.module.css";

const { photo: PHOTO, video: VIDEO } = site.hero;

/**
 * Le haut de page (27/09, choix de Julien) : la devanture de la pizzeria, son
 * enseigne bleu nuit et or, en bannière sur toute la largeur, où la vie
 * continue en boucle (convives, pizzaiolo). L'enseigne porte déjà le nom : le
 * H1 est lu par les lecteurs d'écran et les moteurs, sans être répété par-dessus.
 */
export function HeroDevanture({ titreId }: { titreId: string }) {
  const progression = useProgressionHero();
  // Faux au serveur et à l'hydratation : aucun écart, puis la vraie préférence
  const reduire = useMedia(MOUVEMENT_REDUIT);
  const videoPermise = useVideoPermise();
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
        {/* Un seul calque porte la parallaxe : photo et vidéo ne se décalent jamais */}
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
          {videoPermise && !reduire && <VideoDevanture />}
        </motion.div>
      </div>
      {/* Téléphone : la nuit au-dessus de la devanture, où flotte le bouton menu */}
      <div aria-hidden className={styles.nuitHaute} />
      {/* La bande se fond dans la nuit, où le Pont Vieux dessiné prend le relais */}
      <div aria-hidden className={styles.fondu} />
    </div>
  );
}

/**
 * La boucle de la devanture, posée sur la photo (sa première image, même
 * format 16:9 : aucun saut quand elle démarre). Jamais rendue côté serveur, ni
 * en mouvement réduit, ni sur un réseau lent. Rien n'est téléchargé
 * (preload="none", pas d'autoplay) avant que la page ait fini de charger et que
 * le hero soit à l'écran ; en pause sinon.
 */
function VideoDevanture() {
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

    // Après le chargement de la page, au premier moment calme : la vidéo ne concurrence pas la photo
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
      className={`pointer-events-none absolute inset-0 size-full object-cover transition-opacity duration-700 motion-reduce:transition-none ${lecture ? "opacity-100" : "opacity-0"}`}
      style={{ objectPosition: PHOTO.cadrage }}
    >
      <source src={VIDEO.webm} type="video/webm" />
      <source src={VIDEO.mp4} type="video/mp4" />
    </video>
  );
}
