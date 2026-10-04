/*
 * Le mouvement de la page :
 * - l'entrée du haut de page : data-intro (type) et data-intro-delay (ms),
 *   les éléments arrivent l'un après l'autre ;
 * - les apparitions au défilement : data-reveal (type) et data-delay (ms),
 *   jouées une fois, seulement pour ce qui arrive sous la ligne de flottaison.
 * En mouvement réduit, rien ne bouge : la page s'affiche directement dans son
 * état final (les états de départ ne sont posés qu'avec html.intro).
 */
import { reduit } from "./mouvement";

type Mouvement = [Keyframe[], number, string];

export const EO = "cubic-bezier(.22,1,.36,1)";

const INTRO: Record<string, Mouvement> = {
  fade: [[{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "translateY(0px)" }], 700, EO],
  rise: [[{ transform: "translateY(105%)" }, { transform: "translateY(0%)" }], 900, EO],
  visuel: [[{ opacity: 0, transform: "translateY(28px)" }, { opacity: 1, transform: "translateY(0px)" }], 1000, EO],
  orbe: [[{ opacity: 0 }, { opacity: 1 }], 1800, "ease-out"],
};

const REVEAL: Record<string, Mouvement> = {
  up: [[{ opacity: 0, transform: "translateY(24px)" }, { opacity: 1, transform: "translateY(0px)" }], 700, EO],
  // Les pizzas du carrousel : jamais invisibles, elles montent et s'éclairent à peine
  monte: [[{ opacity: 0.85, transform: "translateY(40px)" }, { opacity: 1, transform: "translateY(0px)" }], 800, EO],
  fade: [[{ opacity: 0 }, { opacity: 1 }], 800, "ease-out"],
  pop: [
    [
      { opacity: 0, transform: "translate(-50%, -50%) scale(0.2)" },
      { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
    ],
    600,
    EO,
  ],
  draw: [[{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], 1100, EO],
};

// Le script a démarré : le filet de sécurité posé dans le <head> n'a plus à tout afficher d'office
(window as Window & { __introOk?: boolean }).__introOk = true;

/** Se résout quand l'entrée du haut de page est terminée (et nettoyée), ou tout de suite si rien ne s'anime. */
export let introTerminee: Promise<void> = Promise.resolve();

function entree() {
  // Les polices d'abord (700 ms au plus), pour que le titre ne change pas de forme en montant
  const polices = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 700))]);
  introTerminee = polices.then(async () => {
    const t0 = performance.now();
    const jouees: Animation[] = [];
    document.querySelectorAll<HTMLElement>("[data-intro]").forEach((el) => {
      const def = INTRO[el.dataset.intro ?? ""];
      if (!def) return;
      const [images, duree, courbe] = def;
      const delai = Math.max(0, Number(el.dataset.introDelay || 0) - (performance.now() - t0));
      jouees.push(el.animate(images, { duration: duree, delay: delai, easing: courbe, fill: "both" }));
    });

    // Une fois tout posé, on retire les états de départ et les animations : plus rien ne tient la page en calques animés
    // (une opacité ou une transformation animées au-dessus d'une vidéo coûtent à chaque image)
    await Promise.allSettled(jouees.map((a) => a.finished));
    document.documentElement.classList.remove("intro");
    jouees.forEach((a) => a.cancel());
  });
}

function apparitions() {
  const enAttente = new Map<Element, Animation>();
  const io = new IntersectionObserver(
    (entrees) => {
      for (const e of entrees) {
        if (!e.isIntersecting) continue;
        enAttente.get(e.target)?.play();
        enAttente.delete(e.target);
        io.unobserve(e.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  const vh = window.innerHeight;
  document.querySelectorAll<HTMLElement | SVGElement>("[data-reveal]").forEach((el) => {
    const r = el.getBoundingClientRect();
    // Déjà à l'écran (ou masqué à cette largeur) : on n'y touche pas
    if (r.top < vh * 0.96 && r.bottom > -40) return;
    const [images, duree, courbe] = REVEAL[el.dataset.reveal ?? ""] ?? REVEAL.up;
    const a = el.animate(images, { duration: duree, delay: Number(el.dataset.delay || 0), easing: courbe, fill: "both" });
    a.pause();
    enAttente.set(el, a);
    io.observe(el);
  });
}

if (!reduit) {
  entree();
  apparitions();
}
