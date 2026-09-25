/**
 * ============================================================================
 *  FICHIER DE CONFIGURATION UNIQUE — La Pizzeria des Allées
 * ============================================================================
 *  Tout ce qui peut changer (nom, logo, liens, horaires, téléphone, textes,
 *  photos, pizzas mises en avant) se modifie ICI, et nulle part ailleurs.
 *
 *  Règle des placeholders : toute valeur encore inconnue s'écrit entre
 *  crochets, par exemple "[À CONFIRMER]". Le site les reconnaît (voir
 *  `estPlaceholder`) : il les affiche en pointillés dans la maquette et
 *  désactive les liens correspondants. Pour lister ceux qui restent :
 *      rechercher « [ » dans ce fichier.
 * ============================================================================
 */

export type Jour = "lundi" | "mardi" | "mercredi" | "jeudi" | "vendredi" | "samedi" | "dimanche";

/** Un créneau d'ouverture, au format 24 h "HH:MM". */
export type Creneau = { ouverture: string; fermeture: string };

export type Pizza = {
  id: string;
  nom: string;
  /** Une ligne courte, en langage de table. */
  description: string;
  base: "tomate" | "crème";
  /** Image détourée (fond transparent), dans /public/images/pizzas/. */
  image: string;
  vegetarienne?: boolean;
  pimentee?: boolean;
  duMoment?: boolean;
  /** Laisser vide : les prix vivent dans l'outil de commande pour ne jamais être périmés. */
  prix?: string;
};

export type Photo = {
  src: string;
  alt: string;
  legende: string;
  lieu: "salle" | "terrasse";
  /** Position du cadrage dans les arches (object-position CSS). */
  cadrage?: string;
};

export const site = {
  /* ------------------------------------------------------------------------
   * Identité
   * --------------------------------------------------------------------- */
  nom: "La Pizzeria des Allées",
  /** Découpage du nom pour le grand titre du hero (deux lignes). */
  nomLignes: ["La Pizzeria", "des Allées"] as const,
  logo: {
    src: "/images/logo.png",
    alt: "Logo de La Pizzeria des Allées : badge rond bleu nuit et or représentant la cathédrale Saint-Nazaire et le Pont Vieux",
  },
  /** Domaine définitif, sans barre finale. Sert au SEO et au sitemap. */
  urlSite: "https://[DOMAINE À VENIR]",

  /* ------------------------------------------------------------------------
   * Coordonnées
   * --------------------------------------------------------------------- */
  adresse: {
    rue: "43 Allées Paul Riquet",
    codePostal: "34500",
    ville: "Béziers",
    pays: "FR",
  },
  telephone: "[À CONFIRMER]", // format affiché, ex. "04 67 00 00 00"
  email: "[À CONFIRMER]",

  /**
   * Horaires. Laisser `aConfirmer: true` tant qu'ils ne sont pas validés :
   * le site affiche alors « Horaires [À CONFIRMER] » et masque le badge
   * « Ouvert / Fermé ». Un jour sans créneau = fermé.
   */
  horaires: {
    aConfirmer: true,
    semaine: {
      lundi: [],
      mardi: [{ ouverture: "12:00", fermeture: "14:00" }, { ouverture: "18:30", fermeture: "22:30" }],
      mercredi: [{ ouverture: "12:00", fermeture: "14:00" }, { ouverture: "18:30", fermeture: "22:30" }],
      jeudi: [{ ouverture: "12:00", fermeture: "14:00" }, { ouverture: "18:30", fermeture: "22:30" }],
      vendredi: [{ ouverture: "12:00", fermeture: "14:00" }, { ouverture: "18:30", fermeture: "23:00" }],
      samedi: [{ ouverture: "12:00", fermeture: "14:30" }, { ouverture: "18:30", fermeture: "23:00" }],
      dimanche: [{ ouverture: "18:30", fermeture: "22:30" }],
    } satisfies Record<Jour, Creneau[]>,
  },

  paiements: ["Carte bancaire", "Titres-restaurant", "Espèces"],
  couverts: { salle: 50, terrasse: 100 },

  /* ------------------------------------------------------------------------
   * Outils externes (liens et widgets uniquement, aucune API)
   * --------------------------------------------------------------------- */
  liens: {
    /** Obypay : click & collect + livraison (Uber Direct déclenché par Obypay). */
    commander: "[LIEN OBYPAY À VENIR]",
    /**
     * TheFork : widget de réservation ouvert dans une fenêtre du site.
     * ⚠ Au 25/09/2026, ce widget affiche encore « Basilic & Co Béziers » :
     * renommer la fiche dans TheFork Manager avant la mise en ligne.
     */
    reserver: "https://widget.thefork.com/fr/acc6e60d-e29b-4326-afa2-800b8c26bb8b?step=date",
    /** Itinéraire Google Maps (s'ouvre dans un nouvel onglet, aucun cookie sur le site). */
    itineraire: "https://www.google.com/maps/dir/?api=1&destination=43+All%C3%A9es+Paul+Riquet%2C+34500+B%C3%A9ziers",
    /** Carte intégrée, chargée seulement au clic du visiteur (RGPD). */
    carteIntegree: "https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s43+All%C3%A9es+Paul+Riquet,+34500+B%C3%A9ziers!6i17",
  },

  reseaux: {
    instagram: "[LIEN À VENIR]",
    facebook: "[LIEN À VENIR]",
  },

  /**
   * Programme de fidélité : emplacement prévu, désactivé.
   * Outil pressenti : Hey Pongo ou la fidélité Obypay. Passer `actif` à true
   * et renseigner `url` quand l'outil est choisi.
   */
  fidelite: {
    actif: false,
    outil: "[OUTIL À CHOISIR]",
    url: "[LIEN À VENIR]",
    texte: "Cumulez des points à chaque commande et profitez d'une pizza offerte.",
  },

  /* ------------------------------------------------------------------------
   * Livraison et à emporter
   * --------------------------------------------------------------------- */
  livraison: {
    communes: [
      "Béziers",
      "Villeneuve-lès-Béziers",
      "Boujan-sur-Libron",
      "Lignan-sur-Orb",
      "Sauvian",
      "Sérignan",
      "Corneilhan",
    ],
    minimumCommande: "[À CONFIRMER]",
    frais: "[À CONFIRMER]",
    delai: "[À CONFIRMER]",
  },

  /* ------------------------------------------------------------------------
   * Textes (à valider avec le restaurateur)
   * --------------------------------------------------------------------- */
  textes: {
    hero: {
      surtitre: "Pizzeria artisanale · Béziers",
      accroche: "Pâte pétrie ici, produits du coin, et la terrasse sous les platanes des Allées.",
      modes: "Sur place · À emporter · En livraison",
    },
    histoire: {
      surtitre: "Notre histoire",
      titre: "Même adresse, nouvelle enseigne.",
      manifeste:
        "Au 43 des allées Paul-Riquet, on a rallumé le four sous notre propre nom. Même salle, même terrasse sous les platanes, et une carte qu'on écrit désormais nous-mêmes, avec ce que Béziers et ses coteaux posent sur la table.",
      points: [
        { titre: "La pâte", texte: "Pétrie chaque matin dans la cuisine du 43, et laissée le temps de lever. [À PRÉCISER : durée de maturation]" },
        { titre: "Les produits", texte: "Olives Lucques, pélardon, cèbes de Lézignan : des fournisseurs du Biterrois. [À PRÉCISER : noms des producteurs]" },
        { titre: "La maison", texte: "Une salle sous la fresque du Pont Vieux, une grande terrasse sous les platanes des Allées." },
      ],
    },
    carte: {
      surtitre: "La carte",
      titre: "Une sélection de la maison",
      intro: "Quelques pizzas que l'on aime faire goûter. La carte complète, les prix et la commande sont sur notre outil de commande en ligne, toujours à jour.",
      bouton: "Voir toute la carte et commander",
    },
    livraison: {
      surtitre: "Livraison et à emporter",
      titre: "De l'Orb au Libron, on livre.",
      intro: "Commandez en ligne : on prépare, un coursier partenaire vous livre chaud. Ou passez la chercher au 43, elle vous attend.",
    },
    salle: {
      surtitre: "La salle et la terrasse",
      titre: "50 couverts sous la fresque, 100 sous les platanes.",
      intro: "Une salle aux murs peints de Béziers et de vignes, une terrasse ouverte sur les Allées Paul-Riquet.",
    },
    infos: {
      surtitre: "Infos pratiques",
      titre: "Venir au 43",
    },
    footer: {
      signature: "À bientôt sous les platanes.",
    },
  },

  /* ------------------------------------------------------------------------
   * Pizzas mises en avant (exemples à valider avec le pizzaïolo)
   * La carte complète n'est PAS dupliquée ici : elle vit dans Obypay.
   * --------------------------------------------------------------------- */
  pizzas: [
    {
      id: "passejada",
      nom: "La Passejada",
      description: "Tomate, mozzarella, pélardon, olives Lucques, jambon cru, thym",
      base: "tomate",
      image: "/images/pizzas/passejada.webp",
    },
    {
      id: "cers",
      nom: "Le Cers",
      description: "Crème, cèbes de Lézignan confites, poitrine fumée, mozzarella, poivre noir",
      base: "crème",
      image: "/images/pizzas/cers.webp",
    },
    {
      id: "lou-camel",
      nom: "Lou Camel",
      description: "Tomate, mozzarella, saucisse d'agneau épicée, poivrons grillés, oignons rouges",
      base: "tomate",
      image: "/images/pizzas/lou-camel.webp",
      pimentee: true,
    },
    {
      id: "plateau-des-poetes",
      nom: "Plateau des Poètes",
      description: "Tomate, mozzarella, légumes grillés du marché, roquette, brebis, huile d'olive",
      base: "tomate",
      image: "/images/pizzas/plateau-des-poetes.webp",
      vegetarienne: true,
    },
    {
      id: "rosace",
      nom: "La Rosace",
      description: "Tomate, mozzarella, champignons, jambon blanc, origan",
      base: "tomate",
      image: "/images/pizzas/rosace.webp",
    },
    {
      id: "caritats",
      nom: "Les Caritats",
      description: "Crème, magret fumé, figues, oignons confits, roquette",
      base: "crème",
      image: "/images/pizzas/caritats.webp",
      duMoment: true,
    },
  ] satisfies Pizza[],

  /* ------------------------------------------------------------------------
   * Photos (provisoires : un shooting pro est prévu à la réouverture)
   * --------------------------------------------------------------------- */
  photos: {
    galerie: [
      {
        src: "/images/salle/salle-fresque-beziers.jpg",
        alt: "La salle principale : tables en chêne clair sous une grande fresque de Béziers, avec la cathédrale Saint-Nazaire et le Pont Vieux",
        legende: "La fresque du Pont Vieux",
        lieu: "salle",
        cadrage: "50% 45%",
      },
      {
        src: "/images/salle/salle-vignes.jpg",
        alt: "Le coin des vignes : une fresque de vignoble, un cadre végétal en chêne et des tables dressées",
        legende: "Le coin des vignes",
        lieu: "salle",
        cadrage: "45% 50%",
      },
      {
        src: "/images/salle/salle-cadres-vegetaux.jpg",
        alt: "Deux cadres végétaux en chêne clair au-dessus de tables pour deux, sous des ampoules à filament",
        legende: "Les murs de mousse",
        lieu: "salle",
        cadrage: "55% 45%",
      },
      {
        src: "/images/salle/facade-nuit.jpg",
        alt: "La devanture du 43 le soir, enseigne bleu nuit et or, et les tables de la terrasse sur les Allées",
        legende: "La terrasse, le soir",
        lieu: "terrasse",
        cadrage: "50% 70%",
      },
    ] satisfies Photo[],
    /** Visuels générés par IA ou retouchés : mention « visuels provisoires » affichée en pied de page. */
    provisoires: true,
  },

  /* ------------------------------------------------------------------------
   * Hero : fresque animée (vidéo en boucle) et ligne d'horizon détourée
   * --------------------------------------------------------------------- */
  hero: {
    videoMp4: "/video/fresque-hero.mp4",
    videoWebm: "/video/fresque-hero.webm",
    poster: "/images/hero/fresque-poster.jpg",
    horizon: "/images/hero/fresque-horizon.webp",
    pizza: "/images/pizzas/passejada.webp",
    alt: "La fresque de la salle : la cathédrale Saint-Nazaire sur sa colline, le Pont Vieux et l'Orb, animés comme un matin d'été",
  },

  /* ------------------------------------------------------------------------
   * SEO local
   * --------------------------------------------------------------------- */
  seo: {
    titre: "La Pizzeria des Allées · Pizzeria artisanale à Béziers",
    description:
      "Pizzeria artisanale au 43 Allées Paul Riquet à Béziers : pizzas au feu, produits du Biterrois, grande terrasse. Sur place, à emporter ou en livraison à Béziers et alentours.",
    motsCles: [
      "pizzeria Béziers",
      "pizza Béziers",
      "pizzeria Allées Paul Riquet",
      "livraison pizza Béziers",
      "pizza à emporter Béziers",
      "restaurant terrasse Béziers",
    ],
    fourchettePrix: "€€",
  },

  /* ------------------------------------------------------------------------
   * Mentions légales (à compléter avec les informations de la société)
   * --------------------------------------------------------------------- */
  legal: {
    raisonSociale: "[À CONFIRMER]",
    formeJuridique: "[À CONFIRMER]",
    capital: "[À CONFIRMER]",
    siret: "[À CONFIRMER]",
    rcs: "[À CONFIRMER]",
    tva: "[À CONFIRMER]",
    directeurPublication: "[À CONFIRMER]",
    concepteur: "[NOM DU CONCEPTEUR DU SITE]",
    hebergeur: {
      nom: "Vercel Inc.",
      adresse: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
      site: "https://vercel.com",
    },
  },
} as const;

/** Vrai si la valeur est encore un placeholder "[...]" (ou vide). */
export function estPlaceholder(valeur: string | null | undefined): boolean {
  if (!valeur) return true;
  return /\[[^\]]+\]/.test(valeur);
}

/** Adresse sur une ligne, pour l'affichage et le SEO. */
export const adresseComplete = `${site.adresse.rue}, ${site.adresse.codePostal} ${site.adresse.ville}`;

export const JOURS: Jour[] = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
