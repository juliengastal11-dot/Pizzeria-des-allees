/** Espace insécable avant « : ; ! ? » et à l'intérieur des guillemets. */
export function typographie(texte: string): string {
  return texte.replace(/ ([:;!?»])/g, " $1").replace(/« /g, "« ");
}

export type Morceau = { texte: string; placeholder: boolean };

/** Découpe un texte : les parties « [À PRÉCISER …] » sont marquées comme placeholders. */
export function morceaux(texte: string): Morceau[] {
  return texte
    .split(/(\[[^\]]+\])/)
    .filter(Boolean)
    .map((morceau) => ({ texte: morceau, placeholder: /^\[[^\]]+\]$/.test(morceau) }));
}

/** Mot sans accents, sans casse, sans élision ni ponctuation (pour repérer les mots clés). */
export function normaliserMot(mot: string): string {
  return mot
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/’/g, "'")
    .replace(/^(?:qu|[a-z])'/, "")
    .replace(/[^a-z0-9-]/g, "");
}
