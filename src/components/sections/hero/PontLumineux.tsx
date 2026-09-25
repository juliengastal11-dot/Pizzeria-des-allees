"use client";

import { useEffect, useRef, useSyncExternalStore, type CSSProperties } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import { BoutonCommander, BoutonReserver } from "@/components/actions/Boutons";
import { useActions } from "@/components/providers/ActionsProvider";
import { useProgressionHero } from "./HeroScene";
import { ALLUMAGE, ANGLES_LUMIERES, ARCHES, PILE, REFLET, type ArchePont, type Format } from "./geometrie";

/* ---------------------------------------------------------------------------
 * Formats d'écran (mêmes seuils que Tailwind : md 768 px, lg 1024 px)
 * ------------------------------------------------------------------------ */

const FORMATS: Format[] = ["mobile", "tablette", "bureau"];
const REQUETE_TABLETTE = "(min-width: 768px)";
const REQUETE_BUREAU = "(min-width: 1024px)";

/** Affichage d'une colonne selon le premier format où elle existe. */
const AFFICHAGE: Record<Format, string> = {
  mobile: "flex",
  tablette: "hidden md:flex",
  bureau: "hidden lg:flex",
};

function formatCourant(): Format {
  if (window.matchMedia(REQUETE_BUREAU).matches) return "bureau";
  if (window.matchMedia(REQUETE_TABLETTE).matches) return "tablette";
  return "mobile";
}

function abonnerFormat(rappel: () => void) {
  const listes = [REQUETE_TABLETTE, REQUETE_BUREAU].map((q) => window.matchMedia(q));
  listes.forEach((l) => l.addEventListener("change", rappel));
  return () => listes.forEach((l) => l.removeEventListener("change", rappel));
}

function useFormat(): Format {
  return useSyncExternalStore(abonnerFormat, formatCourant, () => "mobile");
}

/* ---------------------------------------------------------------------------
 * Plan du pont, calculé une fois
 * ------------------------------------------------------------------------ */

const visibles = (f: Format) => ARCHES.flatMap((a, i) => (a.largeur[f] !== undefined ? [i] : []));
const VISIBLES: Record<Format, number[]> = { mobile: visibles("mobile"), tablette: visibles("tablette"), bureau: visibles("bureau") };

/** Premier format où l'arche existe (mobile ⊂ tablette ⊂ bureau). */
const formatArche = (i: number): Format => FORMATS.find((f) => VISIBLES[f].includes(i)) ?? "bureau";

/** La pile qui suit l'arche i existe dès qu'une autre arche la suit dans le même format. */
const formatPile = (i: number): Format | undefined => FORMATS.find((f) => VISIBLES[f].includes(i) && VISIBLES[f].some((j) => j > i));

/** Colonnes de la grille : arches (fr) et piles (px) alternées. Une arche à bouton n'est jamais plus étroite que lui. */
function colonnes(f: Format) {
  return VISIBLES[f]
    .map((i) => (ARCHES[i].bouton ? `minmax(max-content, ${ARCHES[i].largeur[f]}fr)` : `minmax(0, ${ARCHES[i].largeur[f]}fr)`))
    .join(` ${PILE[f]} `);
}

/** Rang de l'arche de Commander : à l'arrivée, les lumières courent jusqu'à elle. */
const RANG_COMMANDER: Record<Format, number> = {
  mobile: VISIBLES.mobile.findIndex((i) => ARCHES[i].bouton === "commander"),
  tablette: VISIBLES.tablette.findIndex((i) => ARCHES[i].bouton === "commander"),
  bureau: VISIBLES.bureau.findIndex((i) => ARCHES[i].bouton === "commander"),
};

const variablesPont = {
  "--cols-mobile": colonnes("mobile"),
  "--cols-tablette": colonnes("tablette"),
  "--cols-bureau": colonnes("bureau"),
} as CSSProperties;

/* ---------------------------------------------------------------------------
 * Allumage : chaque arche (et la pile qui la suit) s'allume à son tour
 * ------------------------------------------------------------------------ */

type Valeur = MotionValue<number> | number;
type Eclat = { opacite: Valeur; echelle: Valeur; opaciteReflet: Valeur };

function useAllumage(progression: MotionValue<number>, rang: number, total: number, auChargement: boolean): Eclat {
  const reduire = useReducedMotion();
  const chargement = useMotionValue(0);

  // Jusqu'à Commander, les arches s'allument d'elles-mêmes, une fois le titre levé
  useEffect(() => {
    if (reduire || !auChargement) return;
    const controle = animate(chargement, 1, {
      delay: ALLUMAGE.delaiChargement + rang * ALLUMAGE.ecartChargement,
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controle.stop();
  }, [auChargement, chargement, rang, reduire]);

  // De gauche à droite : la première dès le premier coup de molette, la dernière vers 55 %
  const debut = total > 1 ? ALLUMAGE.premier + (Math.max(rang, 0) / (total - 1)) * (ALLUMAGE.dernier - ALLUMAGE.premier) : ALLUMAGE.premier;
  const allumage = useTransform([progression, chargement], ([p, c]: number[]) =>
    Math.max(Math.min(Math.max((p - debut) / ALLUMAGE.fenetre, 0), 1), c),
  );
  const opacite = useTransform(allumage, [0, 1], [ALLUMAGE.eteinte.opacite, 1]);
  const echelle = useTransform(allumage, [0, 1], [ALLUMAGE.eteinte.echelle, 1]);
  const opaciteReflet = useTransform(allumage, [0, 1], [ALLUMAGE.eteinte.opacite * ALLUMAGE.reflet, ALLUMAGE.reflet]);

  if (reduire) return { opacite: 1, echelle: 1, opaciteReflet: ALLUMAGE.reflet };
  return { opacite, echelle, opaciteReflet };
}

/* ---------------------------------------------------------------------------
 * Dessin
 * ------------------------------------------------------------------------ */

const POINT =
  "absolute block size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-halo shadow-[0_0_10px_2px_rgba(242,211,140,0.55)] lg:size-[5px]";

/** Anse de panier des arches à bouton ; le bouton en reprend la forme, 5 px en retrait. */
const RAYON_ARCHE_BOUTON = "50% 50% 0 0 / var(--r-arche) var(--r-arche) 0 0";
const RAYON_PETITE_ARCHE = "9999px 9999px 0 0";
const FORME_BOUTON = "rounded-[50%_50%_0.75rem_0.75rem/var(--r-bouton)_var(--r-bouton)_0.75rem_0.75rem]";

const CLASSE_BOUTON = `size-full min-h-0! whitespace-nowrap px-2! sm:px-4! max-xs:text-[0.9375rem]! max-sm:[&>svg]:hidden ${FORME_BOUTON}`;

/**
 * Points de lumière le long de la courbe de l'arche. Dans le reflet (calque
 * retourné et écrasé), ils sont étirés à la verticale comme sur l'eau.
 */
function Lumieres({ arche, opacite, echelle, reflet = false }: { arche: ArchePont; opacite: Valeur; echelle: Valeur; reflet?: boolean }) {
  const angles = arche.bouton ? ANGLES_LUMIERES.bouton : ANGLES_LUMIERES.petite;
  // Arche à bouton : rayon vertical --r-arche ; petite arche en plein cintre : rayon = demi-largeur
  const rayon = arche.bouton ? "var(--r-arche)" : "50cqi";
  return angles.map((angle) => {
    const t = (angle * Math.PI) / 180;
    return (
      <motion.span
        key={angle}
        aria-hidden
        className={`${POINT} ${reflet ? "scale-y-[5]" : ""}`}
        style={{
          left: `${(50 - 50 * Math.cos(t)).toFixed(2)}%`,
          top: `calc(${rayon} * ${(1 - Math.sin(t)).toFixed(3)})`,
          opacity: opacite,
          scale: echelle,
        }}
      />
    );
  });
}

function ArcheColonne({ arche, index, format, progression }: { arche: ArchePont; index: number; format: Format; progression: MotionValue<number> }) {
  const rang = VISIBLES[format].indexOf(index);
  const { opacite, echelle, opaciteReflet } = useAllumage(progression, rang, VISIBLES[format].length, rang >= 0 && rang <= RANG_COMMANDER[format]);
  const pile = formatPile(index);

  const hauteur = `calc((var(--corps) - 10px) * ${arche.hauteur / 100})`;
  const rayon = arche.bouton ? RAYON_ARCHE_BOUTON : RAYON_PETITE_ARCHE;
  // Petite arche : conteneur CSS, pour placer les lumières en fraction de sa largeur
  const trace = `border-[1.25px] border-b-0 ${arche.bouton ? "" : "@container"}`;

  return (
    <>
      <div className={`relative flex-col ${AFFICHAGE[formatArche(index)]}`}>
        <div aria-hidden className="h-(--tablier) shrink-0" />
        <div className="relative flex h-(--corps) shrink-0 flex-col justify-end">
          {/* Reflet dans l'Orb : la même arche, retournée sur la ligne d'eau et écrasée */}
          <div
            aria-hidden
            className={`absolute inset-x-0 bottom-0 origin-bottom border-calcaire/15 ${trace}`}
            style={{ height: hauteur, borderRadius: rayon, transform: `scaleY(${-REFLET})` }}
          >
            {arche.bouton === "commander" && (
              <span className={`absolute inset-x-1 top-1 bottom-0 bg-linear-to-b from-or/0 to-or/30 ${FORME_BOUTON}`} />
            )}
            {arche.bouton === "reserver" && (
              <span className={`absolute inset-x-1 top-1 bottom-0 border-[1.5px] border-calcaire/20 ${FORME_BOUTON}`} />
            )}
            <Lumieres arche={arche} opacite={opaciteReflet} echelle={echelle} reflet />
          </div>

          {/* L'arche ; son ouverture accueille le bouton */}
          <div className={`relative flex border-calcaire/40 ${trace}`} style={{ height: hauteur, borderRadius: rayon }}>
            {arche.bouton && (
              <div className="flex min-w-0 flex-1 px-1 pt-1">
                {arche.bouton === "commander" ? (
                  <BoutonCommander variante="or" forme="libre" className={CLASSE_BOUTON} />
                ) : (
                  <BoutonReserver variante="contour" forme="libre" className={CLASSE_BOUTON}>
                    {/* Un seul nœud de texte pour le bouton (flex) ; « une table » se replie sous 360 px */}
                    <span>
                      Réserver<span className="max-[359px]:sr-only"> une table</span>
                    </span>
                  </BoutonReserver>
                )}
              </div>
            )}
            <Lumieres arche={arche} opacite={opacite} echelle={echelle} />
          </div>
        </div>
        <div aria-hidden className="h-(--reflet) shrink-0" />
      </div>

      {pile && (
        <div aria-hidden className={`relative ${AFFICHAGE[pile]}`}>
          {/* Lumière du tablier au-dessus de la pile, et son reflet */}
          <motion.span className={`${POINT} left-1/2 top-[calc(var(--tablier)_-_10px)]`} style={{ opacity: opacite, scale: echelle }} />
          <motion.span
            className={`${POINT} left-1/2 scale-y-[2.25]`}
            style={{ top: `calc(var(--tablier) + var(--corps) + (var(--corps) + 10px) * ${REFLET})`, opacity: opaciteReflet, scale: echelle }}
          />
          {/* Avant-bec posé sur l'eau */}
          <svg
            viewBox="0 0 10 20"
            preserveAspectRatio="none"
            className="absolute left-[-2px] top-[calc(var(--tablier)_+_var(--corps)_*_0.56)] h-[calc(var(--corps)_*_0.44)] w-[calc(100%_+_4px)] overflow-visible"
          >
            <path
              d="M0 20 V7 L5 1 L10 7 V20"
              style={{ fill: "var(--color-nuit, #051a4b)", stroke: "var(--color-calcaire, #f1e0c8)" }}
              strokeOpacity="0.4"
              strokeWidth="1.25"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      )}
    </>
  );
}

/** Parapet, tablier et ligne d'eau : pleine largeur sur mobile, fondus aux bords au-delà. */
const LIGNE = "absolute inset-x-0 sm:right-[calc(50%_-_50vw)] sm:left-[calc(50%_-_50vw)] sm:bg-transparent sm:bg-[linear-gradient(90deg,transparent,var(--c)_14%,var(--c)_86%,transparent)]";

/**
 * Le Pont Vieux dessiné au trait, posé sur l'Orb. Commander et Réserver
 * habitent deux de ses arches ; les points de lumière s'allument arche par
 * arche au défilement, et se reflètent dans l'eau.
 */
export function PontLumineux({ className }: { className?: string }) {
  const progression = useProgressionHero();
  const format = useFormat();
  const { setCtaHeroVisibles } = useActions();
  const bandeBoutons = useRef<HTMLDivElement>(null);

  // Tant que les boutons du pont sont à l'écran (sous l'en-tête), l'en-tête et la barre mobile n'en rajoutent pas
  useEffect(() => {
    const el = bandeBoutons.current;
    if (!el) return;
    const observateur = new IntersectionObserver(
      ([entree]) => setCtaHeroVisibles(!!entree && entree.isIntersecting && entree.intersectionRatio >= 0.6),
      { rootMargin: "-64px 0px 0px 0px", threshold: [0, 0.6, 1] },
    );
    observateur.observe(el);
    return () => {
      observateur.disconnect();
      setCtaHeroVisibles(false);
    };
  }, [setCtaHeroVisibles]);

  return (
    <div
      className={`relative [--corps:72px] [--r-arche:31px] [--r-bouton:26px] [--reflet:44px] [--tablier:16px] lg:[--corps:78px] lg:[--r-arche:34px] lg:[--r-bouton:29px] lg:[--reflet:48px] ${className ?? ""}`}
    >
      <div aria-hidden className="pointer-events-none">
        <div className={`${LIGNE} top-[calc(var(--tablier)_-_5px)] h-px bg-calcaire/25 [--c:rgb(241_224_200_/_0.25)]`} />
        <div className={`${LIGNE} top-(--tablier) h-[1.25px] bg-calcaire/40 [--c:rgb(241_224_200_/_0.4)]`} />
        <div className={`${LIGNE} top-[calc(var(--tablier)_+_var(--corps))] h-[1.25px] bg-calcaire/45 [--c:rgb(241_224_200_/_0.45)]`} />
        {/* Rides de l'Orb */}
        <div className="absolute inset-x-6 top-[calc(var(--tablier)_+_var(--corps)_+_13px)] h-px bg-[repeating-linear-gradient(90deg,rgb(241_224_200_/_0.14)_0_14px,transparent_14px_34px)]" />
        <div className="absolute inset-x-14 top-[calc(var(--tablier)_+_var(--corps)_+_27px)] h-px bg-[repeating-linear-gradient(90deg,transparent_0_9px,rgb(95_127_160_/_0.4)_9px_17px,transparent_17px_40px)]" />
        {/* Bande des boutons, observée pour savoir s'ils sont à l'écran */}
        <div ref={bandeBoutons} className="absolute inset-x-0 top-[calc(var(--tablier)_+_10px)] h-[calc(var(--corps)_-_10px)]" />
      </div>

      <div
        role="group"
        aria-label="Commander ou réserver"
        className="relative grid px-2.5 [grid-template-columns:var(--cols-mobile)] sm:px-0 md:[grid-template-columns:var(--cols-tablette)] lg:[grid-template-columns:var(--cols-bureau)]"
        style={variablesPont}
      >
        {ARCHES.map((arche, i) => (
          <ArcheColonne key={i} arche={arche} index={i} format={format} progression={progression} />
        ))}
      </div>
    </div>
  );
}
