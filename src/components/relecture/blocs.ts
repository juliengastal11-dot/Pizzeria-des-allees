/*
 * Les « blocs » du mode relecture : chaque texte affiché est relié à son chemin
 * dans src/config/site.ts (ex. `textes.hero.accroche`, `pizzas[cers].description`).
 * Le site n'a presque rien à étiqueter à la main : on retrouve les textes par
 * leur valeur. Seuls les cas ambigus (valeurs à confirmer « […] ») portent un
 * `data-bloc` posé dans le code (voir Valeur).
 */
import { adresseComplete, site } from "@/config/site";

export type Entree = { cle: string; valeur: string };

export type Index = {
  /** Valeur normalisée → entrées qui l'affichent. */
  exacts: Map<string, Entree[]>;
  /** Textes à trous (« Voir les {n} avis sur Google ») : reconnus par motif. */
  modeles: { motif: RegExp; entree: Entree }[];
  /** Chemin → entrée. */
  parCle: Map<string, Entree>;
  /** Fichier (« /images/… », « /video/… ») → chemins qui le citent. */
  fichiers: Map<string, string[]>;
};

/** Même texte, même forme : espaces insécables, liants invisibles et apostrophes ne comptent pas. */
export function normaliser(texte: string): string {
  return texte
    .replace(/[   ]/g, " ")
    .replace(/[​-‍⁠­﻿]/g, "")
    .replace(/[’‘`´]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

const echapper = (texte: string) => texte.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Branches qui ne s'affichent jamais telles quelles : liens, référencement, réglages techniques. */
const BRANCHES_IGNOREES = new Set(["liens", "reseaux", "seo", "urlSite", "logo"]);
/** Clés techniques (fichiers, identifiants, textes lus seulement par les lecteurs d'écran). */
const CLES_IGNOREES = /^(id|src|image|poster|horizon|videoMp4|videoWebm|mp4|url|site|alt|aria\w*|cadrage|lieu|base|locale|titreOnglet|titreIframe)$/;

/** Un tableau d'objets à `id` (pizzas, vues du hero) se lit par identifiant : `pizzas[cers]`. */
function segment(parent: string, element: unknown, rang: number): string {
  const id = typeof element === "object" && element !== null && "id" in element ? String((element as { id: unknown }).id) : null;
  return `${parent}[${id ?? rang}]`;
}

function parcourir(valeur: unknown, chemin: string, sortie: Entree[], fichiers: Map<string, string[]>) {
  if (typeof valeur === "string") {
    if (valeur.startsWith("/")) {
      fichiers.set(valeur, [...(fichiers.get(valeur) ?? []), chemin]);
      return;
    }
    // Liens, mots trop courts pour être sûrs (« et », « . »), heures « 12:00 » (le téléphone, lui, reste)
    if (/^https?:/.test(valeur) || valeur.trim().length < 3 || (/^[\d\s.,:-]+$/.test(valeur) && valeur.length < 8)) return;
    sortie.push({ cle: chemin, valeur });
    return;
  }
  if (Array.isArray(valeur)) {
    valeur.forEach((element, i) => parcourir(element, segment(chemin, element, i), sortie, fichiers));
    return;
  }
  if (typeof valeur === "object" && valeur !== null) {
    for (const [cle, enfant] of Object.entries(valeur)) {
      if (!chemin && BRANCHES_IGNOREES.has(cle)) continue;
      const suite = chemin ? `${chemin}.${cle}` : cle;
      // Les fichiers se relèvent toujours (images, vidéos) ; les autres valeurs techniques non
      if (typeof enfant === "string" && CLES_IGNOREES.test(cle) && !enfant.startsWith("/")) continue;
      parcourir(enfant, suite, sortie, fichiers);
    }
  }
}

let memo: Index | null = null;

export function index(): Index {
  if (memo) return memo;
  const entrees: Entree[] = [];
  const fichiers = new Map<string, string[]>();
  parcourir(site, "", entrees, fichiers);
  // L'adresse s'affiche d'un bloc : « 43 Allées Paul Riquet, 34500 Béziers »
  entrees.push({ cle: "adresse", valeur: adresseComplete });

  const exacts = new Map<string, Entree[]>();
  const modeles: Index["modeles"] = [];
  for (const entree of entrees) {
    const n = normaliser(entree.valeur);
    exacts.set(n, [...(exacts.get(n) ?? []), entree]);
    if (/\{\w+\}/.test(entree.valeur)) {
      const motif = echapper(n).replace(/\\\{\w+\\\}/g, "(.+?)");
      modeles.push({ motif: new RegExp(`^${motif}$`), entree });
    }
  }
  memo = { exacts, modeles, parCle: new Map(entrees.map((e) => [e.cle, e])), fichiers };
  return memo;
}

/** Entrées candidates pour un texte affiché (valeur exacte, sinon texte à trous si `avecModeles`). */
export function candidats(texte: string, avecModeles = true): Entree[] {
  const { exacts, modeles } = index();
  const n = normaliser(texte);
  if (!n) return [];
  const exact = exacts.get(n);
  if (exact) return exact;
  if (!avecModeles || n.length > 400) return [];
  return modeles.filter((m) => m.motif.test(n)).map((m) => m.entree);
}

/* ---------------------------------------------------------------------------
 * Sections et noms lisibles
 * ------------------------------------------------------------------------- */

const SECTIONS: Record<string, string> = { accueil: "Haut de page", ...site.navigation.sections };

/** Où chercher d'abord, selon l'endroit de la page, quand un même texte a plusieurs clés. */
const PREFERENCES: Record<string, string[]> = {
  accueil: ["textes.hero.", "hero.", "nom", "textes.actions."],
  histoire: ["textes.histoire.", "pizzas[", "nom"],
  carte: ["textes.carte.", "pizzas[", "textes.actions."],
  livraison: ["textes.livraison.", "livraison.", "textes.actions.", "adresse"],
  salle: ["textes.salle.", "photos.", "avisGoogle.", "couverts."],
  infos: ["textes.infos.", "adresse", "horaires.", "telephone", "email", "paiements"],
  faq: ["textes.faq."],
  entete: ["navigation.", "textes.actions.", "nom"],
  barre: ["textes.actions."],
  fenetre: ["textes.actions.", "navigation.", "textes.salle.", "photos.", "adresse", "telephone"],
  pied: ["textes.footer.", "navigation.", "textes.actions.", "adresse", "horaires.", "telephone", "legal."],
  mentions: ["textes.pagesLegales.", "legal.", "adresse"],
  confidentialite: ["textes.pagesLegales.", "legal.", "adresse"],
};

export function sectionDe(el: Element): { id: string; nom: string } {
  if (el.closest("dialog")) return { id: "fenetre", nom: "Fenêtre" };
  if (el.closest("[data-barre-mobile]")) return { id: "barre", nom: "Barre du bas (téléphone)" };
  if (el.closest("header")) return { id: "entete", nom: "En-tête" };
  if (el.closest("footer")) return { id: "pied", nom: "Pied de page" };
  if (location.pathname.startsWith("/mentions-legales")) return { id: "mentions", nom: "Mentions légales" };
  if (location.pathname.startsWith("/confidentialite")) return { id: "confidentialite", nom: "Confidentialité" };
  const section = el.closest("section[id]");
  if (section) return { id: section.id, nom: SECTIONS[section.id] ?? section.id };
  return { id: "page", nom: "Page" };
}

/**
 * Plusieurs clés pour un même texte (« Notre histoire » est à la fois un lien du
 * menu et le surtitre de la section) : on garde celle qui correspond à l'endroit.
 */
export function choisir(entrees: Entree[], el: Element): Entree {
  if (entrees.length === 1) return entrees[0];
  for (const prefixe of PREFERENCES[sectionDe(el).id] ?? []) {
    const trouvee = entrees.find((e) => e.cle.startsWith(prefixe));
    if (trouvee) return trouvee;
  }
  return entrees[0];
}

const MOTS: Record<string, string> = {
  titre: "Titre",
  surtitre: "Surtitre",
  intro: "Introduction",
  accroche: "Phrase d’accroche",
  manifeste: "Manifeste",
  ardoises: "Ardoise",
  bouton: "Bouton",
  boutonLivraison: "Bouton",
  question: "Question",
  reponse: "Réponse",
  description: "Description",
  nom: "Nom",
  nomLignes: "Nom (ligne)",
  legende: "Légende",
  texte: "Texte",
  auteur: "Auteur",
  signature: "Signature",
  etapes: "Étape",
  communes: "Commune",
  sections: "Menu",
};

/** « textes.faq.items[2].reponse » → « Réponse 3 » ; « pizzas[cers].nom » → « Pizza cers · Nom ». */
export function libelleCle(cle: string): string {
  const faq = cle.match(/items\[(\d+)\]\.(question|reponse)$/);
  if (faq) return `${faq[2] === "question" ? "Question" : "Réponse"} ${Number(faq[1]) + 1}`;
  const morceaux = cle.split(".");
  const dernier = morceaux[morceaux.length - 1];
  const [base, rang] = dernier.replace(/\]$/, "").split("[");
  const mot = MOTS[base] ?? base.charAt(0).toUpperCase() + base.slice(1);
  const numero = rang !== undefined && /^\d+$/.test(rang) ? ` ${Number(rang) + 1}` : "";
  const pizza = cle.match(/^pizzas\[([^\]]+)\]/);
  return `${pizza ? `Pizza ${pizza[1]} · ` : ""}${mot}${numero}`;
}

/** Chemin d'une image telle que le site la sert (Next sert /_next/image?url=…). */
export function cheminImage(src: string): string {
  try {
    const url = new URL(src, location.href);
    if (url.pathname.startsWith("/_next/image")) return decodeURIComponent(url.searchParams.get("url") ?? url.pathname);
    return decodeURIComponent(url.pathname);
  } catch {
    return src;
  }
}
