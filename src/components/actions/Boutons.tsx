"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, CalendarDays, ShoppingBag } from "lucide-react";
import { useActions } from "@/components/providers/ActionsProvider";
import { estPlaceholder, site } from "@/config/site";

export type Variante = "or" | "contour" | "nuit" | "contour-nuit";
export type Forme = "pilule" | "arche" | "libre";

const VARIANTES: Record<Variante, string> = {
  // Or plein, texte bleu (9,2:1). `anneau` ajoute un cerclage bleu sur fond clair.
  or: "bg-or text-nuit hover:bg-or-clair",
  // Contour calcaire sur fond bleu
  contour: "border-[1.5px] border-calcaire/85 text-calcaire hover:bg-calcaire/10",
  // Bleu plein, pour les sections claires (La carte)
  nuit: "bg-nuit text-calcaire hover:bg-grain",
  "contour-nuit": "border-2 border-nuit text-nuit hover:bg-nuit/10",
};

const FORMES: Record<Forme, string> = {
  pilule: "rounded-full",
  arche: "rounded-[1.75rem_1.75rem_0.85rem_0.85rem]",
  libre: "",
};

type Commun = {
  variante?: Variante;
  forme?: Forme;
  /** Cerclage bleu (utile pour un bouton or posé sur un fond clair). */
  anneau?: boolean;
  /** Masque l'icône. */
  sansIcone?: boolean;
  className?: string;
  children?: ReactNode;
};

function classes({ variante = "or", forme = "pilule", anneau, className }: Commun) {
  return [
    "group relative inline-flex min-h-12 items-center justify-center gap-2 px-6 font-sans text-[1rem] font-semibold leading-none",
    "transition-colors duration-200 select-none",
    VARIANTES[variante],
    FORMES[forme],
    anneau ? "ring-2 ring-nuit ring-offset-0" : "",
    className ?? "",
  ].join(" ");
}

const pression = { whileHover: { scale: 1.03 }, whileTap: { scale: 0.96 }, transition: { type: "spring", stiffness: 500, damping: 30 } } as const;

/**
 * « Commander » : ouvre l'outil de commande (Obypay) dans un nouvel onglet.
 * Tant que le lien est un placeholder, ouvre une fenêtre « bientôt disponible ».
 */
export function BoutonCommander(props: Commun) {
  const { ouvrirCommandeBientot } = useActions();
  const libelle = props.children ?? "Commander";
  const icone = !props.sansIcone && <ShoppingBag aria-hidden className="size-[1.1em] shrink-0" strokeWidth={2.2} />;

  if (estPlaceholder(site.liens.commander)) {
    return (
      <motion.button type="button" onClick={ouvrirCommandeBientot} className={classes(props)} {...pression}>
        {icone}
        {libelle}
      </motion.button>
    );
  }
  return (
    <motion.a href={site.liens.commander} target="_blank" rel="noopener noreferrer" className={classes(props)} {...pression}>
      {icone}
      {libelle}
      <ArrowUpRight aria-hidden className="size-[1em] shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      <span className="sr-only"> (nouvel onglet)</span>
    </motion.a>
  );
}

/** « Réserver une table » : ouvre le widget TheFork dans une fenêtre du site. */
export function BoutonReserver(props: Commun) {
  const { ouvrirReservation } = useActions();
  return (
    <motion.button
      type="button"
      onClick={ouvrirReservation}
      aria-haspopup="dialog"
      className={classes({ variante: "contour", ...props })}
      {...pression}
    >
      {!props.sansIcone && <CalendarDays aria-hidden className="size-[1.1em] shrink-0" strokeWidth={2.2} />}
      {props.children ?? "Réserver une table"}
    </motion.button>
  );
}
