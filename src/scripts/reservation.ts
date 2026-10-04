/*
 * Réservation TheFork : le module ne se charge qu'à la demande (bouton
 * « Choisir une date » ou n'importe quel lien Réserver), pour ne déposer
 * aucun cookie tiers tant que le visiteur ne l'a pas voulu.
 * États du cadre (data-etat) : repos, chargement, pret.
 */
import { reduit } from "./animations";

const module = document.querySelector<HTMLElement>("[data-reservation]");

export function activerReservation() {
  if (!module || module.dataset.etat !== "repos" || !module.dataset.src) return;
  module.dataset.etat = "chargement";

  const trait = module.querySelector<HTMLElement>("[data-chargeur]");
  const chargeur =
    trait && !reduit
      ? trait.animate([{ transform: "translateX(-100%)" }, { transform: "translateX(260%)" }], {
          duration: 1300,
          iterations: Infinity,
          easing: "cubic-bezier(.65,0,.35,1)",
        })
      : undefined;

  const cadre = document.createElement("iframe");
  cadre.src = module.dataset.src;
  cadre.title = "Réservation en ligne avec TheFork";
  cadre.allow = "payment";
  cadre.addEventListener(
    "load",
    () => {
      const focusDedans = module.contains(document.activeElement);
      module.dataset.etat = "pret";
      chargeur?.cancel();
      if (focusDedans) cadre.focus();
    },
    { once: true },
  );
  // Sous la couverture, qui reste par-dessus jusqu'au chargement complet
  module.prepend(cadre);
}

document.addEventListener("click", (e) => {
  if ((e.target as Element).closest?.("[data-reserver], [data-choisir-date]")) activerReservation();
});
