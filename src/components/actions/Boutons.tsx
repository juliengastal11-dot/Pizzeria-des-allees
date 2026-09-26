"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, CalendarDays, ShoppingBag } from "lucide-react";
import { useActions } from "@/components/providers/ActionsProvider";
import { estPlaceholder, site } from "@/config/site";
import styles from "./lueur.module.css";

export type Variante = "or" | "contour" | "nuit" | "contour-nuit" | "voile";
export type Forme = "pilule" | "arche" | "libre";

const VARIANTES: Record<Variante, string> = {
  // Or plein, texte bleu (9,2:1). `anneau` ajoute un cerclage bleu sur fond clair.
  or: "bg-or text-encre hover:bg-or-clair",
  // Contour calcaire sur fond bleu
  contour: "border-[1.5px] border-calcaire/85 text-calcaire hover:bg-calcaire/10",
  // Bleu plein, pour les sections claires (La carte)
  nuit: "bg-encre text-nacre hover:bg-grain",
  "contour-nuit": "border-2 border-encre text-encre hover:bg-encre/10",
  // Voile minuit translucide (barre mobile) : le texte calcaire garde ≥ 5,5:1 au-dessus de n'importe quelle section
  voile: "border border-calcaire/25 bg-minuit/70 text-calcaire shadow-[0_8px_24px_rgba(6,15,46,0.35)] hover:bg-minuit/85",
};

const FORMES: Record<Forme, string> = {
  pilule: "rounded-full",
  arche: "rounded-[1.75rem_1.75rem_0.85rem_0.85rem]",
  libre: "",
};

/** Les mêmes rayons, pour le chemin de la lumière qui fait le tour (lueur.module.css). */
const RAYONS: Record<Forme, string> = {
  pilule: "9999px",
  arche: "1.75rem 1.75rem 0.85rem 0.85rem",
  libre: "0px",
};

/** La lumière : or chaud sur les boutons sombres ou en contour, éclat nacré sur le bouton or. */
const LUEURS: Record<Variante, string> = {
  or: "color-mix(in oklab, var(--color-nacre), white 55%)",
  contour: "var(--color-halo)",
  nuit: "var(--color-halo)",
  "contour-nuit": "var(--color-or)",
  voile: "var(--color-halo)",
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
    "group relative isolate inline-flex min-h-12 items-center justify-center gap-2 px-6 font-texte text-[1rem] font-semibold leading-none",
    "transition-colors duration-200 select-none",
    VARIANTES[variante],
    FORMES[forme],
    anneau ? "ring-2 ring-nuit ring-offset-0" : "",
    className ?? "",
  ].join(" ");
}

const pression = { whileHover: { scale: 1.03 }, whileTap: { scale: 0.96 }, transition: { type: "spring", stiffness: 500, damping: 30 } } as const;

/**
 * Lumière qui fait le tour du bouton et allume au passage de petites étoiles.
 * Réserver part avec un demi-tour d'avance : côte à côte, les deux ne brillent jamais ensemble.
 */
function Lueur({ variante, forme = "pilule", phase = 0 }: { variante: Variante; forme?: Forme; phase?: number }) {
  const reglages = { "--lueur": LUEURS[variante], "--rayon-tour": RAYONS[forme], "--phase": phase } as CSSProperties;
  return (
    <span aria-hidden className={styles.bordure} style={reglages}>
      <span className={styles.lueur} />
    </span>
  );
}

/**
 * « Commander » : ouvre l'outil de commande (Obypay) dans un nouvel onglet.
 * Tant que le lien est un placeholder, ouvre une fenêtre « bientôt disponible ».
 */
export function BoutonCommander(props: Commun) {
  const { ouvrirCommandeBientot } = useActions();
  const libelle = props.children ?? site.textes.actions.commander;
  const icone = !props.sansIcone && <ShoppingBag aria-hidden className="size-[1.1em] shrink-0" strokeWidth={2.2} />;
  const lueur = <Lueur variante={props.variante ?? "or"} forme={props.forme} />;

  if (estPlaceholder(site.liens.commander)) {
    return (
      <motion.button type="button" onClick={ouvrirCommandeBientot} aria-haspopup="dialog" data-cta="commander" className={classes(props)} {...pression}>
        {lueur}
        {icone}
        {libelle}
      </motion.button>
    );
  }
  return (
    <motion.a href={site.liens.commander} target="_blank" rel="noopener noreferrer" data-cta="commander" className={classes(props)} {...pression}>
      {lueur}
      {icone}
      {libelle}
      <ArrowUpRight aria-hidden className="size-[1em] shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      <span className="sr-only">{` ${site.textes.actions.nouvelOnglet}`}</span>
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
      data-cta="reserver"
      className={classes({ variante: "contour", ...props })}
      {...pression}
    >
      <Lueur variante={props.variante ?? "contour"} forme={props.forme} phase={0.5} />
      {!props.sansIcone && <CalendarDays aria-hidden className="size-[1.1em] shrink-0" strokeWidth={2.2} />}
      {props.children ?? site.textes.actions.reserver}
    </motion.button>
  );
}
