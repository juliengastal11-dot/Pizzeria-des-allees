/*
 * Ce que les scripts décident une fois pour toutes : y a-t-il du mouvement,
 * et la devanture en boucle va-t-elle jouer ? Aucun effet de bord ici.
 */
type Connexion = { saveData?: boolean; effectiveType?: string };

/** Vrai quand le visiteur a demandé moins d'animations (ou que le navigateur ne sait pas animer). */
export const reduit = !Element.prototype.animate || matchMedia("(prefers-reduced-motion: reduce)").matches;

const connexion = (navigator as Navigator & { connection?: Connexion }).connection;
const reseauPermis = !connexion?.saveData && !/2g|3g/.test(connexion?.effectiveType ?? "");

/** Vrai quand la vidéo de la devanture va jouer (ni animations réduites, ni économie de données, ni réseau lent). */
export const videoActive = !reduit && reseauPermis && !!document.querySelector("[data-video-devanture]");
