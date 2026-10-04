/*
 * Le mouvement de la page, repris de la maquette Claude Design :
 * - l'entrée du haut de page : data-intro (type) et data-intro-delay (ms) ;
 * - les apparitions au défilement : data-reveal (type) et data-delay (ms),
 *   jouées une fois, seulement pour ce qui arrive sous la ligne de flottaison ;
 * - la parallaxe (data-par, vitesse relative) et l'assombrissement de la
 *   photo du haut quand on descend (data-scrub="dim") ;
 * - le point lumineux des boutons Commander qui s'allume (data-ignite).
 * En mouvement réduit, rien ne bouge : la page s'affiche directement dans son
 * état final (les états de départ ne sont posés qu'avec html.intro).
 */
import { reduit, videoActive } from "./mouvement";

type Mouvement = [Keyframe[], number, string];

export const EO = "cubic-bezier(.22,1,.36,1)";
const EIO = "cubic-bezier(.76,0,.24,1)";

// Quand la vidéo joue, la photo se pose directement à sa taille : aucun zoom lent ne court sous la vidéo
const ECHELLE_FINALE = videoActive ? 1 : 1.05;

const INTRO: Record<string, Mouvement> = {
  line: [
    [
      { transform: "scaleX(0)", opacity: 1 },
      { transform: "scaleX(1)", opacity: 1, offset: 0.62 },
      { transform: "scaleX(1)", opacity: 0 },
    ],
    1250,
    EO,
  ],
  shutter: [[{ clipPath: "inset(50% 0% 50% 0%)" }, { clipPath: "inset(-2px -2px -2px -2px)" }], 1250, EIO],
  push: [[{ transform: "scale(1.22)" }, { transform: `scale(${ECHELLE_FINALE})` }], 2800, EO],
  lights: [
    [
      { opacity: 0.94 },
      { opacity: 0.6, offset: 0.07 },
      { opacity: 0.9, offset: 0.13 },
      { opacity: 0.38, offset: 0.21 },
      { opacity: 0.58, offset: 0.28 },
      { opacity: 0 },
    ],
    1800,
    "linear",
  ],
  rise: [[{ transform: "translateY(105%)" }, { transform: "translateY(0%)" }], 1150, EO],
  fade: [[{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "translateY(0px)" }], 850, EO],
  glow: [[{ opacity: 0 }, { opacity: 1 }], 2400, "ease-out"],
  header: [[{ opacity: 0, transform: "translateY(-10px)" }, { opacity: 1, transform: "translateY(0px)" }], 800, EO],
};

const REVEAL: Record<string, Mouvement> = {
  up: [[{ opacity: 0, transform: "translateY(26px)" }, { opacity: 1, transform: "translateY(0px)" }], 700, EO],
  // Les pizzas du carrousel : jamais invisibles, elles montent et s'éclairent à peine
  monte: [[{ opacity: 0.85, transform: "translateY(40px)" }, { opacity: 1, transform: "translateY(0px)" }], 800, EO],
  plate: [[{ clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(-8px -8px -8px -8px)" }], 950, EIO],
  fade: [[{ opacity: 0 }, { opacity: 1 }], 700, "ease-out"],
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

/** Fait briller le point des boutons Commander : deux ondes qui s'élargissent. */
export function allumer(selecteur: string) {
  if (reduit) return;
  document.querySelectorAll(selecteur).forEach((el) =>
    el.animate([{ transform: "scale(1)", opacity: 0.9 }, { transform: "scale(3.4)", opacity: 0 }], {
      duration: 1500,
      iterations: 2,
      easing: EO,
    }),
  );
}

/** Se résout quand l'entrée du haut de page est terminée (et nettoyée), ou tout de suite si rien ne s'anime. */
export let introTerminee: Promise<void> = Promise.resolve();

function entree() {
  // Les polices d'abord (700 ms au plus), pour que le titre ne change pas de forme en montant
  const polices = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 700))]);
  introTerminee = polices.then(async () => {
    const t0 = performance.now();
    setTimeout(() => allumer('[data-ignite=""]'), 2750);
    const jouees: { el: HTMLElement; animation: Animation }[] = [];
    document.querySelectorAll<HTMLElement>("[data-intro]").forEach((el) => {
      const def = INTRO[el.dataset.intro ?? ""];
      if (!def) return;
      const [images, duree, courbe] = def;
      const delai = Math.max(0, Number(el.dataset.introDelay || 0) - (performance.now() - t0));
      jouees.push({ el, animation: el.animate(images, { duration: duree, delay: delai, easing: courbe, fill: "both" }) });
    });

    // Sans vidéo, la photo finit de se poser très lentement, comme un plan de cinéma
    if (!videoActive) {
      jouees
        .filter(({ el }) => el.dataset.intro === "push")
        .forEach(({ el, animation }) =>
          animation.finished
            .then(() => el.animate([{ transform: "scale(1.05)" }, { transform: "scale(1)" }], { duration: 18000, easing: "cubic-bezier(.3,0,.2,1)", fill: "forwards" }))
            .catch(() => {}),
        );
    }

    // Une fois tout posé, on retire les états de départ et les animations : plus rien ne tient la page en calques animés
    // (un clip-path ou une opacité animés au-dessus d'une vidéo coûtent à chaque image)
    await Promise.allSettled(jouees.map(({ animation }) => animation.finished));
    document.documentElement.classList.remove("intro");
    for (const { el, animation } of jouees) {
      // sans vidéo, la photo garde son échelle : elle est encore en train de se poser
      if (!videoActive && el.dataset.intro === "push") continue;
      animation.cancel();
    }
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

function defilement() {
  // Chaque élément data-par se décale par rapport à son parent, calculé seulement quand ce parent est proche de l'écran
  const groupes = new Map<Element, HTMLElement[]>();
  const proches = new Set<Element>();
  const assombris = document.querySelectorAll<HTMLElement>('[data-scrub="dim"]');
  // Un élément plus grand que son parent (cadre photo) ne doit jamais découvrir de bande vide : on borne son décalage à sa marge
  const marges = new WeakMap<HTMLElement, number>();
  const mesurer = () => {
    groupes.forEach((els, parent) =>
      els.forEach((el) => marges.set(el, el.offsetHeight >= parent.clientHeight ? Math.max(0, (el.offsetHeight - parent.clientHeight) / 2) : Infinity)),
    );
  };
  let image = 0;

  const peindre = () => {
    image = 0;
    const vh = window.innerHeight;
    const y = window.scrollY;
    proches.forEach((parent) => {
      const r = parent.getBoundingClientRect();
      const progres = (r.top + r.height / 2 - vh / 2) / vh;
      groupes.get(parent)?.forEach((el) => {
        const marge = marges.get(el) ?? Infinity;
        const decalage = Math.max(-marge, Math.min(marge, progres * Number(el.dataset.par) * vh));
        el.style.translate = `0 ${decalage.toFixed(1)}px`;
      });
    });
    assombris.forEach((el) => {
      el.style.opacity = (Math.min(1, Math.max(0, y / (vh * 0.95))) * 0.72).toFixed(3);
    });
  };
  const demander = () => {
    if (!image) image = requestAnimationFrame(peindre);
  };

  const io = new IntersectionObserver(
    (entrees) => {
      for (const e of entrees) {
        if (e.isIntersecting) proches.add(e.target);
        else proches.delete(e.target);
      }
      demander();
    },
    { rootMargin: "25% 0px" },
  );
  document.querySelectorAll<HTMLElement>("[data-par]").forEach((el) => {
    const parent = el.parentElement ?? el;
    if (!groupes.has(parent)) {
      groupes.set(parent, []);
      io.observe(parent);
    }
    groupes.get(parent)?.push(el);
  });
  mesurer();

  window.addEventListener("scroll", demander, { passive: true });
  window.addEventListener("resize", () => {
    mesurer();
    demander();
  });
  demander();
}

if (!reduit) {
  entree();
  apparitions();
  defilement();
}
