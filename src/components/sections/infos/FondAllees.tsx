"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";
import { useVideoPermise } from "@/components/sections/hero/media";
import { useMouvementReduit } from "@/components/sections/infos/useMouvementReduit";

const FOND = site.fondInfos;
/** Sur un écran large, on garde le haut : la lune et les platanes (les promeneurs du bas passent sous les cartes). */
const CADRAGE = "object-[50%_25%]";

/**
 * Les Allées au soleil couchant, en boucle derrière « Venir à la Pizzeria des
 * Allées », sous un voile nuit qui garde le titre et les cartes lisibles.
 * La vidéo ne se télécharge qu'à l'approche de la section (preload="none") et
 * s'arrête hors de l'écran ; en mouvement réduit ou en économie de données,
 * le poster suffit.
 */
export function FondAllees() {
  const ref = useRef<HTMLVideoElement>(null);
  const reduire = useMouvementReduit();
  const video = useVideoPermise() && !reduire;
  const [lecture, setLecture] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = true;
    const observateur = new IntersectionObserver(
      ([entree]) => {
        if (entree?.isIntersecting) el.play().catch(() => {});
        else if (!el.paused) el.pause();
      },
      { rootMargin: "200px 0px" },
    );
    observateur.observe(el);
    return () => observateur.disconnect();
  }, [video]);

  return (
    <div data-animation="video-infos" aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <Image src={FOND.poster} alt="" fill sizes="100vw" className={`object-cover ${CADRAGE}`} />
      {video && (
        <video
          ref={ref}
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          disableRemotePlayback
          tabIndex={-1}
          onPlaying={() => setLecture(true)}
          className={`absolute inset-0 size-full object-cover ${CADRAGE} transition-opacity duration-700 ${lecture ? "opacity-100" : "opacity-0"}`}
        >
          <source src={FOND.webm} type="video/webm" />
          <source src={FOND.mp4} type="video/mp4" />
        </video>
      )}
      {/* Voile : léger en haut (la lune et le ciel se voient sous la ligne de l'Orb), la nuit franche en bas pour le raccord avec la FAQ */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, var(--color-nuit), rgb(from var(--color-nuit) r g b / 0.5) 8%, rgb(from var(--color-nuit) r g b / 0.42) 30%, rgb(from var(--color-nuit) r g b / 0.58) 72%, var(--color-nuit))",
        }}
      />
    </div>
  );
}
