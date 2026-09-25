"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { useLenis } from "lenis/react";
import { X } from "lucide-react";

type Props = {
  ouvert: boolean;
  onFermer: () => void;
  titre: string;
  children: ReactNode;
  /** Largeur max en desktop. Sur mobile, la fenêtre monte du bas (feuille). */
  large?: boolean;
};

/**
 * Fenêtre modale accessible, basée sur <dialog> natif : piège du focus, Échap,
 * retour du focus au bouton d'origine. Le défilement fluide (Lenis) est suspendu.
 */
export function Fenetre({ ouvert, onFermer, titre, children, large }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titreId = useId();
  const lenis = useLenis();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (ouvert && !d.open) {
      d.showModal();
      lenis?.stop();
    } else if (!ouvert && d.open) {
      d.close();
    }
    if (!ouvert) lenis?.start();
  }, [ouvert, lenis]);

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
            <span className="sr-only">Fermer</span>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </dialog>
  );
}
