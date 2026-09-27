/*
 * Étiquetage de la page pour la relecture : chaque texte de la config reçoit
 * `data-relecture-bloc` (sa clé), chaque image `data-relecture-image` (son
 * fichier). Et l'aperçu des textes réécrits, posé sans casser React : on ne
 * touche qu'à la valeur d'un nœud texte, ou on superpose une copie (calque).
 */
import { candidats, cheminImage, choisir, normaliser } from "./blocs";

export const ATTR_BLOC = "data-relecture-bloc";
export const ATTR_IMAGE = "data-relecture-image";
export const ATTR_UI = "data-relecture-ui";

const IGNORES = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "TITLE", "DESC", "IFRAME", "CANVAS", "TEXTAREA", "INPUT", "SELECT"]);
/** Aucun texte de la config n'est plus long : au-delà, inutile de comparer. */
const LONGUEUR_MAX = 700;

type Apercu = { mode: "noeud"; noeud: Text; original: string; texte: string } | { mode: "calque"; calque: HTMLElement; original: string; texte: string };
const apercus = new Map<HTMLElement, Apercu>();

type Lecture = {
  /** Ce qu'on voit (copies pour lecteurs d'écran exclues). */
  visible: string | null;
  /** Ce qu'on lit (copies décoratives aria-hidden exclues) : utile quand un texte est doublé pour un effet. */
  lisible: string | null;
  /** Textes déjà étiquetés plus bas dans l'arbre : un parent ne reprend pas le bloc d'un enfant. */
  pris: Set<string>;
};

const joindre = (a: string | null, b: string | null) => (a === null || b === null || a.length + b.length > LONGUEUR_MAX ? null : a + b);

function lire(el: Element, dansSrOnly: boolean, trouves: Map<Element, string>): Lecture {
  const apercu = el instanceof HTMLElement ? apercus.get(el) : undefined;
  if (apercu) {
    // Bloc déjà réécrit : il garde son étiquette et compte pour son texte d'origine
    const cle = el.getAttribute(ATTR_BLOC);
    if (cle) trouves.set(el, cle);
    return { visible: apercu.original, lisible: apercu.original, pris: new Set([normaliser(apercu.original)]) };
  }

  const srOnly = dansSrOnly || el.classList.contains("sr-only");
  let visible: string | null = "";
  let lisible: string | null = "";
  const pris = new Set<string>();

  for (const noeud of el.childNodes) {
    if (noeud.nodeType === Node.TEXT_NODE) {
      const texte = (noeud as Text).data;
      visible = joindre(visible, texte);
      lisible = joindre(lisible, texte);
    } else if (noeud.nodeType === Node.ELEMENT_NODE) {
      const enfant = noeud as Element;
      if (IGNORES.has(enfant.tagName.toUpperCase()) || enfant.hasAttribute(ATTR_UI)) continue;
      const lu = lire(enfant, srOnly, trouves);
      lu.pris.forEach((t) => pris.add(t));
      if (!enfant.classList.contains("sr-only")) visible = joindre(visible, lu.visible);
      if (enfant.getAttribute("aria-hidden") !== "true") lisible = joindre(lisible, lu.lisible);
    }
  }

  if (!srOnly && !trouves.has(el)) {
    const explicite = el.getAttribute("data-bloc");
    if (explicite) {
      trouves.set(el, explicite);
      if (visible) pris.add(normaliser(visible));
    } else {
      // Le texte vu d'abord (textes à trous compris) ; le texte lu seulement s'il y a quelque chose à voir :
      // une icône dont le nom n'existe que pour les lecteurs d'écran n'est pas un bloc à réécrire.
      const vu = visible ? normaliser(visible) : "";
      const lu = lisible ? normaliser(lisible) : "";
      const essais = vu ? [{ n: vu, modeles: true }, ...(lu && lu !== vu ? [{ n: lu, modeles: false }] : [])] : [];
      for (const { n, modeles } of essais) {
        if (pris.has(n)) break;
        const entrees = candidats(n, modeles);
        if (entrees.length) {
          trouves.set(el, choisir(entrees, el).cle);
          pris.add(n);
          break;
        }
      }
    }
  }
  return { visible, lisible, pris };
}

/** Étiquette (ou ré-étiquette) toute la page. Rapide : un seul parcours de l'arbre. */
export function etiqueter() {
  const trouves = new Map<Element, string>();
  lire(document.body, false, trouves);

  // Un bloc dans un autre bloc est un faux ami (le mot « sur » d'une phrase écrite lettre à lettre) : seul le grand reste
  for (const el of [...trouves.keys()]) {
    if (el.hasAttribute("data-bloc")) continue;
    for (let parent = el.parentElement; parent; parent = parent.parentElement) {
      if (trouves.has(parent)) {
        trouves.delete(el);
        break;
      }
    }
  }

  for (const el of document.querySelectorAll(`[${ATTR_BLOC}]`)) {
    if (!trouves.has(el)) el.removeAttribute(ATTR_BLOC);
  }
  for (const [el, cle] of trouves) {
    if (el.getAttribute(ATTR_BLOC) !== cle) el.setAttribute(ATTR_BLOC, cle);
  }

  for (const media of document.querySelectorAll<HTMLImageElement | HTMLVideoElement>("img, video")) {
    if (media.closest(`[${ATTR_UI}]`)) continue;
    const src = media instanceof HTMLVideoElement ? media.poster || media.currentSrc || media.querySelector("source")?.src || "" : media.currentSrc || media.src;
    if (!src) continue;
    const chemin = cheminImage(src);
    if (media.getAttribute(ATTR_IMAGE) !== chemin) media.setAttribute(ATTR_IMAGE, chemin);
  }
}

/** Retire toutes les étiquettes et tous les aperçus (sortie du mode relecture). */
export function toutRetirer() {
  for (const el of [...apercus.keys()]) retirerApercu(el);
  for (const el of document.querySelectorAll(`[${ATTR_BLOC}]`)) el.removeAttribute(ATTR_BLOC);
  for (const el of document.querySelectorAll(`[${ATTR_IMAGE}]`)) el.removeAttribute(ATTR_IMAGE);
}

/** Texte actuellement affiché par un bloc (son texte d'origine s'il est réécrit). */
export function texteOriginal(el: HTMLElement): string {
  const apercu = apercus.get(el);
  if (apercu) return apercu.original;
  const lu = lire(el, false, new Map());
  const visible = lu.visible ? normaliser(lu.visible) : "";
  const lisible = lu.lisible ? normaliser(lu.lisible) : "";
  // Le texte qui a servi à reconnaître le bloc : le visible, sinon le lisible (texte doublé pour un effet)
  return visible && candidats(visible).length ? visible : lisible || visible;
}

/** Montre le texte réécrit à la place de l'original, sur tous les endroits qui l'affichent. */
export function appliquerApercu(el: HTMLElement, texte: string) {
  const actuel = apercus.get(el);
  if (actuel?.texte === texte) return;
  const original = actuel?.original ?? texteOriginal(el);
  if (actuel) retirerApercu(el);

  const seul = el.childNodes.length === 1 && el.firstChild?.nodeType === Node.TEXT_NODE;
  if (seul) {
    const noeud = el.firstChild as Text;
    apercus.set(el, { mode: "noeud", noeud, original, texte });
    noeud.data = texte;
  } else {
    // Enfants gérés par React (lettres, icônes, copies) : masqués, et une copie du texte par-dessus
    el.style.setProperty("--relecture-taille", getComputedStyle(el).fontSize);
    const calque = document.createElement("span");
    calque.setAttribute("data-relecture-apercu-texte", "");
    calque.textContent = texte;
    el.setAttribute("data-relecture-apercu", "");
    el.appendChild(calque);
    apercus.set(el, { mode: "calque", calque, original, texte });
  }
  el.setAttribute("data-relecture-modifie", "");
}

export function retirerApercu(el: HTMLElement) {
  const apercu = apercus.get(el);
  if (!apercu) return;
  if (apercu.mode === "noeud") {
    apercu.noeud.data = apercu.original;
  } else {
    apercu.calque.remove();
    el.removeAttribute("data-relecture-apercu");
    el.style.removeProperty("--relecture-taille");
  }
  el.removeAttribute("data-relecture-modifie");
  apercus.delete(el);
}

/** Applique les réécritures en cours à tous les blocs de la page (et retire les autres). */
export function synchroniserApercus(textes: Record<string, { apres: string }>) {
  for (const el of [...apercus.keys()]) {
    const cle = el.getAttribute(ATTR_BLOC);
    if (!el.isConnected || !cle || !textes[cle]) retirerApercu(el);
  }
  for (const el of document.querySelectorAll<HTMLElement>(`[${ATTR_BLOC}]`)) {
    const retour = textes[el.getAttribute(ATTR_BLOC) ?? ""];
    if (retour) appliquerApercu(el, retour.apres);
  }
}

/** Petit chemin CSS lisible, pour situer une remarque libre (#carte > div:nth-of-type(2) > p). */
export function selecteur(el: Element): string {
  const morceaux: string[] = [];
  let courant: Element | null = el;
  while (courant && courant !== document.body && morceaux.length < 6) {
    if (courant.id) {
      morceaux.unshift(`#${CSS.escape(courant.id)}`);
      break;
    }
    const tag = courant.tagName.toLowerCase();
    const parent: Element | null = courant.parentElement;
    const memes = parent ? [...parent.children].filter((c) => c.tagName === courant!.tagName) : [];
    morceaux.unshift(memes.length > 1 ? `${tag}:nth-of-type(${memes.indexOf(courant) + 1})` : tag);
    courant = parent;
  }
  return morceaux.join(" > ");
}

/** « « Une sélection de la maison » (titre) » : de quoi reconnaître l'élément d'une remarque libre. */
export function decrire(el: Element): string {
  if (el.matches("section[id], main, footer, header")) return "La section entière (fond, mise en page)";
  const nature = el.closest("img, video, picture, svg") ? "image ou dessin" : /^H[1-6]$/.test(el.tagName) ? "titre" : el.closest("a, button") ? "bouton ou lien" : "bloc";
  const texte = normaliser(el instanceof HTMLElement ? el.innerText : (el.textContent ?? ""));
  const titre = el.querySelector("h1, h2, h3, h4");
  if (texte.length > 90 && titre?.textContent) return `Le bloc « ${normaliser(titre.textContent)} » et ce qu’il contient`;
  return texte ? `« ${texte.length > 70 ? `${texte.slice(0, 70)}…` : texte} » (${nature})` : nature === "bloc" ? "Un élément sans texte (fond, décor, espace)" : nature;
}
