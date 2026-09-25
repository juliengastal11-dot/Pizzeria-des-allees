import type { CSSProperties } from "react";

/*
 * Cadrage des photos de salle dans les arches.
 * Les photos sont en paysage (≈ 1,65:1) et les arches en portrait : en
 * object-cover, l'image occupe toute la hauteur et la position verticale de
 * `cadrage` n'aurait aucun effet. On zoome donc légèrement l'image autour du
 * point de cadrage : « 50% 80% » garde le bas de la photo (tables, fresque) et
 * fait sortir le haut (faux plafond, caméra, enseigne coupée).
 */

/** Zoom appliqué aux photos dans les arches (galerie de la salle, photos de l'histoire). */
export const ZOOM_ARCHE = 1.3;

/** Rapport largeur / hauteur supposé des photos (1536 × 932), pour calculer les `sizes`. */
export const RATIO_PHOTO = 1.65;

/** Style de l'image dans une arche : position + zoom autour du même point. */
export function styleCadrage(cadrage = "50% 50%"): CSSProperties {
  return { objectPosition: cadrage, transformOrigin: cadrage, scale: String(ZOOM_ARCHE) };
}

/**
 * Largeur réellement affichée d'une photo paysage recadrée dans une arche
 * (object-cover + zoom), en multiple de la largeur de l'arche.
 */
export function facteurLargeur(ratioArche: number): number {
  return (RATIO_PHOTO / ratioArche) * ZOOM_ARCHE;
}
