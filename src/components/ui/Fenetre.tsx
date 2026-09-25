"use client";

import { useEffect, useId, useRef, type ReactNode, type RefObject } from "react";
import { useLenis } from "lenis/react";
import { X } from "lucide-react";
import { site } from "@/config/site";

type Props = {
  ouvert: boolean;
  onFermer: () => void;
  titre: string;
  children: ReactNode;
  /** Largeur max en desktop. Sur mobile, la fenêtre monte du bas (feuille). */
  large?: boolean;
  /** Élément où rendre le focus si celui-ci l'a perdu avant l'ouverture (bouton devenu inerte). */
  retour?: RefObject<HTMLElement | null>;
};

/** Rend le focus à l'élément d'origine ; s'il n'est plus focalisable, au contenu principal. */
function rendreFocus(origine: HTMLElement) {
  if (origine.isConnected) origine.focus({ preventScroll: true });
  if (document.activeElement !== origine) document.getElementById("contenu")?.focus({ preventScroll: true });
}

/**
 * Fenêtre modale accessible, basée sur <dialog> natif : piège du focus, Échap,
 * retour du focus au bouton d'origine. Le défilement fluide (Lenis) est suspendu.
 * Entrée et sortie en CSS (classe « fenetre », voir globals.css).
 */
export function Fenetre({ ouvert, onFermer, titre, children, large, retour }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const origine = useRef<HTMLElement | null>(null);
  const titreId = useId();
  const lenis = useLenis();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (ouvert) {
      if (!d.open) {
        const actif = document.activeElement;
        origine.current = actif instanceof HTMLElement && actif !== document.body ? actif : (retour?.current ?? null);
        d.showModal();
      }
      lenis?.stop();
      return;
    }
    if (d.open) d.close();
    lenis?.start();

    // Le dialogue natif rend le focus à l'élément d'origine. S'il était alors
    // masqué ou inerte (barre mobile retirée, menu refermé), le focus tombe sur
    // <body> : on le rend nous-mêmes, une fois l'interface réaffichée.
    const el = origine.current;
    origine.current = null;
    if (!el) return;
    const image = requestAnimationFrame(() => {
      const actif = document.activeElement;
      // Le focus peut aussi être resté dans la fenêtre, encore affichée le temps de sa sortie
      if (!actif || actif === document.body || actif === document.documentElement || d.contains(actif)) rendreFocus(el);
    });
    return () => cancelAnimationFrame(image);
  }, [ouvert, lenis, retour]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titreId}
      onClose={onFermer}
      onClick={(e) => {
        if (e.target === ref.current) onFermer();
      }}
      data-lenis-prevent
      className="fenetre m-0 mt-auto w-full max-w-none bg-transparent p-0 text-calcaire backdrop:bg-minuit/70 sm:m-auto sm:w-[calc(100%-2rem)] sm:max-w-[34rem] data-[large=true]:sm:max-w-[40rem]"
      data-large={large ? "true" : "false"}
    >
      <div className="relative flex max-h-[92svh] flex-col overflow-hidden rounded-t-[2rem] border border-filet/60 bg-minuit shadow-[0_-20px_60px_rgba(6,15,46,0.55)] sm:rounded-[2rem]">
        <div className="flex items-center justify-between gap-4 border-b border-filet/40 px-5 py-4 sm:px-6">
          <h2 id={titreId} className="font-display text-2xl font-semibold text-calcaire">
            {titre}
          </h2>
          <button
            type="button"
            onClick={onFermer}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-filet/70 text-calcaire transition-colors hover:bg-grain"
          >
            <X aria-hidden className="size-5" />
            <span className="sr-only">{site.textes.actions.fermer}</span>
          </button>
        </div>
        {/* Sur iPhone, la feuille descend jusqu'au bord : on laisse la place de la barre d'accueil */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)] sm:pb-0">{children}</div>
      </div>
    </dialog>
  );
}
