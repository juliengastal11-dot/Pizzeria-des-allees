"use client";

import Image from "next/image";
import { useCallback, useRef, useState, useSyncExternalStore, type CSSProperties, type RefObject } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionStyle,
} from "motion/react";
import { Maximize2 } from "lucide-react";
import type { Photo } from "@/config/site";
import { Visionneuse } from "./Visionneuse";

type Filtre = "tout" | Photo["lieu"];

const FILTRES: { id: Filtre; libelle: string }[] = [
  { id: "tout", libelle: "Tout" },
  { id: "salle", libelle: "La salle" },
  { id: "terrasse", libelle: "La terrasse" },
];

// Largeurs relatives des arches en desktop, inégales comme celles du Pont Vieux
const LARGEURS = [1, 1.3, 0.85, 1.15];
const SOMME = LARGEURS.reduce((a, b) => a + b, 0);
/** Rapport largeur / hauteur d'une arche de largeur 1 : toutes les arches ont la même hauteur. */
const ELANCEMENT = 0.7;
const RATIO_MOBILE = 3 / 4;
const EASE = [0.22, 1, 0.36, 1] as const;

/** Arche : haut en demi-cercle quel que soit le rapport largeur / hauteur `r`. */
function rayon(r: number) {
  const v = +Math.min(50, 50 * r).toFixed(2);
  return `50% 50% 1.75rem 1.75rem / ${v}% ${v}% 1.75rem 1.75rem`;
}

// Requêtes média lues sans décalage d'hydratation (valeur serveur : mobile, animations permises)
function useMedia(requete: string) {
  const abonner = useCallback(
    (rappel: () => void) => {
      const m = window.matchMedia(requete);
      m.addEventListener("change", rappel);
      return () => m.removeEventListener("change", rappel);
    },
    [requete],
  );
  return useSyncExternalStore(
    abonner,
    () => window.matchMedia(requete).matches,
    () => false,
  );
}

type Props = {
  photos: readonly Photo[];
  /** Titre de la fenêtre d'agrandissement. */
  titreFenetre: string;
};

export function Galerie({ photos, titreFenetre }: Props) {
  const [filtre, setFiltre] = useState<Filtre>("tout");
  const [ouverte, setOuverte] = useState<number | null>(null);
  const [active, setActive] = useState(0);
  const rangee = useRef<HTMLUListElement>(null);
  // Carrousel sous 1024 px, rangée d'arches au-dessus
  const large = useMedia("(min-width: 1024px)");
  const reduire = useMedia("(prefers-reduced-motion: reduce)");
  const carrousel = !large && !reduire;

  // Chaque photo garde la largeur d'arche de sa place d'origine
  const visibles = photos.map((photo, rang) => ({ photo, rang })).filter(({ photo }) => filtre === "tout" || photo.lieu === filtre);
  const listeVisionneuse = visibles.map((v) => v.photo);

  const { scrollXProgress } = useScroll({ container: rangee });
  useMotionValueEvent(scrollXProgress, "change", (p) => {
    const i = Math.round(p * (visibles.length - 1));
    if (i !== active && i >= 0) setActive(i);
  });

  const choisir = (f: Filtre) => {
    if (f === filtre) return;
    rangee.current?.scrollTo({ left: 0 });
    setActive(0);
    setFiltre(f);
  };

  const fermer = useCallback(() => setOuverte(null), []);

  return (
    <div className="mt-10 md:mt-12">
      <div role="group" aria-label="Filtrer les photos" className="mx-auto flex w-fit items-center gap-0.5 rounded-full border border-filet/60 bg-grain p-1">
        {FILTRES.map((f) => {
          const choisi = f.id === filtre;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={choisi}
              onClick={() => choisir(f.id)}
              className={`relative min-h-11 rounded-full px-4 text-[0.95rem] font-semibold transition-colors duration-200 sm:px-5 ${
                choisi ? "text-nuit" : "text-calcaire hover:text-or-clair"
              }`}
            >
              {choisi && (
                <motion.span
                  layoutId="salle-filtre-actif"
                  className="absolute inset-0 rounded-full bg-calcaire"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
              <span className="relative">{f.libelle}</span>
            </button>
          );
        })}
      </div>
      <p className="sr-only" aria-live="polite">
        {visibles.length > 1 ? `${visibles.length} photos affichées` : `${visibles.length} photo affichée`}
      </p>

      <motion.ul
        ref={rangee}
        layoutScroll
        className="relative -mx-5 mt-8 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto overscroll-x-contain px-[calc(50vw-min(39vw,12rem))] pb-10 pt-5 [scrollbar-width:none] md:mt-10 lg:mx-0 lg:snap-none lg:flex-wrap lg:justify-center lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-2 [&::-webkit-scrollbar]:hidden"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {visibles.map(({ photo, rang }, i) => {
            const l = LARGEURS[rang % LARGEURS.length];
            const r = ELANCEMENT * l;
            const variables = {
              "--largeur": `calc((100% - 4.5rem - 1px) * ${l} / ${SOMME})`,
              "--ratio": String(RATIO_MOBILE),
              "--ratio-lg": String(+r.toFixed(3)),
              "--rayon": rayon(RATIO_MOBILE),
              "--rayon-lg": rayon(r),
            } as CSSProperties as MotionStyle;
            return (
              <motion.li
                key={photo.src}
                layout
                style={variables}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.35, ease: EASE, layout: { type: "spring", stiffness: 320, damping: 34 } }}
                className="w-[min(78vw,24rem)] shrink-0 snap-center lg:w-[var(--largeur)]"
              >
                <ArcheGalerie
                  photo={photo}
                  rangee={rangee}
                  carrousel={carrousel}
                  delai={large ? i * 0.1 : 0}
                  onOuvrir={() => setOuverte(i)}
                />
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>

      {/* Repère du carrousel (mobile) : ovales des écluses */}
      {visibles.length > 1 && (
        <div aria-hidden className="mt-1 flex justify-center gap-2.5 lg:hidden">
          {visibles.map(({ photo }, i) => (
            <motion.span
              key={photo.src}
              className="block h-1.5 w-3 rounded-full bg-halo"
              initial={false}
              animate={{ opacity: i === active ? 1 : 0.35, scaleX: i === active ? 1.6 : 1 }}
              transition={{ duration: 0.3, ease: EASE }}
            />
          ))}
        </div>
      )}

      <Visionneuse photos={listeVisionneuse} index={ouverte} onChanger={setOuverte} onFermer={fermer} titre={titreFenetre} />
    </div>
  );
}

type PropsArche = {
  photo: Photo;
  rangee: RefObject<HTMLUListElement | null>;
  carrousel: boolean;
  delai: number;
  onOuvrir: () => void;
};

/** Une photo en arche cerclée de chêne, qui « s'ouvre comme une fenêtre » à l'arrivée à l'écran. */
function ArcheGalerie({ photo, rangee, carrousel, delai, onOuvrir }: PropsArche) {
  const ref = useRef<HTMLElement>(null);
  // Carrousel : l'arche centrée à 1, ses voisines à 0,94
  const { scrollXProgress } = useScroll({ container: rangee, target: ref, axis: "x", offset: ["start end", "end start"] });
  const echelle = useTransform(scrollXProgress, [0.08, 0.5, 0.92], [0.94, 1, 0.94]);

  return (
    <motion.figure
      ref={ref}
      style={{ scale: carrousel ? echelle : 1 }}
      initial={{ opacity: 0.4, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.9, delay: delai, ease: EASE }}
    >
      <button
        type="button"
        onClick={onOuvrir}
        aria-haspopup="dialog"
        className="group block w-full cursor-zoom-in [border-radius:var(--rayon)] focus-visible:outline-offset-[10px] lg:[border-radius:var(--rayon-lg)]"
      >
        <span
          className="relative isolate block overflow-hidden bg-grain shadow-[0_0_0_5px_var(--color-minuit),0_0_0_7px_var(--color-chene)] transition-transform duration-500 ease-out [aspect-ratio:var(--ratio)] [border-radius:var(--rayon)] motion-safe:group-hover:-translate-y-1 lg:[aspect-ratio:var(--ratio-lg)] lg:[border-radius:var(--rayon-lg)]"
        >
          <motion.span
            className="absolute inset-0 block"
            initial={{ scale: 1.15 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.1, delay: delai, ease: EASE }}
          >
            <span className="absolute inset-0 block transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.04] motion-safe:group-focus-visible:scale-[1.04]">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 1024px) 20rem, (min-width: 492px) 24rem, 78vw"
                className="object-cover"
                style={{ objectPosition: photo.cadrage }}
              />
            </span>
          </motion.span>
          {/* Lueur chaude en bas de l'arche, comme sous les ampoules */}
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-minuit/55 to-transparent" />
          <span
            aria-hidden
            className="absolute bottom-3.5 left-1/2 grid size-9 -translate-x-1/2 place-items-center rounded-full border border-filet/70 bg-minuit/80 text-calcaire transition-transform duration-300 ease-out motion-safe:group-hover:scale-110"
          >
            <Maximize2 className="size-4" strokeWidth={2} />
          </span>
        </span>
        <span className="sr-only">, agrandir la photo</span>
      </button>
      <figcaption className="mt-5 flex items-center justify-center gap-2 text-center font-display text-[1.125rem] italic leading-snug text-halo">
        <span aria-hidden className="inline-block size-1 shrink-0 rounded-full bg-halo shadow-[0_0_10px_2px_rgba(242,211,140,0.55)]" />
        {photo.legende}
      </figcaption>
    </motion.figure>
  );
}
