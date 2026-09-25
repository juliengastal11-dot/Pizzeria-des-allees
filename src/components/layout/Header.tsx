"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useLenis } from "lenis/react";
import { BoutonCommander, BoutonReserver } from "@/components/actions/Boutons";
import { useActions } from "@/components/providers/ActionsProvider";
import { site } from "@/config/site";
import { MenuPlein } from "./MenuPlein";
import { SECTIONS, ancre, type IdSection } from "./navigation";

const ressort = { type: "spring", stiffness: 420, damping: 42 } as const;
const ressortCapsule = { type: "spring", stiffness: 380, damping: 36 } as const;
const entree = [0.22, 1, 0.36, 1] as const;
// Boutons compacts de la capsule (44 px de haut)
const compact = "h-11 min-h-11! px-4! text-[0.9375rem]!";

/** Section de l'accueil qui traverse le milieu de l'écran. */
function useSectionActive(surAccueil: boolean): IdSection | null {
  const [section, setSection] = useState<IdSection | null>(null);

  useEffect(() => {
    if (!surAccueil) return;
    const cibles = SECTIONS.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => el !== null);
    if (cibles.length === 0) return;
    const visibles = new Set<string>();
    const observateur = new IntersectionObserver(
      (entrees) => {
        for (const e of entrees) {
          if (e.isIntersecting) visibles.add(e.target.id);
          else visibles.delete(e.target.id);
        }
        setSection(SECTIONS.find((s) => visibles.has(s.id))?.id ?? null);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    cibles.forEach((el) => observateur.observe(el));
    return () => observateur.disconnect();
  }, [surAccueil]);

  return surAccueil ? section : null;
}

/** Vrai si le focus clavier est dans l'élément : le bandeau ne doit alors pas se cacher. */
function focusClavierDans(el: HTMLElement | null) {
  const actif = document.activeElement;
  return !!el && actif instanceof HTMLElement && el.contains(actif) && actif.matches(":focus-visible");
}

function BoutonMenu({ ouvert, controle, onClick }: { ouvert: boolean; controle: string; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-expanded={ouvert}
      aria-controls={controle}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="group inline-flex h-11 shrink-0 items-center gap-2.5 rounded-full border-[1.5px] border-calcaire/85 px-4 text-[0.9375rem] font-semibold text-calcaire transition-colors hover:bg-calcaire/10"
    >
      <span aria-hidden className="flex w-4 flex-col gap-[5px]">
        <span className="h-[1.5px] w-4 rounded-full bg-current" />
        <span className="h-[1.5px] w-2.5 origin-left rounded-full bg-current transition-transform duration-300 ease-out group-hover:scale-x-[1.6]" />
      </span>
      Menu
    </motion.button>
  );
}

function LienLogo({ taille, className }: { taille: number; className?: string }) {
  return (
    <a href={ancre("accueil")} aria-label={`${site.nom}, accueil`} className={className}>
      <Image src={site.logo.src} alt="" width={taille} height={taille} className="shrink-0" style={{ width: taille, height: taille }} />
    </a>
  );
}

/**
 * En-tête fixe.
 * - Mobile : logo + nom + « Menu », transparent sur le hero puis fond minuit ;
 *   se retire quand on descend, revient dès qu'on remonte.
 * - Tablette et ordinateur : capsule flottante (liens + point de lumière sur la
 *   section en cours) ; Commander / Réserver n'y paraissent qu'une fois ceux du hero sortis de l'écran.
 */
export function Header() {
  const { ctaHeroVisibles, setMenuOuvert } = useActions();
  const surAccueil = usePathname() === "/";
  const ctaDansHeader = !(surAccueil && ctaHeroVisibles);
  const section = useSectionActive(surAccueil);
  const lenis = useLenis();
  const idMenu = useId();
  const refHeader = useRef<HTMLElement>(null);
  const sens = useRef<{ vers: "haut" | "bas"; depuis: number }>({ vers: "haut", depuis: 0 });

  const [menu, setMenu] = useState(false);
  const [fond, setFond] = useState(false);
  const [masque, setMasque] = useState(false);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => {
    const avant = scrollY.getPrevious() ?? y;
    setFond(y > 40);
    const vers = y > avant ? "bas" : y < avant ? "haut" : sens.current.vers;
    if (vers !== sens.current.vers) sens.current = { vers, depuis: avant };
    // Petit seuil pour ignorer les tremblements du doigt
    if (y <= 200) setMasque(false);
    else if (vers === "bas" && y - sens.current.depuis > 12 && !focusClavierDans(refHeader.current)) setMasque(true);
    else if (vers === "haut" && sens.current.depuis - y > 12) setMasque(false);
  });

  const ouvrir = () => {
    setMenu(true);
    setMasque(false);
    setMenuOuvert(true);
    lenis?.stop();
  };
  const fermer = () => {
    setMenu(false);
    setMenuOuvert(false);
    lenis?.start();
  };

  return (
    <>
      <header
        ref={refHeader}
        className="pointer-events-none fixed inset-x-0 top-0 z-50"
        onFocus={(e) => {
          if (e.target instanceof HTMLElement && e.target.matches(":focus-visible")) setMasque(false);
        }}
      >
        {/* Mobile */}
        <motion.div
          className="pointer-events-auto relative pt-[env(safe-area-inset-top)] md:hidden"
          initial={false}
          animate={{ y: masque && !menu ? "-100%" : "0%" }}
          transition={ressort}
        >
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-linear-to-b from-nuit/70 via-nuit/25 to-transparent"
            initial={false}
            animate={{ opacity: fond ? 0 : 1 }}
            transition={{ duration: 0.35 }}
          />
          <motion.div
            aria-hidden
            className="absolute inset-0 border-b border-filet/30 bg-minuit/95"
            initial={false}
            animate={{ opacity: fond ? 1 : 0 }}
            transition={{ duration: 0.35 }}
          />
          <div className="relative flex h-16 items-center justify-between gap-3 px-4">
            <a href={ancre("accueil")} aria-label={`${site.nom}, accueil`} className="flex min-h-11 items-center gap-2.5 rounded-full">
              <Image src={site.logo.src} alt="" width={42} height={42} className="size-[42px] shrink-0" />
              <span aria-hidden className="font-display text-[1.02rem] font-semibold leading-[1.02] text-calcaire max-[359px]:hidden">
                <span className="block">{site.nomLignes[0]}</span>
                <span className="block">{site.nomLignes[1]}</span>
              </span>
            </a>
            <BoutonMenu ouvert={menu} controle={idMenu} onClick={ouvrir} />
          </div>
        </motion.div>

        {/* Tablette et ordinateur : capsule flottante */}
        <div className="hidden justify-center px-4 pt-[max(0.75rem,env(safe-area-inset-top))] md:flex">
          <motion.div
            layout
            transition={{ layout: ressortCapsule }}
            style={{ borderRadius: 9999 }}
            className="pointer-events-auto flex items-center gap-1 border border-filet/50 bg-minuit/90 p-1.5 shadow-[0_12px_32px_rgba(6,15,46,0.4)]"
          >
            <motion.div layout="position" className="flex items-center gap-1">
              <LienLogo taille={40} className="grid size-11 shrink-0 place-items-center rounded-full" />
              <nav aria-label="Navigation principale" className="hidden lg:block">
                <ul className="flex items-center">
                  {SECTIONS.map((s) => {
                    const actif = section === s.id;
                    return (
                      <li key={s.id}>
                        <a
                          href={ancre(s.id)}
                          aria-current={actif ? "location" : undefined}
                          className="relative flex h-11 items-center rounded-full px-3 text-[15px] font-medium text-calcaire transition-colors duration-200 hover:text-or-clair xl:px-3.5"
                        >
                          {s.libelle}
                          {actif && (
                            <motion.span
                              layoutId="point-de-lumiere"
                              aria-hidden
                              className="absolute inset-x-0 bottom-1 mx-auto size-[5px] rounded-full bg-halo shadow-[0_0_10px_2px_rgba(242,211,140,0.55)]"
                              transition={{ type: "spring", stiffness: 500, damping: 34 }}
                            />
                          )}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </motion.div>

            <AnimatePresence initial={false}>
              {ctaDansHeader && (
                <motion.div
                  key="cta"
                  layout="position"
                  className="flex items-center gap-1.5 pl-1"
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 14 }}
                  transition={{ duration: 0.35, ease: entree }}
                >
                  <BoutonReserver variante="contour" className={compact}>
                    Réserver<span className="sr-only"> une table</span>
                  </BoutonReserver>
                  <BoutonCommander variante="or" className={compact} />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div layout="position" className="lg:hidden">
              <BoutonMenu ouvert={menu} controle={idMenu} onClick={ouvrir} />
            </motion.div>
          </motion.div>
        </div>
      </header>

      <MenuPlein id={idMenu} ouvert={menu} onFermer={fermer} />
    </>
  );
}
