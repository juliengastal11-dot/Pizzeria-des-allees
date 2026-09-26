/*
 * Petits outils pour les textes de src/config/site.ts.
 */

/** Remplace les « {cle} » d'un modèle par leurs valeurs (les clés inconnues restent telles quelles). */
export function remplir(modele: string, valeurs: Record<string, string | number>): string {
  return modele.replace(/\{(\w+)\}/g, (brut, cle: string) => (cle in valeurs ? String(valeurs[cle]) : brut));
}

/**
 * Typographie française, en filet de sécurité pour les textes de la configuration :
 * espace insécable avant « : ; ! ? » et à l'intérieur des guillemets, apostrophe courbe.
 */
export function typographie(texte: string): string {
  return texte
    .replace(/ ([:;!?»])/g, " $1")
    .replace(/« /g, "« ")
    .replace(/(\p{L})'(\p{L})/gu, "$1’$2");
}

/** « Béziers, Villeneuve-lès-Béziers ou Corneilhan » : une liste en toutes lettres, séparée par « ou ». */
export function enumererOu(mots: readonly string[]): string {
  if (mots.length < 2) return mots.join("");
  return `${mots.slice(0, -1).join(", ")} ou ${mots[mots.length - 1]}`;
}

export type Morceau = { texte: string; placeholder: boolean };

/** Découpe un texte : les parties « [À PRÉCISER …] » sont marquées comme placeholders. */
export function morceaux(texte: string): Morceau[] {
  return texte
    .split(/(\[[^\]]+\])/)
    .filter(Boolean)
    .map((morceau) => ({ texte: morceau, placeholder: /^\[[^\]]+\]$/.test(morceau) }));
}

/** « 2026-09-25 » → « 25 septembre 2026 » (« 1er » le premier du mois). */
export function dateLisible(iso: string): string {
  const date = new Date(`${iso}T12:00:00Z`);
  const texte = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
  return texte.replace(/^1 /, "1er ");
}
