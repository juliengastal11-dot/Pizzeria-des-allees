/*
 * Toutes les informations du site, à modifier ici et nulle part ailleurs.
 * Une valeur vide ("") signifie « pas encore connue » : le site affiche
 * « à confirmer » ou masque l'élément, et ne la publie pas dans les données
 * lues par Google.
 */

export type Jour = "Lundi" | "Mardi" | "Mercredi" | "Jeudi" | "Vendredi" | "Samedi" | "Dimanche";
/** Créneaux d'ouverture d'un jour, au format 24 h ["ouverture", "fermeture"]. Aucun créneau = fermé. */
export type Creneaux = [string, string][];

export type Pizza = {
  id: string;
  nom: string;
  description: string;
  base: "tomate" | "crème";
  vegetarienne?: boolean;
  pimentee?: boolean;
  duMoment?: boolean;
};

export type Commune = {
  nom: string;
  /** Libellé sur le plan, avec un retour à la ligne éventuel. */
  etiquette: string;
  longitude: number;
  latitude: number;
  /** Côté de l'étiquette sur le plan. */
  cote: "gauche" | "droite";
};

export const site = {
  nom: "La Pizzeria des Allées",
  /** Adresse publique du site, sans barre finale. */
  urlSite: "https://pizzeria-des-allees.vercel.app",
  /** Faux tant que le domaine définitif n'est pas en place : le site demande aux moteurs de ne pas l'indexer. */
  indexable: false,
  /**
   * Présentation au client : affiche les points encore à valider (encadrés en pointillés).
   * Également activable sans toucher au code en ajoutant ?a-valider à l'adresse de la page.
   */
  annoter: false,

  adresse: {
    rue: "43 Allées Paul Riquet",
    codePostal: "34500",
    ville: "Béziers",
    region: "Occitanie",
    pays: "FR",
    latitude: 43.341425,
    longitude: 3.218144,
  },
  telephone: "04 99 41 86 61",
  /** Même numéro, au format international (liens « Appeler »). */
  telephoneInternational: "+33499418661",
  email: "",

  horaires: {
    /** Passer à true une fois validés : la mention « à confirmer » disparaît et Google les reçoit. */
    confirmes: false,
    semaine: [
      ["Lundi", []],
      ["Mardi", [["12:00", "14:00"], ["18:30", "22:30"]]],
      ["Mercredi", [["12:00", "14:00"], ["18:30", "22:30"]]],
      ["Jeudi", [["12:00", "14:00"], ["18:30", "22:30"]]],
      ["Vendredi", [["12:00", "14:00"], ["18:30", "23:00"]]],
      ["Samedi", [["12:00", "14:30"], ["18:30", "23:00"]]],
      ["Dimanche", [["18:30", "22:30"]]],
    ] satisfies [Jour, Creneaux][],
  },

  paiements: "Carte bancaire, titres-restaurant, espèces",
  capacite: {
    texte: "50 couverts en salle, 100 en terrasse",
    confirmee: false,
  },

  avisGoogle: {
    note: "4,6/5",
    nombre: "2 137 avis",
    releve: "26/09/2026",
    /** La fiche Google porte encore l'ancien nom : le lien « Lire les avis » n'apparaît qu'une fois vérifiée. */
    ficheVerifiee: false,
    lien: "https://www.google.com/maps/place/Basilic+%26+Co+-+pizzas+de+terroirs+-+B%C3%A9ziers/@43.3414205,3.2181342,17z/data=!3m1!4b1!4m6!3m5!1s0x12b10fed5dbd6f95:0x842c6f4c237de571!8m2!3d43.3414205!4d3.2181342!16s%2Fg%2F11j303zkvd",
  },

  liens: {
    /** Lien Obypay (commande en ligne, à emporter et livraison). Vide : les boutons Commander mènent à la section Commander. */
    obypay: "",
    /** Module de réservation TheFork. ⚠ La fiche affiche encore « Basilic & Co Béziers » : à renommer dans TheFork Manager. */
    thefork: "https://widget.thefork.com/fr/acc6e60d-e29b-4326-afa2-800b8c26bb8b?step=date",
    itineraire: "https://www.google.com/maps/dir/?api=1&destination=43+All%C3%A9es+Paul+Riquet%2C+34500+B%C3%A9ziers",
    carte: "https://www.google.com/maps/search/?api=1&query=43+All%C3%A9es+Paul+Riquet%2C+34500+B%C3%A9ziers",
  },

  reseaux: {
    instagram: "",
    facebook: "",
  },

  livraison: {
    minimum: "",
    frais: "",
    delai: "",
    /** Coordonnées officielles (geo.api.gouv.fr). Béziers, où se trouve la pizzeria, est au centre du plan. */
    communes: [
      { nom: "Corneilhan", etiquette: "Corneilhan", longitude: 3.1927, latitude: 43.4026, cote: "droite" },
      { nom: "Lignan-sur-Orb", etiquette: "Lignan-sur-Orb", longitude: 3.1728, latitude: 43.383, cote: "droite" },
      { nom: "Boujan-sur-Libron", etiquette: "Boujan-sur-Libron", longitude: 3.2628, latitude: 43.3803, cote: "droite" },
      { nom: "Villeneuve-lès-Béziers", etiquette: "Villeneuve-lès-Béziers", longitude: 3.2909, latitude: 43.3178, cote: "gauche" },
      { nom: "Sauvian", etiquette: "Sauvian", longitude: 3.2541, latitude: 43.2885, cote: "gauche" },
      { nom: "Sérignan", etiquette: "Sérignan", longitude: 3.3011, latitude: 43.271, cote: "gauche" },
    ] satisfies Commune[],
  },

  /** La sélection de la carte (recettes à valider avec le pizzaïolo). Les images sont dans src/assets/images/pizzas/<id>.webp. */
  pizzas: [
    { id: "passejada", nom: "La Passejada", description: "Tomate, mozzarella, pélardon, olives Lucques, jambon cru, thym", base: "tomate" },
    { id: "cers", nom: "Le Cers", description: "Crème, cèbes de Lézignan confites, poitrine fumée, mozzarella, poivre noir", base: "crème" },
    { id: "lou-camel", nom: "Lou Camel", description: "Tomate, mozzarella, saucisse d’agneau épicée, poivrons grillés, oignons rouges", base: "tomate", pimentee: true },
    { id: "plateau-des-poetes", nom: "Plateau des Poètes", description: "Tomate, mozzarella, légumes grillés du marché, roquette, brebis, huile d’olive", base: "tomate", vegetarienne: true },
    { id: "rosace", nom: "La Rosace", description: "Tomate, mozzarella, champignons, jambon blanc, origan", base: "tomate" },
    { id: "caritats", nom: "Les Caritats", description: "Crème, magret fumé, figues, oignons confits, roquette", base: "crème", duMoment: true },
  ] satisfies Pizza[],

  /** Mentions légales (fenêtre du pied de page). Vide = « à confirmer ». */
  legal: {
    raisonSociale: "",
    capital: "",
    siretRcs: "",
    tva: "",
    directeurPublication: "",
    /**
     * Hébergeur, une fois décidé qui héberge. Si c'est sur Vercel :
     * "Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis (+1 559 288 7060)".
     */
    hebergeur: "",
    /** Crédit du pied de page (« Site réalisé par ») et des mentions légales. */
    concepteur: "VTBON",
  },

  annee: 2026,
};

/** Lien de commande : Obypay quand il existe, sinon la section Commander de la page. */
export const commande = site.liens.obypay
  ? { href: site.liens.obypay, target: "_blank" as const, rel: "noopener" }
  : { href: "#commander", target: undefined, rel: undefined };

export const adresseComplete = `${site.adresse.rue}, ${site.adresse.codePostal} ${site.adresse.ville}`;

/** Un petit nombre en toutes lettres, au féminin : « six communes ». */
export function enLettres(n: number) {
  return ["zéro", "une", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix"][n] ?? String(n);
}

/** Données structurées lues par Google (schema.org Restaurant), publiées seulement pour ce qui est confirmé. */
export function donneesRestaurant() {
  const jours: Record<Jour, string> = {
    Lundi: "Monday",
    Mardi: "Tuesday",
    Mercredi: "Wednesday",
    Jeudi: "Thursday",
    Vendredi: "Friday",
    Samedi: "Saturday",
    Dimanche: "Sunday",
  };
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: site.nom,
    servesCuisine: ["Pizza"],
    telephone: "+33 4 99 41 86 61",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.adresse.rue,
      postalCode: site.adresse.codePostal,
      addressLocality: site.adresse.ville,
      addressRegion: site.adresse.region,
      addressCountry: site.adresse.pays,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.adresse.latitude, longitude: site.adresse.longitude },
    acceptsReservations: site.liens.thefork,
    paymentAccepted: "Carte bancaire, Titres-restaurant, Espèces",
    areaServed: ["Béziers", ...site.livraison.communes.map((c) => c.nom)],
    hasMap: site.liens.carte,
  };
  if (site.horaires.confirmes) {
    ld.openingHoursSpecification = site.horaires.semaine.flatMap(([jour, creneaux]) =>
      creneaux.map(([opens, closes]) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${jours[jour]}`,
        opens,
        closes,
      })),
    );
  }
  if (site.email) ld.email = site.email;
  const reseaux = [site.reseaux.instagram, site.reseaux.facebook].filter(Boolean);
  if (reseaux.length) ld.sameAs = reseaux;
  return ld;
}
