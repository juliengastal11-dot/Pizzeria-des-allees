"use client";

import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import { useActions } from "@/components/providers/ActionsProvider";
import { estPlaceholder, site } from "@/config/site";
import styles from "./pont.module.css";

/** Libellés des arches-boutons (site.textes.actions). */
const TEXTES = site.textes.actions;

/** Ouverture d'une arche, en pixels dans la boîte du pont. */
export type BoiteArche = {
  gauche: number;
  haut: number;
  largeur: number;
  hauteur: number;
  rayon: number;
  /** Hauteur du centre du libellé au-dessus de l'eau. */
  centreLibelle: number;
};

type Mesures = { mobile: BoiteArche; large: BoiteArche };

const px = (v: number) => `${v}px`;

/** Les deux formats sont posés en variables ; pont.module.css choisit selon la largeur d'écran. */
const variables = ({ mobile: m, large: l }: Mesures) =>
  ({
    "--m-x": px(m.gauche),
    "--m-y": px(m.haut),
    "--m-l": px(m.largeur),
    "--m-h": px(m.hauteur),
    "--m-r": px(m.rayon),
    "--m-c": px(m.centreLibelle),
    "--l-x": px(l.gauche),
    "--l-y": px(l.haut),
    "--l-l": px(l.largeur),
    "--l-h": px(l.hauteur),
    "--l-r": px(l.rayon),
    "--l-c": px(l.centreLibelle),
  }) as CSSProperties;

/**
 * Commander et Réserver, posés exactement sur l'ouverture de leur arche.
 * Aucun bouton dessiné : au repos, seul le texte ; au survol et au focus,
 * l'arche se remplit d'une lumière chaude et son trait passe à l'or clair.
 * Commander garde la logique de BoutonCommander : fenêtre « bientôt » tant
 * que le lien de commande est un placeholder.
 */
export function ArchesBoutons({ commander, reserver }: { commander: Mesures; reserver: Mesures }) {
  const { ouvrirCommandeBientot, ouvrirReservation } = useActions();
  const lienCommande = !estPlaceholder(site.liens.commander);

  const libelleCommander = (
    <span className={styles.libelle}>
      <span aria-hidden className={styles.lumiere} />
      {TEXTES.commander}
      {lienCommande && <ArrowUpRight aria-hidden className={styles.fleche} strokeWidth={2.2} />}
    </span>
  );

  return (
    <div role="group" aria-label={TEXTES.groupe} className={styles.boutons}>
      {lienCommande ? (
        <a
          data-arche-bouton
          href={site.liens.commander}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.arche} ${styles.commander}`}
          style={variables(commander)}
        >
          {libelleCommander}
          <span className="sr-only">{` ${TEXTES.nouvelOnglet}`}</span>
        </a>
      ) : (
        <button
          data-arche-bouton
          type="button"
          aria-haspopup="dialog"
          onClick={ouvrirCommandeBientot}
          className={`${styles.arche} ${styles.commander}`}
          style={variables(commander)}
        >
          {libelleCommander}
        </button>
      )}
      <button
        data-arche-bouton
        type="button"
        aria-haspopup="dialog"
        onClick={ouvrirReservation}
        className={`${styles.arche} ${styles.reserver}`}
        style={variables(reserver)}
      >
        <span className={styles.libelle}>
          {TEXTES.reserverCourt} <span className={styles.suite}>{TEXTES.reserverComplement}</span>
        </span>
      </button>
    </div>
  );
}
