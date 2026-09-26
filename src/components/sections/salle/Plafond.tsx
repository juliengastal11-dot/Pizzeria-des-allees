"use client";

import { Fragment, useEffect, useId, useRef, type CSSProperties, type RefObject } from "react";
import { motion, useInView, type Variants } from "motion/react";

/**
 * Le plafond de la salle : une voûte en anse de panier (le haut de la section
 * se courbe vers les murs, filet laiton en guise de moulure) d'où pendent des
 * ampoules à filament, à des fils de longueurs inégales. Elles s'allument une
 * à une quand la section arrive à l'écran, puis scintillent doucement : de
 * temps en temps, une ampoule prise au hasard baisse un instant et reprend
 * (jamais éteinte, jamais plus de deux creux par seconde : WCAG 2.3.1).
 * Mouvement réduit : allumées d'emblée et immobiles (classes motion-reduce).
 */

// Profil de la voûte : superellipse, plate au centre et plongeante vers les murs
const EXPOSANT = 2.4;
const voute = (u: number) => 1 - Math.pow(1 - Math.pow(Math.min(1, Math.abs(u)), EXPOSANT), 1 / EXPOSANT);
/** Pente du profil (dérivée de `voute`) : négative à gauche, où la voûte remonte vers le centre. */
const pente = (u: number) => {
  const a = Math.min(Math.abs(u), 0.999);
  return a === 0 ? 0 : Math.sign(u) * Math.pow(a, EXPOSANT - 1) * Math.pow(1 - Math.pow(a, EXPOSANT), 1 / EXPOSANT - 1);
};

// Tracé dans une boîte 1000 × 100 étirée sur toute la largeur (0 = sommet, 100 = retombée)
const POINTS = Array.from({ length: 81 }, (_, i) => {
  const x = 1000 - i * 12.5;
  return `${x.toFixed(1)} ${(100 * voute(x / 500 - 1)).toFixed(2)}`;
});
const COURBE = `M${POINTS.join(" L")}`;
const ECOINCONS = `M0 0 H1000 ${COURBE.replace("M", "L")} Z`;

// 3 ampoules sur mobile, 5 en desktop (`large` = desktop seulement) ; `x` en % de la largeur
const AMPOULES = [
  { x: 14, fil: 40, large: true },
  { x: 20, xLarge: 32, fil: 26 },
  { x: 50, fil: 16, vacille: true },
  { x: 80, xLarge: 68, fil: 32 },
  { x: 86, fil: 46, large: true },
] as const;

const DELAI = 0.15;
const PAS = 0.2;
/** Fin de l'allumage (dernière ampoule), en millisecondes : le scintillement commence après. */
const FIN_ALLUMAGE_MS = (DELAI + (AMPOULES.length - 1) * PAS + 0.7) * 1000;

const lumiere: Variants = {
  eteint: { opacity: 0 },
  allume: (i: number) =>
    AMPOULES[i] && "vacille" in AMPOULES[i]
      ? {
          opacity: [0, 1, 0.2, 1],
          transition: { delay: DELAI + i * PAS, duration: 0.7, times: [0, 0.3, 0.5, 1], ease: "easeOut" },
        }
      : { opacity: 1, transition: { delay: DELAI + i * PAS, duration: 0.5, ease: "easeOut" } },
};

// Petit balancement unique à l'allumage, comme si on venait d'effleurer le fil
const balancement: Variants = {
  eteint: { rotate: 0 },
  allume: (i: number) => ({
    rotate: [0, i % 2 ? -2.5 : 2.5, i % 2 ? 1.2 : -1.2, 0],
    transition: { delay: DELAI + i * PAS, duration: 1.6, ease: "easeInOut" },
  }),
};

const chaleur: Variants = {
  eteint: { opacity: 0 },
  allume: { opacity: 1, transition: { delay: DELAI + AMPOULES.length * PAS, duration: 1.2, ease: "easeOut" } },
};

/**
 * Scintillement : toutes les 1,5 à 4 s, une ampoule visible prise au hasard (jamais deux fois
 * de suite la même) baisse doucement puis reprend. Seulement quand le plafond est à l'écran et
 * l'onglet visible ; rien du tout si le visiteur a demandé de réduire les animations.
 */
function useScintillement(ref: RefObject<HTMLDivElement | null>, allume: boolean) {
  useEffect(() => {
    const plafond = ref.current;
    if (!allume || !plafond || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let visible = true;
    let precedente: Element | null = null;
    let minuteur = 0;
    const vue = new IntersectionObserver(([entree]) => {
      visible = Boolean(entree?.isIntersecting);
    });
    vue.observe(plafond);

    const scintiller = () => {
      // Ampoules affichées à cette largeur (les deux des bords n'existent qu'en grand écran)
      const ampoules = Array.from(plafond.querySelectorAll("[data-ampoule]")).filter((a) => a.getClientRects().length > 0);
      const choix = ampoules.filter((a) => a !== precedente);
      if (visible && !document.hidden && choix.length > 0) {
        const ampoule = choix[Math.floor(Math.random() * choix.length)];
        precedente = ampoule;
        const creux = 0.35 + Math.random() * 0.3;
        // Une baisse lente, ou deux petites à la suite, comme un filament qui hésite
        const images: Keyframe[] =
          Math.random() < 0.55
            ? [{ opacity: 1 }, { opacity: creux, offset: 0.4 }, { opacity: 1 }]
            : [{ opacity: 1 }, { opacity: creux, offset: 0.25 }, { opacity: 0.92, offset: 0.5 }, { opacity: creux + 0.12, offset: 0.72 }, { opacity: 1 }];
        const duree = 900 + Math.random() * 700;
        ampoule.querySelectorAll("[data-lumiere]").forEach((el) => el.animate(images, { duration: duree, easing: "ease-in-out" }));
      }
      minuteur = window.setTimeout(scintiller, 1500 + Math.random() * 2500);
    };
    minuteur = window.setTimeout(scintiller, FIN_ALLUMAGE_MS + 800);

    return () => {
      window.clearTimeout(minuteur);
      vue.disconnect();
    };
  }, [ref, allume]);
}

export function Plafond() {
  const ref = useRef<HTMLDivElement>(null);
  const allume = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  useScintillement(ref, allume);

  return (
    <motion.div
      ref={ref}
      aria-hidden
      // --voute : retombée de la voûte vers les murs ; @container : sa largeur (cqw) donne la pente réelle des pieds
      className="@container pointer-events-none absolute inset-x-0 top-0 h-32 [--voute:2.5rem] md:h-36 md:[--voute:4.5rem]"
      initial="eteint"
      animate={allume ? "allume" : "eteint"}
    >
      {/* La pièce se réchauffe une fois les ampoules allumées */}
      <motion.div
        variants={chaleur}
        className="absolute left-1/2 top-0 h-[28rem] w-[150%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(242,211,140,0.1),transparent_62%)] motion-reduce:opacity-100! md:w-[110%]"
      />
      {/* La voûte : écoinçons Bleu des Allées au-dessus, moulure laiton le long de l'intrados */}
      <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="absolute inset-x-0 top-0 block h-(--voute) w-full" focusable="false">
        <path d={ECOINCONS} className="fill-nuit" />
        <path d={COURBE} fill="none" className="stroke-filet" strokeOpacity={0.7} strokeWidth={1} vectorEffect="non-scaling-stroke" />
      </svg>

      {AMPOULES.map((a, i) => {
        const xLarge = "xLarge" in a ? a.xLarge : a.x;
        const style = {
          "--x": `${a.x}%`,
          "--x-lg": `${xLarge}%`,
          "--accroche": String(voute(a.x / 50 - 1)),
          "--accroche-lg": String(voute(xLarge / 50 - 1)),
          "--pente": String(pente(a.x / 50 - 1)),
          "--pente-lg": String(pente(xLarge / 50 - 1)),
        } as CSSProperties;
        return (
          <Fragment key={i}>
            {/* Pied laiton fixé à la voûte (il ne balance pas) et incliné selon sa pente : son bord haut épouse l'intrados */}
            <span
              style={style}
              className={`${"large" in a ? "hidden md:block" : "block"} absolute left-(--x) top-[calc(var(--voute)_*_var(--accroche)_-_1px)] h-1.5 w-4 -translate-x-1/2 origin-top rounded-b-full bg-filet/80 [rotate:atan2(calc(var(--voute)*var(--pente)*2),100cqw)] md:left-(--x-lg) md:top-[calc(var(--voute)_*_var(--accroche-lg)_-_1px)] md:[rotate:atan2(calc(var(--voute)*var(--pente-lg)*2),100cqw)]`}
            />
            <motion.div
              data-ampoule
              custom={i}
              variants={balancement}
              style={style}
              // Le fil part du pied : il pend droit et se balance autour de ce point
              className={`${"large" in a ? "hidden md:flex" : "flex"} absolute left-(--x) top-[calc(var(--voute)_*_var(--accroche)_+_0.25rem)] -translate-x-1/2 origin-top flex-col items-center md:left-(--x-lg) md:top-[calc(var(--voute)_*_var(--accroche-lg)_+_0.25rem)]`}
            >
              <span className="block w-px bg-pierre/45" style={{ height: a.fil }} />
              <div className="relative">
                <motion.div
                  data-lumiere
                  custom={i}
                  variants={lumiere}
                  className="absolute left-1/2 top-[60%] size-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(242,211,140,0.42)_0%,rgba(242,211,140,0.13)_36%,transparent_68%)] motion-reduce:opacity-100! md:size-48"
                />
                <Ampoule index={i} />
              </div>
            </motion.div>
          </Fragment>
        );
      })}
    </motion.div>
  );
}

/** Ampoule à filament type Edison, dessinée à la main. */
function Ampoule({ index }: { index: number }) {
  const lueur = `lueur-${useId().replace(/[^\w-]/g, "")}`;
  const verre =
    "M10.5 10 H17.5 C17.5 14 25.5 18 25.5 29 C25.5 38.5 20.3 45 14 45 C7.7 45 2.5 38.5 2.5 29 C2.5 18 10.5 14 10.5 10 Z";
  const filament = "M10.5 27 L12.25 23.5 L14 27 L15.75 23.5 L17.5 27";

  return (
    <svg viewBox="0 0 28 46" width="28" height="46" className="relative block h-auto w-8 md:w-10" fill="none">
      <defs>
        <radialGradient id={lueur}>
          <stop offset="0%" stopColor="var(--color-halo)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--color-halo)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Douille laiton */}
      <rect x="9" y="0" width="10" height="10.5" rx="2" fill="var(--color-filet)" />
      <path d="M9 3.5h10M9 6.8h10" stroke="var(--color-minuit)" strokeOpacity="0.55" strokeWidth="0.8" />

      {/* Éteinte */}
      <path d={verre} fill="var(--color-calcaire)" fillOpacity="0.05" stroke="var(--color-pierre)" strokeOpacity="0.45" strokeWidth="0.9" />
      <path d="M12.3 10.5 V21 L10.5 27 M15.7 10.5 V21 L17.5 27" stroke="var(--color-pierre)" strokeOpacity="0.45" strokeWidth="0.7" />
      <path d={filament} stroke="var(--color-pierre)" strokeOpacity="0.55" strokeWidth="0.9" strokeLinejoin="round" />

      {/* Allumée */}
      <motion.g data-lumiere custom={index} variants={lumiere} className="motion-reduce:opacity-100!">
        <circle cx="14" cy="26" r="12" fill={`url(#${lueur})`} />
        <path d={verre} fill="var(--color-halo)" fillOpacity="0.28" stroke="var(--color-or-clair)" strokeOpacity="0.75" strokeWidth="0.9" />
        <path d={filament} stroke="var(--color-or-clair)" strokeWidth="1.3" strokeLinejoin="round" />
        <path d={filament} stroke="var(--color-calcaire-clair)" strokeWidth="0.5" strokeLinejoin="round" />
      </motion.g>
    </svg>
  );
}
