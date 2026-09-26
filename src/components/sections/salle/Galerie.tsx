"use client";

import Image from "next/image";
import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties, type FocusEvent, type RefObject } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "motion/react";
import { Maximize2 } from "lucide-react";
import { site, type Photo } from "@/config/site";
import { remplir } from "@/lib/textes";
import { BUREAU, MOUVEMENT_REDUIT, useMedia } from "@/components/sections/histoire/useMedia";
import { Visionneuse } from "./Visionneuse";
import { facteurLargeur, styleCadrage } from "./cadrage";

const TEXTES = site.textes.salle;

type Filtre = Photo["lieu"];

// Deux onglets seulement : la salle (ouvert par défaut) et la terrasse
const FILTRES: Filtre[] = ["salle", "terrasse"];

// Largeurs relatives des arches en desktop, inégales comme celles du Pont Vieux
const LARGEURS = [1, 1.3, 0.85, 1.15];
const SOMME = LARGEURS.reduce((a, b) => a + b, 0);
/** Rapport largeur / hauteur d'une arche de largeur 1 : toutes les arches ont la même hauteur. */
const ELANCEMENT = 0.7;
const RATIO_MOBILE = 3 / 4;
const EASE = [0.22, 1, 0.36, 1] as const;

/*
 * `sizes` calculé sur le rendu réel : photo paysage en object-cover dans une
 * arche portrait, zoomée (voir cadrage.ts). Bureau : rangée de 1112 px
 * (max-w-6xl moins la gouttière), 4,5 rem d'écarts ; mobile : arche de min(78vw, 24rem).
 */
const LARGEUR_UNITE_1152 = (1112 - 73) / SOMME;
const LARGEUR_UNITE_1024 = (1024 - 40 - 73) / SOMME / 1024;
const SIZES = [
  `(min-width: 1152px) ${Math.round(LARGEUR_UNITE_1152 * facteurLargeur(ELANCEMENT))}px`,
  `(min-width: 1024px) ${Math.round(LARGEUR_UNITE_1024 * facteurLargeur(ELANCEMENT) * 100)}vw`,
  `(min-width: 492px) ${Math.round(24 * facteurLargeur(RATIO_MOBILE))}rem`,
  `${Math.round(78 * facteurLargeur(RATIO_MOBILE))}vw`,
].join(", ");

/** Arche : haut en demi-cercle quel que soit le rapport largeur / hauteur `r`. */
function rayon(r: number) {
  const v = +Math.min(50, 50 * r).toFixed(2);
  return `50% 50% 1.75rem 1.75rem / ${v}% ${v}% 1.75rem 1.75rem`;
}

type Props = {
  photos: readonly Photo[];
  /** Titre de la fenêtre d'agrandissement. */
  titreFenetre: string;
};

export function Galerie({ photos, titreFenetre }: Props) {
  const [filtre, setFiltre] = useState<Filtre>("salle");
  const [ouverte, setOuverte] = useState<number | null>(null);
  const rangee = useRef<HTMLUListElement>(null);
  // Carrousel sous 1024 px, rangée d'arches au-dessus
  const large = useMedia(BUREAU);
  const reduire = useMedia(MOUVEMENT_REDUIT);
  const carrousel = !large && !reduire;

  // Chaque photo garde la largeur d'arche de sa place d'origine
  const visibles = photos.map((photo, rang) => ({ photo, rang })).filter(({ photo }) => photo.lieu === filtre);
  const listeVisionneuse = visibles.map((v) => v.photo);

  const { scrollXProgress } = useScroll({ container: rangee });

  // Nouveau filtre : on revient à la première arche une fois la liste à jour
  useLayoutEffect(() => {
    rangee.current?.scrollTo({ left: 0 });
  }, [filtre]);

  // Clavier (carrousel) : la photo qui reçoit le focus est centrée, jamais laissée hors de l'écran
  const centrer = (e: FocusEvent<HTMLUListElement>) => {
    const ul = rangee.current;
    const li = (e.target as HTMLElement).closest("li");
    if (large || !ul || !li || li.parentElement !== ul) return;
    // Après le défilement que le navigateur fait lui-même au focus (sinon il annule le nôtre)
    requestAnimationFrame(() => {
      ul.scrollTo({ left: li.offsetLeft - (ul.clientWidth - li.offsetWidth) / 2, behavior: reduire ? "auto" : "smooth" });
    });
  };

  const fermer = useCallback(() => setOuverte(null), []);
  const n = visibles.length;

  return (
    <div className="mt-10 md:mt-12">
      <div role="group" aria-label={TEXTES.ariaFiltres} className="mx-auto flex w-fit items-center gap-0.5 rounded-full border border-filet/60 bg-grain p-1">
        {FILTRES.map((f) => {
          const choisi = f === filtre;
          return (
            <button
              key={f}
              type="button"
              aria-pressed={choisi}
              onClick={() => setFiltre(f)}
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
              <span className="relative">{TEXTES.filtres[f]}</span>
            </button>
          );
        })}
      </div>
      <p className="sr-only" aria-live="polite">
        {remplir(n > 1 ? TEXTES.compte.plusieurs : TEXTES.compte.une, { n })}
      </p>

      <motion.ul
        ref={rangee}
        layoutScroll
        onFocus={centrer}
        className="relative -mx-5 mt-8 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto overscroll-x-contain px-[calc(50vw-min(39vw,12rem))] pb-10 pt-5 [overflow-anchor:none] [scrollbar-width:none] md:mt-10 lg:mx-0 lg:snap-none lg:flex-wrap lg:justify-center lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-2 [&::-webkit-scrollbar]:hidden"
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
                // Mesures de mise en page seulement quand le filtre change (pas à chaque rendu)
                layout
                layoutDependency={filtre}
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
      {n > 1 && <Reperes key={filtre} progression={scrollXProgress} cles={visibles.map((v) => v.photo.src)} />}

      <Visionneuse photos={listeVisionneuse} index={ouverte} onChanger={setOuverte} onFermer={fermer} titre={titreFenetre} />
    </div>
  );
}

/**
 * Points du carrousel. Ils suivent seuls la progression du défilement : la
 * galerie ne se re-rend pas pendant le glissé.
 */
function Reperes({ progression, cles }: { progression: MotionValue<number>; cles: string[] }) {
  const [actif, setActif] = useState(0);
  const n = cles.length;
  useMotionValueEvent(progression, "change", (p) => {
    const i = Math.round(p * (n - 1));
    setActif((a) => (i >= 0 && i < n ? i : a));
  });

  return (
    <div aria-hidden className="mt-1 flex justify-center gap-2.5 lg:hidden">
      {cles.map((cle, i) => (
        <motion.span
          key={cle}
          className="block h-1.5 w-3 rounded-full bg-halo"
          initial={false}
          animate={{ opacity: i === actif ? 1 : 0.35, scaleX: i === actif ? 1.6 : 1 }}
          transition={{ duration: 0.3, ease: EASE }}
        />
      ))}
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
              <Image src={photo.src} alt={photo.alt} fill sizes={SIZES} className="object-cover" style={styleCadrage(photo.cadrage)} />
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
        <span className="sr-only">{`, ${TEXTES.agrandir}`}</span>
      </button>
      <figcaption className="mt-5 text-center font-display text-[1.125rem] italic leading-snug text-halo">
        {photo.legende}
      </figcaption>
    </motion.figure>
  );
}
