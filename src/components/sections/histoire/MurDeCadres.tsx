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

type Cadre = { type: "pizza"; pizza: Pizza; rotation: number } | { type: "ardoise"; texte: string };

/**
 * Un cadre accroché : sa largeur en grand écran (part de la colonne), sa marge
 * haute et l'amplitude de son parallaxe (px). `cote` alterne le bord des
 * ardoises (gauche/droite) pour l'allure irrégulière du mur ; les pizzas
 * l'ignorent, toujours centrées sur l'axe de leur colonne (leur pelle doit
 * rester au milieu de sa moitié de page, quelle que soit sa taille). Sur
 * mobile, où les colonnes sont étroites, les ardoises prennent toute la colonne.
 */
type Accroche = { cadre: Cadre; largeur: string; cote?: "gauche" | "droite"; haut?: string; amplitude: number };

function composer(): { gauche: Accroche[]; droite: Accroche[] } {
  const catalogue: readonly Pizza[] = site.pizzas;
  const pizzas = TEXTES.pizzas.map((id) => catalogue.find((p) => p.id === id)).filter((p): p is Pizza => Boolean(p));
  const [a0, a1, a2, a3, a4] = TEXTES.ardoises;

  const gauche: (Accroche | false | undefined)[] = [
    pizzas[0] && { cadre: { type: "pizza", pizza: pizzas[0], rotation: -5 }, largeur: "84%", amplitude: 46 },
    a0 && { cadre: { type: "ardoise", texte: a0 }, largeur: "84%", cote: "gauche", amplitude: 64 },
    a1 && { cadre: { type: "ardoise", texte: a1 }, largeur: "90%", cote: "droite", amplitude: 82 },
    pizzas[2] && { cadre: { type: "pizza", pizza: pizzas[2], rotation: 4 }, largeur: "72%", haut: "0.5rem", amplitude: 100 },
    a3 && { cadre: { type: "ardoise", texte: a3 }, largeur: "88%", cote: "gauche", amplitude: 116 },
  ];
  const droite: (Accroche | false | undefined)[] = [
    a2 && { cadre: { type: "ardoise", texte: a2 }, largeur: "100%", cote: "gauche", amplitude: 92 },
    pizzas[1] && { cadre: { type: "pizza", pizza: pizzas[1], rotation: 6 }, largeur: "78%", amplitude: 108 },
    a4 && { cadre: { type: "ardoise", texte: a4 }, largeur: "92%", cote: "droite", amplitude: 122 },
    pizzas[3] && { cadre: { type: "pizza", pizza: pizzas[3], rotation: -4 }, largeur: "62%", haut: "0.5rem", amplitude: 100 },
  ];
  const garder = (liste: (Accroche | false | undefined)[]) => liste.filter((a): a is Accroche => Boolean(a));
  return { gauche: garder(gauche), droite: garder(droite) };
}

const ACCROCHAGE = composer();

/** Rétroéclairage : une lueur chaude sur le mur, qui s'allume (avec un léger vacillement) à l'arrivée à l'écran. */
function Lueur() {
  return (
    <motion.span
      aria-hidden
      className="absolute inset-0 -z-10 rounded-[inherit] shadow-[0_0_54px_14px_rgb(from_var(--color-halo)_r_g_b_/_0.28),0_0_140px_46px_rgb(from_var(--color-halo)_r_g_b_/_0.12)] motion-reduce:opacity-100!"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: [0, 1, 0.45, 1] }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 1.2, times: [0, 0.35, 0.55, 1], ease: "easeOut" }}
    />
  );
}

const TAILLES_CADRE = "(min-width: 1024px) 260px, 46vw";

/*
 * Bois de la pelle : fixe, ne suit pas la palette (du vrai bois ne change pas de
 * couleur selon la déco du restaurant — seule la lueur derrière reste réactive).
 * Le grain (texture-grain.png, déjà utilisé pour les ardoises à 0,14 d'opacité)
 * est posé en fin calque par-dessus le dégradé, jamais mélangé à pleine force.
 */
const MANCHE_FORME = "polygon(30% 0%, 70% 0%, 84% 92%, 68% 100%, 32% 100%, 16% 92%)";
const BOIS_LAME: CSSProperties = { background: "linear-gradient(155deg,#e6c799,#cd9f66 45%,#a97a48 100%)" };
const BOIS_MANCHE: CSSProperties = { background: "linear-gradient(170deg,#e2c093,#c69b63 50%,#9c7442 100%)", clipPath: MANCHE_FORME };

/** Une pizza posée sur sa pelle en bois, rétroéclairée, son nom écrit dessous. */
function CadrePizza({ pizza, rotation }: { pizza: Pizza; rotation: number }) {
  return (
    <figure className="flex flex-col items-center">
      <div className="relative w-full" style={{ transform: `rotate(${rotation}deg)` }}>
        {/* Le manche, dans le prolongement de la lame */}
        <span
          aria-hidden
          className="absolute left-1/2 top-[58%] h-[44%] w-[24%] -translate-x-1/2 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.15)]"
          style={BOIS_MANCHE}
        >
          <span aria-hidden className="texture-grain absolute inset-0 opacity-[0.14]" style={{ clipPath: MANCHE_FORME }} />
        </span>
        {/* La lame, ronde */}
        <div className="relative isolate aspect-square w-full rounded-full">
          <Lueur />
          <span
            aria-hidden
            className="absolute inset-0 rounded-full shadow-[0_24px_48px_-20px_rgba(0,0,0,0.85),inset_0_0_0_1px_rgba(0,0,0,0.2)]"
            style={BOIS_LAME}
          >
            <span aria-hidden className="texture-grain absolute inset-0 rounded-full opacity-[0.14]" />
          </span>
          <span className="absolute inset-[7%] block overflow-hidden rounded-full">
            {pizza.video ? (
              <TableauVivant video={pizza.video} alt={pizza.description} sizes={TAILLES_CADRE} />
            ) : (
              <Image
                src={pizza.image}
                alt={pizza.description}
                fill
                sizes={TAILLES_CADRE}
                className="object-contain drop-shadow-[0_16px_18px_rgba(0,0,0,0.5)]"
              />
            )}
          </span>
          <span aria-hidden className="pointer-events-none absolute inset-[7%] rounded-full ring-1 ring-inset ring-black/15" />
        </div>
      </div>
      {/* Le nom, à la craie sous la pelle */}
      <figcaption className="relative z-10 mt-4 text-center">
        <span aria-hidden className="mx-auto mb-2 block h-px w-8 bg-or-clair/70" />
        <span className="font-display text-[1rem] italic leading-none text-calcaire/90 [text-shadow:0_0_10px_rgb(from_var(--color-calcaire)_r_g_b_/_0.35)]">
          {pizza.nom}
        </span>
      </figcaption>
    </figure>
  );
}

/** Une ardoise, dans un fin double-liseré de laiton : la phrase s'y écrit à la main. */
function CadreArdoise({ texte }: { texte: string }) {
  return (
    <div className="relative isolate rounded-[10px] border border-filet/50 p-[3px] shadow-[0_18px_40px_-24px_rgba(0,0,0,0.75)]">
      <div className="relative overflow-hidden rounded-[7px] border border-filet/35 bg-minuit px-4 pb-5 pt-4 sm:px-5 sm:pb-6 sm:pt-5 lg:px-6 lg:pb-7 lg:pt-6">
        <span aria-hidden className="texture-grain absolute inset-0 opacity-[0.14]" />
        <span aria-hidden className="relative mb-3 block h-px w-8 bg-or-clair/70 sm:mb-4 sm:w-9" />
        <TexteEcrit
          texte={typographie(texte)}
          className="relative font-display text-[0.98rem] font-medium italic leading-[1.45] text-calcaire sm:text-[1.05rem] sm:leading-[1.5] lg:text-[1.2rem]"
        />
      </div>
    </div>
  );
}

function CadreQuelconque({ cadre }: { cadre: Cadre }) {
  return cadre.type === "pizza" ? <CadrePizza pizza={cadre.pizza} rotation={cadre.rotation} /> : <CadreArdoise texte={cadre.texte} />;
}

/** Un cadre accroché au mur, qui glisse à sa propre vitesse au défilement. */
function Accroche({ a, progression, reduire }: { a: Accroche; progression: MotionValue<number>; reduire: boolean }) {
  const y = useTransform(progression, [0, 1], [a.amplitude, -a.amplitude]);
  const style = {
    "--largeur": a.cadre.type === "ardoise" ? "100%" : a.largeur,
    "--largeur-lg": a.largeur,
    alignSelf: a.cadre.type === "pizza" ? "center" : a.cote === "droite" ? "flex-end" : "flex-start",
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
