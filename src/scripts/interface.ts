/*
 * Ce qui réagit au visiteur hors de la carte : l'en-tête qui se fonce au
 * défilement, la barre d'actions du téléphone, le menu, la fenêtre des
 * mentions légales et le jour courant dans les horaires.
 */
import { allumer, EO } from "./animations";
import { reduit } from "./mouvement";

const html = document.documentElement;
const entete = document.getElementById("entete");
const barre = document.querySelector<HTMLElement>("[data-barre]");
const menu = document.querySelector<HTMLDialogElement>("[data-menu]");
const boutonMenu = document.querySelector<HTMLButtonElement>("[data-ouvrir-menu]");
const legal = document.querySelector<HTMLDialogElement>("[data-legal]");
const telephone = matchMedia("(max-width: 859.98px)");

// En-tête : fond opaque dès qu'on a défilé de quelques pixels
function majEntete() {
  entete?.toggleAttribute("data-defile", window.scrollY > 24);
}

/*
 * Barre d'actions (téléphone) : visible passé la moitié du premier écran,
 * sauf quand des boutons Réserver ou Commander sont déjà à l'écran.
 */
const zones = new Set<Element>();
let barreAllumee = false;
function majBarre() {
  if (!barre) return;
  const visible = telephone.matches && window.scrollY > window.innerHeight * 0.5 && zones.size === 0 && !menu?.open;
  if (visible === barre.hasAttribute("data-visible")) return;
  barre.toggleAttribute("data-visible", visible);
  if (visible && !barreAllumee) {
    barreAllumee = true;
    setTimeout(() => allumer('[data-ignite="bar"]'), 450);
  }
}
const zonesIO = new IntersectionObserver(
  (entrees) => {
    for (const e of entrees) {
      if (e.isIntersecting) zones.add(e.target);
      else zones.delete(e.target);
    }
    majBarre();
  },
  { threshold: 0.12 },
);
document.querySelectorAll("[data-cta-zone]").forEach((z) => zonesIO.observe(z));

window.addEventListener(
  "scroll",
  () => {
    majEntete();
    majBarre();
  },
  { passive: true },
);
window.addEventListener("resize", majBarre);
telephone.addEventListener("change", majBarre);
majEntete();
majBarre();

/*
 * Fenêtres (menu, mentions) : modales natives, page figée derrière.
 * À la fermeture, le focus revient au bouton qui l'a ouverte (Safari ne le
 * fait pas seul : un clic n'y donne pas le focus au bouton), sauf quand on
 * part vers une section depuis le menu.
 */
let ouvreur: HTMLElement | null = null;
let versUneSection = false;
function ouvrir(fenetre: HTMLDialogElement | null, depuis: HTMLElement) {
  if (!fenetre || fenetre.open) return;
  ouvreur = depuis;
  fenetre.showModal();
  html.style.overflow = "hidden";
}
for (const fenetre of [menu, legal]) {
  if (!fenetre) continue;
  fenetre.addEventListener("close", () => {
    html.style.overflow = "";
    if (fenetre === menu) boutonMenu?.setAttribute("aria-expanded", "false");
    if (!versUneSection) ouvreur?.focus({ preventScroll: true });
    ouvreur = null;
    versUneSection = false;
    majBarre();
  });
  fenetre.querySelector("[data-fermer]")?.addEventListener("click", () => fenetre.close());
}

boutonMenu?.addEventListener("click", () => {
  if (!menu) return;
  ouvrir(menu, boutonMenu);
  boutonMenu.setAttribute("aria-expanded", "true");
  majBarre();
  if (!reduit) {
    menu.querySelectorAll("[data-menu-item]").forEach((el, i) =>
      el.animate([{ opacity: 0, transform: "translateY(18px)" }, { opacity: 1, transform: "none" }], {
        duration: 600,
        delay: 60 + i * 55,
        easing: EO,
        fill: "both",
      }),
    );
  }
});
// Un lien du menu mène ailleurs sur la page : le menu se referme (sauf « Appeler »)
menu?.addEventListener("click", (e) => {
  const lien = (e.target as Element).closest("a");
  if (!lien || lien.hasAttribute("data-reste-ouvert")) return;
  versUneSection = lien.getAttribute("href")?.startsWith("#") ?? false;
  menu.close();
});

document.querySelectorAll<HTMLElement>("[data-ouvrir-legal]").forEach((b) => b.addEventListener("click", () => ouvrir(legal, b)));
// Un clic sur le fond sombre, hors du panneau, ferme les mentions
legal?.addEventListener("click", (e) => {
  if (e.target === legal) legal.close();
});

// Horaires : le jour même, à l'heure de Paris
const jour = new Intl.DateTimeFormat("fr-FR", { weekday: "long", timeZone: "Europe/Paris" }).format(new Date()).toLowerCase();
const ligne = document.querySelector(`[data-horaires] tr[data-jour="${jour}"]`);
if (ligne) {
  ligne.setAttribute("aria-current", "date");
  const mention = ligne.querySelector(".aujourdhui");
  if (mention) mention.textContent = "aujourd’hui";
}
