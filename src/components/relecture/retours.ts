/*
 * Les retours du relecteur : gardés dans son navigateur (il peut revenir plus
 * tard avec le même lien), puis copiés en JSON pour être collés tels quels.
 */
import { COULEURS, TYPOS } from "@/components/layout/BandeauEssai";
import { reglagePose } from "@/lib/essai";
import { index } from "./blocs";
import { ANIMATIONS } from "./animations";

export type Decision = "garder" | "supprimer";

export type RetourTexte = { cle: string; section: string; avant: string; apres: string; remarque: string };
export type RetourImage = { chemin: string; cles: string[]; section: string; remarque: string };
export type RetourAnimation = { id: string; decision: Decision | null; remarque: string };
export type Remarque = { id: string; section: string; cible: string; selecteur: string; remarque: string };

export type Retours = {
  textes: Record<string, RetourTexte>;
  images: Record<string, RetourImage>;
  animations: Record<string, RetourAnimation>;
  remarques: Remarque[];
  generale: string;
  prenom: string;
};

export const AUCUN_RETOUR: Retours = { textes: {}, images: {}, animations: {}, remarques: [], generale: "", prenom: "" };

const CLE_STOCKAGE = "relecture-retours-v1";

export function charger(): Retours {
  try {
    const brut = localStorage.getItem(CLE_STOCKAGE);
    return brut ? { ...AUCUN_RETOUR, ...(JSON.parse(brut) as Partial<Retours>) } : AUCUN_RETOUR;
  } catch {
    return AUCUN_RETOUR;
  }
}

export function enregistrer(retours: Retours) {
  try {
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(retours));
  } catch {
    // Stockage refusé (navigation privée) : les retours vivent le temps de la page
  }
}

export function nombreDeRetours(r: Retours): number {
  return (
    Object.keys(r.textes).length +
    Object.keys(r.images).length +
    Object.values(r.animations).filter((a) => a.decision || a.remarque).length +
    r.remarques.length +
    (r.generale.trim() ? 1 : 0)
  );
}

const nomEssai = (liste: readonly { id: string | null; nom: string }[], id: string | null) =>
  liste.find((e) => e.id === id)?.nom ?? id ?? liste[0].nom;

/** Le fichier à coller tel quel dans Claude : chaque retour dit où il s'applique. */
export function versJson(r: Retours): string {
  const { parCle } = index();
  const version = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local";
  const sansVide = <T extends object>(o: T) =>
    Object.fromEntries(Object.entries(o).filter(([, v]) => v !== "" && v !== undefined && !(Array.isArray(v) && !v.length)));

  const donnees = sansVide({
    format: "relecture/pizzeria-des-allees/1",
    consigne:
      "Retours de relecture du site La Pizzeria des Allées, à appliquer tels quels. " +
      "« bloc » est un chemin dans site/src/config/site.ts : remplacer le texte « avant » par « apres » " +
      "(garder les {repères} d'un « modele »). Une animation « supprimer » est à retirer du site ; " +
      "les remarques décrivent un changement à faire à l'endroit indiqué.",
    page: `${location.origin}/`,
    version,
    date: new Date().toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" }),
    relecteur: r.prenom.trim(),
    essais: {
      couleurs: nomEssai(COULEURS, reglagePose("palette")),
      typographie: nomEssai(TYPOS, reglagePose("typo")),
    },
    textes: Object.values(r.textes).map((t) => {
      const valeur = parCle.get(t.cle)?.valeur;
      return sansVide({
        bloc: t.cle,
        section: t.section,
        modele: valeur && /\{\w+\}/.test(valeur) ? valeur : undefined,
        avant: t.avant,
        apres: t.apres,
        remarque: t.remarque.trim(),
      });
    }),
    animations: Object.values(r.animations)
      .filter((a) => a.decision || a.remarque.trim())
      .map((a) => sansVide({ animation: a.id, nom: ANIMATIONS[a.id]?.nom ?? a.id, decision: a.decision ?? undefined, remarque: a.remarque.trim() })),
    images: Object.values(r.images).map((i) => sansVide({ image: i.chemin, blocs: i.cles, section: i.section, remarque: i.remarque.trim() })),
    remarques: r.remarques.map((m) => sansVide({ section: m.section, element: m.cible, selecteur: m.selecteur, remarque: m.remarque.trim() })),
    remarqueGenerale: r.generale.trim(),
  });
  return JSON.stringify(donnees, null, 2);
}
