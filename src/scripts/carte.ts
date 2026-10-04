/*
 * La carte : filtre par base, pizza choisie (ordinateur) et carrousel
 * (téléphone). Le HTML contient déjà toutes les pizzas ; le script ne fait
 * que masquer, désigner la pizza active et tenir le compteur à jour.
 */
import { reduit } from "./mouvement";

const carte = document.querySelector<HTMLElement>("[data-carte]");

if (carte) {
  const lignes = [...carte.querySelectorAll<HTMLLIElement>("li[data-pizza]")];
  const images = [...carte.querySelectorAll<HTMLImageElement>("img[data-pizza]")];
  const diapos = [...carte.querySelectorAll<HTMLElement>(".diapo[data-pizza]")];
  const piste = carte.querySelector<HTMLElement>("[data-piste]");
  const compteur = carte.querySelector<HTMLElement>("[data-compteur]");

  let filtre = "toutes";
  let active = lignes[0]?.dataset.pizza;
  let precedente: string | undefined;
  let diapo = 0;

  // Les pizzas en attente prennent leur rotation (et se téléchargent) un peu avant que la carte n'arrive à l'écran
  const scene = carte.querySelector<HTMLElement>("#scene-carte");
  if (scene) {
    const io = new IntersectionObserver(
      (entrees) => {
        if (!entrees.some((e) => e.isIntersecting)) return;
        scene.setAttribute("data-proche", "");
        io.disconnect();
      },
      { rootMargin: "800px 0px" },
    );
    io.observe(scene);
  }

  const retenue = (base?: string) => filtre === "toutes" || base === filtre;
  const diaposVisibles = () => diapos.filter((d) => !d.hidden);

  // La pizza choisie arrive en tournant ; la précédente repart dans l'autre sens
  function afficher() {
    for (const li of lignes) {
      const choisie = li.dataset.pizza === active;
      li.toggleAttribute("data-actif", choisie);
      li.querySelector("[data-choisir]")?.setAttribute("aria-pressed", String(choisie));
    }
    for (const img of images) {
      const id = img.dataset.pizza;
      img.dataset.etat = id === active ? "actif" : id === precedente ? "precedente" : "autre";
      img.setAttribute("aria-hidden", String(id !== active));
    }
  }

  function choisir(id: string | undefined) {
    if (!id || id === active) return;
    precedente = active;
    active = id;
    afficher();
  }

  function majCompteur() {
    const n = diaposVisibles().length;
    if (compteur) compteur.textContent = `${Math.min(diapo + 1, n)} / ${n}`;
  }

  carte.addEventListener("click", (e) => {
    const bouton = (e.target as Element).closest("[data-choisir]");
    if (bouton) choisir(bouton.closest<HTMLElement>("li[data-pizza]")?.dataset.pizza);
  });

  carte.querySelectorAll<HTMLInputElement>("input[data-filtre]").forEach((radio) =>
    radio.addEventListener("change", () => {
      if (!radio.checked) return;
      filtre = radio.value;
      for (const el of [...lignes, ...diapos]) el.hidden = !retenue(el.dataset.base);
      choisir(lignes.find((li) => !li.hidden)?.dataset.pizza);
      piste?.scrollTo({ left: 0 });
      diapo = 0;
      majCompteur();
      demanderRoule();
    }),
  );

  /*
   * Téléphone : en traversant le centre du carrousel, chaque pizza roule.
   * Elle arrive par la droite inclinée de 12° et un peu plus petite (92 %), se redresse pleine taille
   * au centre, puis repart vers la gauche inclinée de −12°. La progression p vaut 0 quand la carte
   * touche le bord droit, 0,5 centrée, 1 quand elle a quitté le bord gauche.
   */
  const rouleurs = new Map(diapos.map((d) => [d, d.querySelector<HTMLElement>("[data-roule]")]));
  function rouler() {
    if (reduit || !piste) return;
    const largeur = piste.clientWidth;
    if (!largeur) return; // masqué (ordinateur)
    for (const d of diapos) {
      const el = rouleurs.get(d);
      if (!el || d.hidden) continue;
      const x = d.offsetLeft - piste.scrollLeft;
      const p = Math.min(1, Math.max(0, (largeur - x) / (largeur + d.offsetWidth)));
      el.style.rotate = `${(12 - 24 * p).toFixed(2)}deg`;
      el.style.scale = (1 - 0.08 * Math.abs(2 * p - 1)).toFixed(3);
    }
  }
  let imageRoule = 0;
  const demanderRoule = () => {
    if (!imageRoule) imageRoule = requestAnimationFrame(() => ((imageRoule = 0), rouler()));
  };

  // Le compteur suit le défilement, les flèches avancent d'une pizza
  piste?.addEventListener(
    "scroll",
    () => {
      demanderRoule();
      const premiere = diaposVisibles()[0];
      if (!premiere) return;
      const pas = premiere.getBoundingClientRect().width + 16;
      const i = Math.round(piste.scrollLeft / pas);
      if (i !== diapo) {
        diapo = i;
        majCompteur();
      }
    },
    { passive: true },
  );
  window.addEventListener("resize", demanderRoule);
  rouler();

  function aller(sens: number) {
    if (!piste) return;
    const visibles = diaposVisibles();
    const el = visibles[Math.max(0, Math.min(visibles.length - 1, diapo + sens))];
    if (!el) return;
    piste.scrollTo({ left: el.offsetLeft - (piste.clientWidth - el.clientWidth) / 2, behavior: reduit ? "auto" : "smooth" });
  }
  carte.querySelector("[data-precedente]")?.addEventListener("click", () => aller(-1));
  carte.querySelector("[data-suivante]")?.addEventListener("click", () => aller(1));
}
