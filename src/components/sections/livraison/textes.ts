import { site } from "@/config/site";

// Libellés d'interface de la section. À déplacer dans `site.textes.livraison` si le restaurateur veut les modifier.

const numero = site.adresse.rue.match(/^\d+/)?.[0];

/** « Le 43 » : le restaurant, tel qu'on l'appelle dans les textes. */
export const LE_43 = numero ? `Le ${numero}` : site.nom;

export const TEXTES = {
  ongletsAria: "Livraison ou à emporter",
  onglets: { livraison: "Livraison", emporter: "À emporter" },
  communesTitre: "Les communes livrées",
  communesAide: "Choisissez une commune pour la situer sur le schéma.",
  legende: "Schéma, pas à l'échelle",
  infos: {
    minimum: "Minimum de commande",
    frais: "Frais de livraison",
    delai: "Délai estimé",
  },
  boutonLivraison: "Commander en livraison",
  emporterTitre: "À emporter, en trois étapes",
  etapes: [
    "Commandez en ligne",
    "Choisissez votre créneau",
    `Récupérez-la ${numero ? `au ${numero}` : "au restaurant"} : elle vous attend`,
  ],
  boutonEmporter: "Commander à emporter",
  itineraire: numero ? `Itinéraire jusqu'au ${numero}` : "Itinéraire",
} as const;
