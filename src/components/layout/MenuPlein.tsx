"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, type Variants } from "motion/react";
import { MapPin, Phone, X } from "lucide-react";
import { BoutonCommander, BoutonReserver } from "@/components/actions/Boutons";
import { Valeur } from "@/components/ui/Valeur";
import { adresseComplete, estPlaceholder, site } from "@/config/site";
import { SECTIONS, ancre } from "./navigation";
import { PONT_COMPACT, PONT_LARGE } from "./pont";
import { ProfilPont } from "./PontVieux";

type Props = {
  id: string;
  ouvert: boolean;
  onFermer: () => void;
};

const entree = [0.22, 1, 0.36, 1] as const;
const { navigation } = site;
const { actions } = site.textes;

const panneau: Variants = {
  ferme: { opacity: 0, transition: { duration: 0.22, ease: "easeOut" } },
  ouvert: { opacity: 1, transition: { duration: 0.3, ease: entree, staggerChildren: 0.06, delayChildren: 0.06 } },
};

const ligne: Variants = {
  ferme: { opacity: 0, y: 28, transition: { duration: 0.12 } },
  ouvert: { opacity: 1, y: 0, transition: { duration: 0.65, ease: entree } },
};

// Boutons et coordonnées : ils glissent sans jamais partir de l'invisible
const glisse: Variants = {
  ferme: { y: 18, transition: { duration: 0.12 } },
  ouvert: { y: 0, transition: { duration: 0.65, ease: entree } },
};

/**
 * Après un lien du menu, le focus va au titre de la section visée (et non au
 * bouton « Menu » en haut de page) : la tabulation repart de là, et le lecteur
 * d'écran annonce où l'on est arrivé.
 */
function focaliserSection(id: string) {
  const section = document.getElementById(id);
  if (!section) return;
  const idTitre = section.getAttribute("aria-labelledby");
  const cible = (idTitre && document.getElementById(idTitre)) || section.querySelector<HTMLElement>("h2") || section;
  if (!cible.hasAttribute("tabindex")) cible.setAttribute("tabindex", "-1");
  cible.setAttribute("data-cible-menu", "");
  cible.focus({ preventScroll: true });
}

/**
 * Menu plein écran sur <dialog> natif (piège du focus, Échap, retour du focus).
 * La fermeture joue d'abord le fondu, puis ferme le dialogue.
 */
export function MenuPlein({ id, ouvert, onFermer }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  // Section visée par le dernier lien cliqué, focalisée une fois le menu refermé
  const cible = useRef<string | null>(null);
  const telReel = !estPlaceholder(site.telephone);

  useEffect(() => {
    const d = ref.current;
    if (ouvert && d && !d.open) d.showModal();
  }, [ouvert]);

  return (
    <dialog
      ref={ref}
      id={id}
      aria-label={navigation.menu}
      data-lenis-prevent
      onCancel={(e) => {
        e.preventDefault();
        onFermer();
      }}
      onClose={() => {
        if (ouvert) onFermer();
      }}
      className="m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto overscroll-contain bg-transparent p-0 text-calcaire backdrop:bg-transparent"
    >
      <motion.div
        initial="ferme"
        animate={ouvert ? "ouvert" : "ferme"}
        variants={panneau}
        onAnimationComplete={(etat) => {
          if (etat !== "ferme" || !ref.current?.open) return;
          // La fermeture native rend le focus au bouton « Menu » ; on le déplace ensuite vers la section visée
          ref.current.close();
          const id = cible.current;
          cible.current = null;
          if (id) focaliserSection(id);
        }}
        className="relative isolate flex min-h-full flex-col overflow-hidden bg-nuit"
      >
        <div aria-hidden className="texture-grain pointer-events-none absolute inset-0 -z-10 opacity-[0.07]" />
        {/* Deux arches en filigrane, comme une fenêtre ouverte sur la nuit */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-28 -z-10 h-[30rem] w-[19rem] rounded-[50%_50%_2rem_2rem/32%_32%_2rem_2rem] border border-filet/25 md:right-[8%] md:h-[36rem] md:w-[23rem]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 top-40 -z-10 h-[26rem] w-[15rem] rounded-[50%_50%_1.5rem_1.5rem/30%_30%_1.5rem_1.5rem] border border-filet/15 md:right-[calc(8%+4rem)] md:h-[32rem] md:w-[19rem]"
        />

        <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 pt-[env(safe-area-inset-top)] pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:px-8 md:pb-32">
          <div className="flex h-16 items-center justify-between gap-3 md:h-20">
            <span className="flex items-center gap-2.5">
              <Image src={site.logo.src} alt="" width={42} height={42} className="size-[42px] shrink-0" />
              <span className="font-titre text-[1.02rem] font-semibold leading-[1.02] max-[359px]:hidden">
                <span className="block">{site.nomLignes[0]}</span>
                <span className="block">{site.nomLignes[1]}</span>
              </span>
            </span>
            <button
              type="button"
              onClick={onFermer}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border-[1.5px] border-calcaire/85 px-4 text-[0.9375rem] font-semibold text-calcaire transition-colors hover:bg-calcaire/10"
            >
              <X aria-hidden className="size-[18px]" strokeWidth={2.2} />
              {navigation.fermer}
            </button>
          </div>

          <nav aria-label={navigation.ariaMenu} className="mt-6 md:mt-12">
            <ul className="flex flex-col gap-1">
              {SECTIONS.map((s) => (
                <motion.li key={s.id} variants={ligne}>
                  <a
                    href={ancre(s.id)}
                    onClick={() => {
                      cible.current = s.id;
                      onFermer();
                    }}
                    className="group flex min-h-14 items-center font-titre text-[2.25rem] font-semibold leading-[1.1] tracking-[-0.015em] text-calcaire md:text-[3rem]"
                  >
                    <span className="transition-colors duration-200 group-hover:text-or-clair">{s.libelle}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto pt-10">
            {/* Commander ou Réserver : le menu se ferme tout de suite, avant que la fenêtre ne s'ouvre.
                Le focus revient ainsi au bouton « Menu », que la fenêtre retrouvera à sa fermeture. */}
            <motion.div
              variants={glisse}
              onClick={() => {
                cible.current = null;
                ref.current?.close();
                onFermer();
              }}
              className="grid grid-cols-[1.2fr_1fr] gap-2 md:max-w-md"
            >
              <BoutonCommander forme="arche" className="h-14 w-full px-3! xs:px-5!" />
              <BoutonReserver forme="arche" className="h-14 w-full px-3! xs:px-5!">
                {actions.reserverCourt}
                <span className="sr-only">{` ${actions.reserverComplement}`}</span>
              </BoutonReserver>
            </motion.div>

            <motion.address variants={glisse} className="mt-6 space-y-1 not-italic text-pierre">
              <a
                href={site.liens.itineraire}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center gap-3 transition-colors hover:text-calcaire"
              >
                <MapPin aria-hidden className="size-5 shrink-0 text-or" />
                {adresseComplete}
                <span className="sr-only">{` ${actions.itineraireNouvelOnglet}`}</span>
              </a>
              {telReel ? (
                <a
                  href={`tel:${site.telephone.replace(/\s/g, "")}`}
                  className="flex min-h-11 items-center gap-3 tabular-nums transition-colors hover:text-calcaire"
                >
                  <Phone aria-hidden className="size-5 shrink-0 text-or" />
                  {site.telephone}
                </a>
              ) : (
                <p className="flex min-h-11 items-center gap-3">
                  <Phone aria-hidden className="size-5 shrink-0 text-or" />
                  <Valeur valeur={site.telephone} cle="telephone" />
                </p>
              )}
            </motion.address>
          </div>
        </div>

        <ProfilPont pont={PONT_COMPACT} remplissage="var(--color-grain)" className="absolute inset-x-0 bottom-0 -z-10 h-[4.5rem] md:hidden" />
        <ProfilPont pont={PONT_LARGE} remplissage="var(--color-grain)" className="absolute inset-x-0 bottom-0 -z-10 hidden h-24 md:block" />
      </motion.div>
    </dialog>
  );
}
