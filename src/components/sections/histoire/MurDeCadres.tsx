"use client";

import Image from "next/image";
import type { CSSProperties, RefObject } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { site, type Pizza } from "@/config/site";
import { typographie } from "@/lib/textes";
import { TableauVivant } from "./TableauVivant";
import { TexteEcrit } from "./TexteEcrit";
import { MOUVEMENT_REDUIT, useMedia } from "./useMedia";

const TEXTES = site.textes.histoire.mur;

/*
 * Le mur de cadres, comme dans une salle à manger : des cadres de tailles et de
 * formes différentes (ronds, ovales, carrés), accrochés sur deux colonnes
 * irrégulières. Les pizzas y sont exposées en portraits rétroéclairés (une
 * lueur chaude sur le mur autour du cadre, qui s'allume à l'arrivée à l'écran) ;
 * une pizza qui a une vidéo devient un tableau vivant (voir TableauVivant) ;
 * cinq ardoises portent des phrases qui s'écrivent à la main. Au défilement,
 * chaque cadre glisse à sa propre vitesse (parallaxe), d'autant plus que l'on
 * descend. (Les photos de la salle vivent dans la galerie qui défile, plus bas :
 * Julien a préféré ne pas les dupliquer ici.)
 */

type Cadre = { type: "pizza"; pizza: Pizza; forme: "rond" | "ovale" | "carre" } | { type: "ardoise"; texte: string };

/**
 * Un cadre accroché : sa largeur en grand écran (part de la colonne), son côté,
 * sa marge haute et l'amplitude de son parallaxe (px). Sur mobile, où les
 * colonnes sont étroites, les ardoises prennent toute la colonne.
 */
type Accroche = { cadre: Cadre; largeur: string; cote: "gauche" | "droite"; haut?: string; amplitude: number };

function composer(): { gauche: Accroche[]; droite: Accroche[] } {
  const catalogue: readonly Pizza[] = site.pizzas;
  const pizzas = TEXTES.pizzas.map((id) => catalogue.find((p) => p.id === id)).filter((p): p is Pizza => Boolean(p));
  const [a0, a1, a2, a3, a4] = TEXTES.ardoises;

  const gauche: (Accroche | false | undefined)[] = [
    pizzas[0] && { cadre: { type: "pizza", pizza: pizzas[0], forme: "rond" }, largeur: "90%", cote: "droite", amplitude: 46 },
    a0 && { cadre: { type: "ardoise", texte: a0 }, largeur: "84%", cote: "gauche", amplitude: 64 },
    a1 && { cadre: { type: "ardoise", texte: a1 }, largeur: "90%", cote: "droite", amplitude: 82 },
    pizzas[2] && { cadre: { type: "pizza", pizza: pizzas[2], forme: "carre" }, largeur: "78%", cote: "gauche", haut: "0.5rem", amplitude: 100 },
    a3 && { cadre: { type: "ardoise", texte: a3 }, largeur: "88%", cote: "gauche", amplitude: 116 },
  ];
  const droite: (Accroche | false | undefined)[] = [
    a2 && { cadre: { type: "ardoise", texte: a2 }, largeur: "100%", cote: "gauche", amplitude: 92 },
    pizzas[1] && { cadre: { type: "pizza", pizza: pizzas[1], forme: "ovale" }, largeur: "84%", cote: "gauche", amplitude: 108 },
    a4 && { cadre: { type: "ardoise", texte: a4 }, largeur: "92%", cote: "droite", amplitude: 122 },
    pizzas[3] && { cadre: { type: "pizza", pizza: pizzas[3], forme: "rond" }, largeur: "66%", cote: "gauche", haut: "0.5rem", amplitude: 100 },
  ];
  const garder = (liste: (Accroche | false | undefined)[]) => liste.filter((a): a is Accroche => Boolean(a));
  return { gauche: garder(gauche), droite: garder(droite) };
}

const ACCROCHAGE = composer();

/** Moulures : chêne clair avec un filet d'or à l'intérieur, ou un fin laiton. */
const MOULURE = {
  chene: "border-[7px] border-chene shadow-[0_24px_48px_-20px_rgba(0,0,0,0.85)]",
  laiton: "border-[3px] border-filet shadow-[0_24px_48px_-20px_rgba(0,0,0,0.85)]",
} as const;

const FILET_INTERIEUR = "pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-filet/70";

/** Rétroéclairage : une lueur chaude sur le mur, qui s'allume (avec un léger vacillement) à l'arrivée à l'écran. */
function Lueur() {
  return (
    <motion.span
      aria-hidden
      className="absolute inset-0 -z-10 rounded-[inherit] shadow-[0_0_54px_14px_rgba(242,211,140,0.28),0_0_140px_46px_rgba(242,211,140,0.12)] motion-reduce:opacity-100!"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: [0, 1, 0.45, 1] }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 1.2, times: [0, 0.35, 0.55, 1], ease: "easeOut" }}
    />
  );
}

const FORMES_PIZZA = {
  rond: "aspect-square rounded-full",
  ovale: "aspect-[4/5] rounded-[50%]",
  carre: "aspect-square rounded-[4px]",
} as const;

const TAILLES_CADRE = "(min-width: 1024px) 260px, 46vw";

/** Une pizza en portrait (ou en tableau vivant), dans un cadre rétroéclairé, avec son cartel de laiton. */
function CadrePizza({ pizza, forme }: { pizza: Pizza; forme: keyof typeof FORMES_PIZZA }) {
  const surMat = forme === "carre";
  return (
    <figure className="flex flex-col items-center">
      <div className={`relative isolate w-full ${FORMES_PIZZA[forme]} ${surMat ? MOULURE.laiton : MOULURE.chene}`}>
        <Lueur />
        <span
          className={`absolute inset-0 block overflow-hidden rounded-[inherit] ${
            surMat
              ? "bg-[radial-gradient(circle_at_50%_48%,#fff8ea,var(--color-calcaire-clair)_58%,#efdcbf)]"
              : "bg-[radial-gradient(circle_at_50%_47%,rgba(242,211,140,0.72),rgba(233,185,80,0.24)_44%,#0a1846_74%)]"
          }`}
        >
          {pizza.video ? (
            <TableauVivant video={pizza.video} alt={pizza.description} sizes={TAILLES_CADRE} />
          ) : (
            <Image
              src={pizza.image}
              alt={pizza.description}
              fill
              sizes={TAILLES_CADRE}
              className="object-contain p-[8%] drop-shadow-[0_16px_18px_rgba(0,0,0,0.5)]"
            />
          )}
        </span>
        <span aria-hidden className={FILET_INTERIEUR} />
      </div>
      {/* Cartel de laiton, comme au musée */}
      <figcaption className="relative z-10 -mt-3 whitespace-nowrap rounded-[3px] bg-[linear-gradient(180deg,#e9cc86,#b8924f_55%,#a08049)] px-3 py-1 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-nuit shadow-[0_2px_6px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.4)]">
        {pizza.nom}
      </figcaption>
    </figure>
  );
}

/** Une ardoise dans un cadre de chêne : la phrase s'y écrit à la main. */
function CadreArdoise({ texte }: { texte: string }) {
  return (
    <div className={`relative isolate rounded-[4px] ${MOULURE.chene}`}>
      <div className="relative overflow-hidden rounded-[inherit] bg-[#07123a] px-4 pb-5 pt-4 sm:px-5 sm:pb-6 sm:pt-5 lg:px-6 lg:pb-7 lg:pt-6">
        <span aria-hidden className="texture-grain absolute inset-0 opacity-[0.14]" />
        <span aria-hidden className="relative mb-3 block h-px w-8 bg-or-clair/70 sm:mb-4 sm:w-9" />
        <TexteEcrit
          texte={typographie(texte)}
          className="relative font-display text-[0.98rem] font-medium italic leading-[1.45] text-calcaire sm:text-[1.05rem] sm:leading-[1.5] lg:text-[1.2rem]"
        />
      </div>
      <span aria-hidden className={FILET_INTERIEUR} />
    </div>
  );
}

function CadreQuelconque({ cadre }: { cadre: Cadre }) {
  return cadre.type === "pizza" ? <CadrePizza pizza={cadre.pizza} forme={cadre.forme} /> : <CadreArdoise texte={cadre.texte} />;
}

/** Un cadre accroché au mur, qui glisse à sa propre vitesse au défilement. */
function Accroche({ a, progression, reduire }: { a: Accroche; progression: MotionValue<number>; reduire: boolean }) {
  const y = useTransform(progression, [0, 1], [a.amplitude, -a.amplitude]);
  const style = {
    "--largeur": a.cadre.type === "ardoise" ? "100%" : a.largeur,
    "--largeur-lg": a.largeur,
    alignSelf: a.cote === "droite" ? "flex-end" : "flex-start",
    marginTop: a.haut,
  } as CSSProperties;
  return (
    <motion.div className={`w-(--largeur) lg:w-(--largeur-lg) ${reduire ? "" : "will-change-transform"}`} style={{ ...style, y: reduire ? 0 : y }}>
      <CadreQuelconque cadre={a.cadre} />
    </motion.div>
  );
}

type Props = {
  /** Élément du mur (partagé avec le manifeste, qui s'allume sur son entrée à l'écran). */
  conteneur: RefObject<HTMLDivElement | null>;
  className?: string;
};

export function MurDeCadres({ conteneur, className }: Props) {
  const reduire = useMedia(MOUVEMENT_REDUIT);
  const { scrollYProgress } = useScroll({ target: conteneur, offset: ["start end", "end start"] });

  return (
    <div ref={conteneur} role="group" aria-label={TEXTES.aria} className={`relative grid grid-cols-2 gap-x-4 lg:gap-x-8 ${className ?? ""}`}>
      <div className="flex flex-col gap-y-9 lg:gap-y-11">
        {ACCROCHAGE.gauche.map((a, i) => (
          <Accroche key={i} a={a} progression={scrollYProgress} reduire={reduire} />
        ))}
      </div>
      {/* La colonne de droite est accrochée un peu plus bas : rien n'est aligné, comme sur un vrai mur */}
      <div className="flex flex-col gap-y-9 pt-12 lg:gap-y-11 lg:pt-20">
        {ACCROCHAGE.droite.map((a, i) => (
          <Accroche key={i} a={a} progression={scrollYProgress} reduire={reduire} />
        ))}
      </div>
    </div>
  );
}
