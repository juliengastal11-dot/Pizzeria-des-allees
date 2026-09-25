// Outils de texte partagés (déplacés dans src/lib/textes.ts), réexportés pour la section.
export { morceaux, typographie, type Morceau } from "@/lib/textes";

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
