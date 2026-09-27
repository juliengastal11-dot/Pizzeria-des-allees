"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useLenis } from "lenis/react";
import { BoutonCommander, BoutonReserver } from "@/components/actions/Boutons";
import { useActions, useEtatActions } from "@/components/providers/ActionsProvider";
import { site } from "@/config/site";
import { remplir } from "@/lib/textes";
import { MenuPlein } from "./MenuPlein";
import { BandeauEssai } from "./BandeauEssai";
import { SECTIONS, ancre, type IdSection } from "./navigation";

const ressort = { type: "spring", stiffness: 420, damping: 42 } as const;
const ressortCapsule = { type: "spring", stiffness: 380, damping: 36 } as const;
const entree = [0.22, 1, 0.36, 1] as const;
// Boutons compacts de la capsule (44 px de haut)
const compact = "h-11 min-h-11! px-4! text-[0.9375rem]!";
const { actions } = site.textes;
const nomAccueil = remplir(site.navigation.lienAccueil, { nom: site.nom });

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

/** « Incrusté » : sur la photo du hero, un rond de verre fumé qui laisse voir la devanture. */
function BoutonMenu({ ouvert, controle, incruste = false, onClick }: { ouvert: boolean; controle?: string; incruste?: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-expanded={ouvert}
      aria-controls={controle}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`group grid size-11 shrink-0 place-items-center rounded-full border-[1.5px] text-calcaire transition-[background-color,border-color,box-shadow] duration-300 ${
        incruste
          ? "border-calcaire/55 bg-minuit/35 shadow-[0_6px_20px_rgba(6,15,46,0.35)] backdrop-blur-md hover:bg-minuit/55"
          : "border-calcaire/85 hover:bg-calcaire/10"
      }`}
    >
      <span aria-hidden className="flex w-4 flex-col gap-[5px]">
        <span className="h-[1.5px] w-4 rounded-full bg-current" />
        <span className="h-[1.5px] w-2.5 origin-left rounded-full bg-current transition-transform duration-300 ease-out group-hover:scale-x-[1.6]" />
      </span>
      <span className="sr-only">{site.navigation.menu}</span>
    </motion.button>
  );
}

function LienLogo({ taille, className }: { taille: number; className?: string }) {
  return (
    <a href={ancre("accueil")} aria-label={nomAccueil} className={className}>
      <Image src={site.logo.src} alt="" width={taille} height={taille} className="shrink-0" style={{ width: taille, height: taille }} />
    </a>
  );
}

/**
 * En-tête fixe.
 * - Accueil, tant que la photo de la devanture est sous l'en-tête : ni bandeau
 *   ni logo (l'enseigne les porte déjà), seul le bouton menu, incrusté sur la
 *   photo. Dès qu'elle est passée, le bandeau bleu prend le relais (27/09,
 *   demande de Julien) et reste en place.
 * - Mobile : logo + nom + « Menu » sur fond minuit (voile léger en haut des pages de texte).
 * - Tablette et ordinateur : capsule flottante (liens + point de lumière sur la
 *   section en cours) ; Commander / Réserver n'y paraissent qu'une fois ceux du hero sortis de l'écran.
 */
export function Header() {
  const { setMenuOuvert } = useActions();
  const { ctaHeroVisibles } = useEtatActions();
  const surAccueil = usePathname() === "/";
  const ctaDansHeader = !(surAccueil && ctaHeroVisibles);
  const section = useSectionActive(surAccueil);
  const lenis = useLenis();
  const idMenu = useId();
  const refHeader = useRef<HTMLElement>(null);

  const [menu, setMenu] = useState(false);
  // Le menu plein écran n'est monté qu'à sa première ouverture
  const [menuMonte, setMenuMonte] = useState(false);
  const controleMenu = menuMonte ? idMenu : undefined;
  const [fond, setFond] = useState(false);
  // Vrai au rendu serveur de l'accueil : la page s'ouvre sur la photo, sans bandeau
  const [surPhoto, setSurPhoto] = useState(surAccueil);

  /** La photo du hero passe-t-elle encore sous l'en-tête ? */
  const mesurerPhoto = useCallback(() => {
    const photo = document.querySelector("[data-hero-photo]");
    const basEnTete = refHeader.current?.getBoundingClientRect().bottom ?? 0;
    setSurPhoto(!!photo && photo.getBoundingClientRect().bottom > basEnTete);
  }, []);

  useEffect(() => {
    mesurerPhoto();
    window.addEventListener("resize", mesurerPhoto);
    return () => window.removeEventListener("resize", mesurerPhoto);
  }, [mesurerPhoto, surAccueil]);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => {
    setFond(y > 40);
    mesurerPhoto();
  });

  const bandeau = !surPhoto && fond;

  const ouvrir = () => {
    setMenuMonte(true);
    setMenu(true);
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
      <header ref={refHeader} className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <BandeauEssai />

        {/* Mobile */}
        <div className="pointer-events-auto relative pt-[var(--inset-haut,env(safe-area-inset-top))] md:hidden">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-linear-to-b from-nuit/70 via-nuit/25 to-transparent"
            initial={false}
            animate={{ opacity: !surPhoto && !fond ? 1 : 0 }}
            transition={{ duration: 0.35 }}
          />
          {/* Le bandeau bleu descend quand la photo s'en va, remonte quand elle revient */}
          <motion.div
            aria-hidden
            className="absolute inset-0 border-b border-filet/30 bg-minuit/95"
            initial={false}
            animate={{ opacity: bandeau ? 1 : 0, y: bandeau ? "0%" : "-100%" }}
            transition={ressort}
          />
          <div className="relative flex h-16 items-center justify-between gap-3 px-4">
            <motion.a
              href={ancre("accueil")}
              aria-label={nomAccueil}
              inert={surPhoto}
              className="flex min-h-11 items-center gap-2.5 rounded-full"
              initial={false}
              animate={{ opacity: surPhoto ? 0 : 1, y: surPhoto ? -10 : 0 }}
              transition={{ duration: 0.35, ease: entree }}
            >
              <Image src={site.logo.src} alt="" width={42} height={42} className="size-[42px] shrink-0" />
              <span aria-hidden className="whitespace-nowrap font-titre text-[1.02rem] font-semibold leading-[1.02] text-calcaire max-[359px]:hidden">
                {site.nom}
              </span>
            </motion.a>
            <BoutonMenu ouvert={menu} controle={controleMenu} incruste={surPhoto} onClick={ouvrir} />
          </div>
        </div>

        {/* Tablette et ordinateur : capsule flottante, remplacée sur la photo par le seul bouton menu */}
        <div className="relative hidden justify-center px-4 pt-[max(0.75rem,var(--inset-haut,env(safe-area-inset-top)))] md:flex">
          <AnimatePresence initial={false}>
            {surPhoto && (
              <motion.div
                key="menu-incruste"
                className="pointer-events-auto absolute right-5 top-[calc(max(0.75rem,var(--inset-haut,env(safe-area-inset-top)))+0.375rem)] lg:right-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: entree }}
              >
                <BoutonMenu ouvert={menu} controle={controleMenu} incruste onClick={ouvrir} />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            layout
            inert={surPhoto}
            initial={false}
            animate={{ opacity: surPhoto ? 0 : 1, y: surPhoto ? -16 : 0 }}
            transition={{ layout: ressortCapsule, default: { duration: 0.35, ease: entree } }}
            style={{ borderRadius: 9999 }}
            className={`flex items-center gap-1 border border-filet/50 bg-minuit/90 p-1.5 shadow-[0_12px_32px_rgba(6,15,46,0.4)] ${surPhoto ? "pointer-events-none" : "pointer-events-auto"}`}
          >
            <motion.div layout="position" className="flex items-center gap-1">
              <LienLogo taille={40} className="grid size-11 shrink-0 place-items-center rounded-full" />
              <nav aria-label={site.navigation.ariaPrincipale} className="hidden lg:block">
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
                              layoutId="trait-de-lumiere"
                              aria-hidden
                              className="absolute inset-x-3 bottom-1.5 h-0.5 rounded-full bg-or-clair xl:inset-x-3.5"
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
                  // Les CTA ne partent jamais de l'invisible (direction artistique, §6)
                  initial={{ opacity: 0.4, x: 14, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 14 }}
                  transition={{ duration: 0.35, ease: entree }}
                >
                  <BoutonReserver variante="contour" className={compact}>
                    {actions.reserverCourt}
                    <span className="sr-only">{` ${actions.reserverComplement}`}</span>
                  </BoutonReserver>
                  <BoutonCommander variante="or" className={compact} />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div layout="position" className="lg:hidden">
              <BoutonMenu ouvert={menu} controle={controleMenu} onClick={ouvrir} />
            </motion.div>
          </motion.div>
        </div>
      </header>

      {menuMonte && <MenuPlein id={idMenu} ouvert={menu} onFermer={fermer} />}
    </>
  );
}
