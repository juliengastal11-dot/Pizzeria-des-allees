"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Pizza } from "@/config/site";
import { useVideoPermise } from "@/components/sections/hero/media";
import { MOUVEMENT_REDUIT, useMedia } from "./useMedia";

/** Le tableau qui joue en ce moment : jamais deux à la fois sur le mur. */
let enScene: HTMLVideoElement | null = null;

type Props = {
  video: NonNullable<Pizza["video"]>;
  alt: string;
  sizes: string;
};

/**
 * Un tableau vivant du mur : la pizza se soulève en couches puis se repose,
 * UNE fois, quand son cadre passe au milieu de l'écran. Dessous, l'image fixe
 * (la première image de la vidéo) ; la vidéo finit sur la même image et y
 * reste : le cadre redevient une photo, sans saut. Un survol à la souris ou un
 * toucher la rejoue. 5 s au plus et jamais en boucle (WCAG 2.2.2). Ni vidéo ni
 * téléchargement en mouvement réduit, en économie de données ou sur réseau
 * lent : les mêmes règles que la vidéo du hero.
 */
export function TableauVivant({ video, alt, sizes }: Props) {
  // Faux au serveur et à l'hydratation : l'image seule, puis la vraie préférence
  const reduire = useMedia(MOUVEMENT_REDUIT);
  const permise = useVideoPermise();
  return (
    <>
      <Image src={video.poster} alt={alt} fill sizes={sizes} className="object-cover" />
      {permise && !reduire && <VideoTableau src={video.mp4} />}
    </>
  );
}

function VideoTableau({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [lancee, setLancee] = useState(false);

  const jouer = useCallback(() => {
    const video = ref.current;
    if (!video || !video.paused) return;
    // Si un autre tableau jouait encore, il revient au repos
    if (enScene && enScene !== video) {
      enScene.pause();
      enScene.currentTime = 0;
    }
    enScene = video;
    video.currentTime = 0;
    video.play().catch(() => {});
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;

    // Un écran avant l'arrivée du cadre, et une fois la page chargée (le hero passe
    // d'abord) : la vidéo commence à se charger
    const precharger = () => {
      video.preload = "auto";
    };
    const approche = new IntersectionObserver(
      ([entree]) => {
        if (!entree?.isIntersecting) return;
        approche.disconnect();
        if (document.readyState === "complete") precharger();
        else window.addEventListener("load", precharger, { once: true });
      },
      { rootMargin: "100% 0px" },
    );
    // Le cadre entre dans la bande du milieu de l'écran : la pizza s'anime, une seule fois
    const milieu = new IntersectionObserver(
      ([entree]) => {
        if (!entree?.isIntersecting) return;
        milieu.disconnect();
        jouer();
      },
      { rootMargin: "-38% 0px -38% 0px" },
    );
    approche.observe(video);
    milieu.observe(video);

    return () => {
      approche.disconnect();
      milieu.disconnect();
      window.removeEventListener("load", precharger);
      if (enScene === video) enScene = null;
    };
  }, [jouer]);

  return (
    <video
      ref={ref}
      aria-hidden
      tabIndex={-1}
      muted
      playsInline
      preload="none"
      disablePictureInPicture
      disableRemotePlayback
      onPlaying={() => setLancee(true)}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") jouer();
      }}
      onClick={jouer}
      className={`absolute inset-0 size-full object-cover transition-opacity duration-200 ${lancee ? "opacity-100" : "opacity-0"}`}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
