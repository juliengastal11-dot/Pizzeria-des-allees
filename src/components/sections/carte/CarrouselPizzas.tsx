"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { site, type Pizza } from "@/config/site";
import { remplir } from "@/lib/textes";
import { CartePizza } from "./CartePizza";
import { useEcranLarge, useHydrate } from "./hooks";

const TEXTES = site.textes.carte.carrousel;

// Distance entre deux points de l'indicateur (point de 8 px + écart de 8 px).
const ECART_POINTS = 16;

type Props = {
  pizzas: readonly Pizza[];
  className?: string;
};

/**
 * Mobile et tablette : carrousel horizontal natif (scroll-snap), une carte
 * centrée, les voisines qui dépassent. Écran large : grille 3 × 2 en arches
 * décalées. Un seul balisage pour les deux, les images ne sont chargées qu'une fois.
 */
export function CarrouselPizzas({ pizzas, className }: Props) {
  const defileur = useRef<HTMLDivElement>(null);
  const idDefileur = useId();
  const large = useEcranLarge();
  const hydrate = useHydrate();
  const reduire = useReducedMotion() ?? false;
  const n = pizzas.length;
  const mobile = !large;

  // Pas entre deux cartes (largeur + écart), mesuré sur le vrai rendu.
  const pas = useMotionValue(0);
  const { scrollX } = useScroll({ container: defileur });
  const position = useTransform([scrollX, pas], ([x, p]: number[]) => (p > 0 ? Math.min(n - 1, Math.max(0, x / p)) : 0));
  const xPastille = useTransform(position, (v) => v * ECART_POINTS);
  const [actif, setActif] = useState(0);

  useMotionValueEvent(position, "change", (v) => {
    const i = Math.round(v);
    setActif((a) => (a === i ? a : i));
  });

  useEffect(() => {
    const el = defileur.current;
    if (!el) return;
    const mesurer = () => {
      const cartes = el.querySelectorAll<HTMLElement>("[data-pizza]");
      if (cartes.length > 1) pas.set(cartes[1].offsetLeft - cartes[0].offsetLeft);
    };
    mesurer();
    const observateur = new ResizeObserver(mesurer);
    observateur.observe(el);
    return () => observateur.disconnect();
  }, [pas]);

  const aller = (i: number) => {
    const el = defileur.current;
    const p = pas.get();
    if (!el || !p) return;
    const cible = Math.min(n - 1, Math.max(0, i));
    el.scrollTo({ left: cible * p, behavior: reduire ? "auto" : "smooth" });
  };

  return (
    <div className={className}>
      <div
        ref={defileur}
        id={idDefileur}
        data-lenis-prevent-horizontal
        role={mobile ? "region" : undefined}
        aria-label={mobile ? TEXTES.aria : undefined}
        tabIndex={mobile ? 0 : undefined}
        className="relative snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain pb-8 pt-28 [scrollbar-width:none] focus-visible:[outline-offset:-4px] [&::-webkit-scrollbar]:hidden lg:snap-none lg:overflow-visible lg:pb-0 lg:pt-24"
      >
        <motion.ul
          data-animation="pizzas-entree"
          initial="cache"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="flex gap-4 [--carte:min(78vw,22rem)] before:w-[calc((100%_-_var(--carte))_/_2_-_1rem)] before:shrink-0 before:content-[''] after:w-[calc((100%_-_var(--carte))_/_2_-_1rem)] after:shrink-0 after:content-[''] lg:mx-auto lg:grid lg:max-w-6xl lg:grid-cols-3 lg:items-start lg:gap-x-8 lg:gap-y-28 lg:px-5 lg:before:hidden lg:after:hidden"
        >
          {pizzas.map((pizza, i) => (
            <CartePizza
              key={pizza.id}
              pizza={pizza}
              index={i}
              defileur={defileur}
              roule={hydrate && mobile && !reduire}
              survolActif={!reduire}
            />
          ))}
        </motion.ul>
      </div>

      {n > 1 && (
        <div className="flex items-center justify-center gap-5 lg:hidden">
          <BoutonFleche sens="precedent" inactif={actif === 0} controle={idDefileur} onClick={() => aller(actif - 1)} />
          <div aria-hidden className="relative flex h-2 items-center gap-2">
            {pizzas.map((pizza) => (
              <span key={pizza.id} className="size-2 rounded-full bg-nuit/25" />
            ))}
            <motion.span className="absolute -left-1 top-0 h-2 w-4 rounded-full bg-nuit" style={{ x: xPastille }} />
          </div>
          <BoutonFleche sens="suivant" inactif={actif === n - 1} controle={idDefileur} onClick={() => aller(actif + 1)} />
          <p className="sr-only" aria-live="polite">
            {remplir(TEXTES.position, { n: actif + 1, total: n, nom: pizzas[actif]?.nom ?? "" })}
          </p>
        </div>
      )}
    </div>
  );
}

function BoutonFleche({
  sens,
  inactif,
  controle,
  onClick,
}: {
  sens: "precedent" | "suivant";
  inactif: boolean;
  controle: string;
  onClick: () => void;
}) {
  const Icone = sens === "precedent" ? ArrowLeft : ArrowRight;
  return (
    <motion.button
      type="button"
      // aria-disabled plutôt que disabled : le focus clavier ne saute pas au bout du carrousel
      aria-disabled={inactif}
      aria-controls={controle}
      onClick={() => {
        if (!inactif) onClick();
      }}
      whileTap={inactif ? undefined : { scale: 0.9 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="grid size-11 place-items-center rounded-full border-2 border-encre text-encre transition-[background-color,color,opacity] duration-200 hover:bg-nuit hover:text-calcaire aria-disabled:cursor-default aria-disabled:opacity-40 aria-disabled:hover:bg-transparent aria-disabled:hover:text-encre"
    >
      <Icone aria-hidden className="size-5" strokeWidth={2.2} />
      <span className="sr-only">{sens === "precedent" ? TEXTES.precedente : TEXTES.suivante}</span>
    </motion.button>
  );
}
