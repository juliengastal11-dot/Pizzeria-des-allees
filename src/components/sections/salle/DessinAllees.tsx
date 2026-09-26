"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";

const DESSIN = site.photos.dessinAllees;

/**
 * Les Allées Paul-Riquet dessinées à la main, en fond de la section : le dessin
 * se trace sous les yeux du visiteur en quatre secondes environ, de la statue de
 * Riquet vers les platanes. L'animation vit dans le fichier SVG (traits qui se
 * déroulent) et le navigateur la joue comme une image : aucun des 3 000 traits
 * n'entre dans la page. Le fichier part en cache à l'approche de la section et
 * s'affiche quand elle est à l'écran, pour que le tracé commence sous les yeux.
 * Mouvement réduit : le dessin est déjà tracé (fichier sans animation).
 */
export function DessinAllees() {
  const cadre = useRef<HTMLDivElement>(null);
  const [fichier, setFichier] = useState<string | null>(null);

  useEffect(() => {
    const el = cadre.current;
    if (!el) return;
    const choisi = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? DESSIN.fixe : DESSIN.anime;

    const approche = new IntersectionObserver(
      ([entree]) => {
        if (!entree?.isIntersecting) return;
        approche.disconnect();
        fetch(choisi).catch(() => {});
      },
      { rootMargin: "800px 0px" },
    );
    const vue = new IntersectionObserver(
      ([entree]) => {
        if (!entree?.isIntersecting) return;
        vue.disconnect();
        setFichier(choisi);
      },
      // Assez du dessin à l'écran pour voir la statue se tracer en premier
      { threshold: 0.45 },
    );
    approche.observe(el);
    vue.observe(el);
    return () => {
      approche.disconnect();
      vue.disconnect();
    };
  }, []);

  return (
    <div
      ref={cadre}
      aria-hidden
      // Sous la voûte des ampoules ; en grand écran, le centre (derrière le titre) reste plus discret
      className="pointer-events-none absolute inset-x-0 top-[4.5rem] -z-10 h-[34rem] opacity-[0.26] [mask-image:linear-gradient(to_bottom,transparent,black_16%,black_64%,transparent)] sm:h-[38rem] lg:top-4 lg:h-[48rem] lg:[mask-composite:intersect] lg:[mask-image:linear-gradient(to_bottom,transparent,black_14%,black_62%,transparent),radial-gradient(ellipse_34%_30%_at_50%_34%,rgba(0,0,0,0.55),black)]"
    >
      {fichier && (
        <Image src={fichier} alt="" fill unoptimized loading="eager" className="object-cover object-[50%_30%]" />
      )}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element -- sans JavaScript, le dessin fixe */}
        <img src={DESSIN.fixe} alt="" className="absolute inset-0 size-full object-cover object-[50%_30%]" />
      </noscript>
    </div>
  );
}
