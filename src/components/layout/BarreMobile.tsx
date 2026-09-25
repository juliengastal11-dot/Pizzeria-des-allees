"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useMotionValue, useScroll, type MotionValue } from "motion/react";
import { CalendarDays, ShoppingBag } from "lucide-react";
import { BoutonCommander, BoutonReserver } from "@/components/actions/Boutons";
import { useEtatActions } from "@/components/providers/ActionsProvider";
import { MOUVEMENT_REDUIT, useMedia } from "@/components/ui/useMedia";
import { site } from "@/config/site";

const TEXTES = site.textes.actions;

/** Éclat fixe, à mi-chemin, quand l'appareil demande moins d'animations. */
const ECLAT_REDUIT = 0.55;

// Pilule : 48 px de haut ; l'anneau de focus garde un liseré minuit pour rester visible sur les fonds clairs
const pilule = "h-12 w-full px-3! xs:px-4! focus-visible:outline-offset-2 focus-visible:shadow-[0_0_0_2px_var(--color-minuit)]";
const disposition = "inline-flex items-center gap-2 whitespace-nowrap";
const icone = "size-[1.1em] shrink-0";

/**
 * Éclat des pilules, de 0 (haut de page) à 1 (bas de page) : il suit la
 * progression du défilement. Mouvement réduit : un éclat fixe, à mi-chemin.
 * Le serveur et l'hydratation partent de 0, la valeur réelle arrive au montage.
 */
function useEclat(): MotionValue<number> {
  const reduire = useMedia(MOUVEMENT_REDUIT);
  const { scrollYProgress } = useScroll();
  const eclat = useMotionValue(0);

  useEffect(() => {
    if (reduire) {
      eclat.set(ECLAT_REDUIT);
      return;
    }
    eclat.set(scrollYProgress.get());
    return scrollYProgress.on("change", (v) => eclat.set(v));
  }, [reduire, eclat, scrollYProgress]);

  return eclat;
}

/**
 * Vrai quand un bloc qui réunit déjà Commander et Réserver (carte Contact,
 * pied de page…) est à l'écran : la barre se retire pour ne pas les doubler.
 * Blocs repérés par [data-cta-bloc], ou par un parent direct des deux boutons.
 */
function useBlocCtaAEcran(chemin: string): boolean {
  const [etat, setEtat] = useState({ chemin, visible: false });

  useEffect(() => {
    const blocs = new Set<Element>(document.querySelectorAll("[data-cta-bloc]"));
    document.querySelectorAll('[data-cta="commander"]').forEach((bouton) => {
      const parent = bouton.parentElement;
      if (parent?.querySelector(':scope > [data-cta="reserver"]') && !parent.closest("header, dialog, [data-barre-mobile]")) {
        blocs.add(parent);
      }
    });
    if (blocs.size === 0) return;

    const visibles = new Set<Element>();
    const observateur = new IntersectionObserver(
      (entrees) => {
        for (const e of entrees) {
          if (e.isIntersecting && e.intersectionRatio >= 0.5) visibles.add(e.target);
          else visibles.delete(e.target);
        }
        setEtat({ chemin, visible: visibles.size > 0 });
      },
      { threshold: [0, 0.5, 1] },
    );
    blocs.forEach((bloc) => observateur.observe(bloc));
    return () => observateur.disconnect();
  }, [chemin]);

  return etat.chemin === chemin && etat.visible;
}

/**
 * Barre Commander / Réserver du mobile : deux pilules translucides, posées dans
 * le vide, qui s'allument de plus en plus à mesure que l'on descend dans la page.
 * Commander prend l'or (contour, texte, halo chaud), Réserver un halo froid.
 * L'allumage ne joue que sur l'opacité de calques superposés (aucun repeint).
 *
 * Elle n'apparaît que sous md, une fois les boutons du hero sortis de l'écran
 * (ou d'emblée sur les pages sans hero). Elle reste montée quand une fenêtre
 * s'ouvre (inerte et masquée) : le bouton d'origine existe toujours à la
 * fermeture, et le focus peut y revenir.
 */
export function BarreMobile() {
  const { ctaHeroVisibles, fenetreOuverte } = useEtatActions();
  const chemin = usePathname();
  const blocAEcran = useBlocCtaAEcran(chemin);
  const eclat = useEclat();
  const retiree = (chemin === "/" && ctaHeroVisibles) || blocAEcran || fenetreOuverte;

  return (
    <div
      role="group"
      aria-label={TEXTES.groupe}
      data-barre-mobile=""
      inert={retiree}
      // Visible d'un coup (le focus peut y revenir dès la fermeture d'une fenêtre), masquée après le fondu
      className={`fixed inset-x-3.5 z-40 grid grid-cols-[1.15fr_1fr] gap-2.5 md:hidden ${
        retiree
          ? "invisible translate-y-[calc(100%+1.25rem)] opacity-0 [transition:opacity_300ms_ease-in,translate_300ms_ease-in,visibility_0s_300ms]"
          : "visible translate-y-0 opacity-100 [transition:opacity_500ms_var(--ease-out-soft),translate_500ms_var(--ease-out-soft),visibility_0s]"
      }`}
      style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <BoutonCommander variante="voile" sansIcone className={pilule}>
        {/* Allumé : contour or, halo chaud et lueur qui monte du bas */}
        <motion.span
          aria-hidden
          style={{ opacity: eclat }}
          className="pointer-events-none absolute -inset-px rounded-full border border-or bg-[radial-gradient(120%_140%_at_50%_125%,rgba(233,185,80,0.2),transparent_62%)] shadow-[0_0_24px_rgba(242,211,140,0.5),inset_0_0_12px_rgba(242,211,140,0.12)] will-change-[opacity]"
        />
        <span className={`relative ${disposition}`}>
          <ShoppingBag aria-hidden className={icone} strokeWidth={2.2} />
          {TEXTES.commander}
          {/* Le même libellé en or clair, par-dessus, en fondu : le texte passe du calcaire à l'or */}
          <motion.span aria-hidden style={{ opacity: eclat }} className={`absolute inset-0 ${disposition} text-or-clair will-change-[opacity]`}>
            <ShoppingBag aria-hidden className={icone} strokeWidth={2.2} />
            {TEXTES.commander}
          </motion.span>
        </span>
      </BoutonCommander>

      <BoutonReserver variante="voile" sansIcone className={pilule}>
        {/* Allumé : contour calcaire plus franc et halo froid, discret */}
        <motion.span
          aria-hidden
          style={{ opacity: eclat }}
          className="pointer-events-none absolute -inset-px rounded-full border border-calcaire/80 shadow-[0_0_20px_rgba(136,168,220,0.3)] will-change-[opacity]"
        />
        <span className={`relative ${disposition}`}>
          <CalendarDays aria-hidden className={icone} strokeWidth={2.2} />
          {TEXTES.reserverCourt}
          <span className="sr-only">{` ${TEXTES.reserverComplement}`}</span>
        </span>
      </BoutonReserver>
    </div>
  );
}
