/**
 * ============================================================================
 *  FICHIER DE CONFIGURATION UNIQUE — La Pizzeria des Allées
 * ============================================================================
 *  Tout ce qui peut changer (nom, logo, liens, horaires, téléphone, textes,
 *  photos, pizzas mises en avant, mentions légales) se modifie ICI, et nulle
 *  part ailleurs.
 *
 *  Règle des placeholders : toute valeur encore inconnue s'écrit entre
 *  crochets, par exemple "[À CONFIRMER]". Le site les reconnaît (voir
 *  `estPlaceholder`) : il les affiche en pointillés dans la maquette et
 *  désactive les liens correspondants. Pour lister ceux qui restent :
 *      rechercher « [ » dans ce fichier.
 *
 *  Typographie française :
 *   - «   » est une espace insécable : on la met avant « : ; ! ? »,
 *     après « et avant » (ex. "Horaires :"), entre un nombre et son unité.
 *   - apostrophe typographique « ’ » dans les textes affichés (l’Orb, qu’on).
 *   - « {mot} » dans un texte est remplacé par le site (nombre, nom, commune…).
 *
 *  Repères de relecture :
 *   - « // À VALIDER » : affirmation ou choix à faire confirmer par le restaurant.
 *   - « // ⚠ » : point bloquant avant la mise en ligne.
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
  /**
   * Point de cadrage dans les arches (« x% y% », comme object-position CSS).
   * Les photos paysage sont zoomées autour de ce point (voir
   * src/components/sections/salle/cadrage.ts) : « 50% 100% » garde le bas de la photo.
   */
  cadrage?: string;
};

export const site = {
  /* ------------------------------------------------------------------------
   * Identité
   * --------------------------------------------------------------------- */
  nom: "La Pizzeria des Allées",
  /** Nom court, sous l'icône du site ajouté à l'écran d'accueil d'un téléphone. */
  nomCourt: "Pizzeria des Allées",
  /** Découpage du nom sur deux lignes : grand titre du hero et étiquette de la carte de livraison. */
  nomLignes: ["La Pizzeria", "des Allées"] as const,
  logo: {
    src: "/images/logo.png",
    alt: "Logo de La Pizzeria des Allées : badge rond bleu nuit et or représentant la cathédrale Saint-Nazaire et le Pont Vieux",
  },
  /** Domaine définitif, sans barre finale. Sert au SEO et au sitemap. Tant que c'est un placeholder, le site n'est pas indexé. */
  urlSite: "https://[DOMAINE À VENIR]",

  /* ------------------------------------------------------------------------
   * Coordonnées
   * --------------------------------------------------------------------- */
  adresse: {
    rue: "43 Allées Paul Riquet",
    codePostal: "34500",
    ville: "Béziers",
    region: "Occitanie",
    pays: "FR",
    /** Position du restaurant (données structurées Google). La carte de livraison utilise la même. */
    geo: { latitude: 43.341425, longitude: 3.218144 },
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
    /** Mention affichée (en pointillés) tant que `aConfirmer` est vrai. */
    mentionAConfirmer: "[À CONFIRMER]",
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
  /** Capacité : reprise dans le titre de la section « La salle » ({salle} et {terrasse}). */
  couverts: { salle: 50, terrasse: 100 }, // À VALIDER

  /* ------------------------------------------------------------------------
   * Outils externes (liens et widgets uniquement, aucune API)
   * --------------------------------------------------------------------- */
  liens: {
    /** Obypay : click & collect + livraison (Uber Direct déclenché par Obypay). */
    commander: "[LIEN OBYPAY À VENIR]",
    /**
     * TheFork : widget de réservation ouvert dans une fenêtre du site.
     * ⚠ BLOQUANT : au 25/09/2026, ce widget affiche encore « Basilic & Co Béziers ».
     * Faire renommer la fiche dans TheFork Manager (nom, photos, description)
     * AVANT la mise en ligne, puis ouvrir le widget à la main pour vérifier
     * qu'il ne reste aucune mention de l'ancienne enseigne.
     */
    reserver: "https://widget.thefork.com/fr/acc6e60d-e29b-4326-afa2-800b8c26bb8b?step=date",
    /** Itinéraire Google Maps (s'ouvre dans un nouvel onglet, aucun cookie sur le site). */
    itineraire: "https://www.google.com/maps/dir/?api=1&destination=43+All%C3%A9es+Paul+Riquet%2C+34500+B%C3%A9ziers",
    /**
     * Le restaurant sur une carte (données structurées « hasMap »).
     * À remplacer par le lien de la fiche Google Business Profile quand elle existera.
     */
    carte: "https://www.google.com/maps/search/?api=1&query=43+All%C3%A9es+Paul+Riquet%2C+34500+B%C3%A9ziers",
    /** Carte Google intégrée (section Infos), chargée seulement au clic du visiteur (RGPD). */
    carteIntegree: "https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s43+All%C3%A9es+Paul+Riquet,+34500+B%C3%A9ziers!6i17",
    /**
     * Fiche Google de la pizzeria (avis clients) : Julien garde cette fiche existante plutôt que d'en recréer une.
     * ⚠ Elle affiche encore l'ancienne enseigne (comme la fiche TheFork, voir `reserver`) : c'est
     * Google qui l'affiche, pas ce site, mais il faudra la faire renommer avant la mise en ligne réelle.
     */
    avisGoogle:
      "https://www.google.com/maps/place/Basilic+%26+Co+-+pizzas+de+terroirs+-+B%C3%A9ziers/@43.3414205,3.2181342,17z/data=!3m1!4b1!4m6!3m5!1s0x12b10fed5dbd6f95:0x842c6f4c237de571!8m2!3d43.3414205!4d3.2181342!16s%2Fg%2F11j303zkvd",
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
    /** Titre lu par les lecteurs d'écran (le bandeau n'a pas de titre visible). */
    titre: "Programme de fidélité",
    texte: "Cumulez des points à chaque commande et profitez d’une pizza offerte.", // À VALIDER
    bouton: "Rejoindre",
  },

  /* ------------------------------------------------------------------------
   * Livraison et à emporter
   * Les coordonnées de chaque commune (carte de nuit) sont dans
   * src/components/sections/livraison/geographie.ts : y ajouter toute nouvelle commune.
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
    /**
     * Zone de livraison tracée sur la carte (contour autour des communes).
     * false tant qu'elle n'est pas arrêtée : pas de contour, et la légende
     * affiche « Zone de livraison à définir ».
     */
    zoneDefinie: false, // À VALIDER
  },

  /* ------------------------------------------------------------------------
   * Menu et navigation
   * --------------------------------------------------------------------- */
  navigation: {
    /** Sections reliées par le menu, dans l'ordre. La clé est l'ancre de la section : ne pas la changer. */
    sections: {
      histoire: "Notre histoire",
      carte: "La carte",
      livraison: "Livraison",
      salle: "La salle",
      infos: "Infos pratiques",
      faq: "FAQ",
    },
    menu: "Menu",
    fermer: "Fermer",
    ariaPrincipale: "Navigation principale",
    ariaMenu: "Sections de la page",
    /** Nom du lien du logo. */
    lienAccueil: "{nom}, accueil",
    /** Lien d'évitement, visible au clavier seulement. */
    allerAuContenu: "Aller au contenu",
  },

  /* ------------------------------------------------------------------------
   * Textes (à valider avec le restaurateur)
   * --------------------------------------------------------------------- */
  textes: {
    // Boutons Commander / Réserver et leurs fenêtres (partout sur le site)
    actions: {
      commander: "Commander",
      reserver: "Réserver une table",
      /** Version courte des petits boutons : « Réserver » (« une table » reste lu par les lecteurs d'écran). */
      reserverCourt: "Réserver",
      reserverComplement: "une table",
      groupe: "Commander ou réserver",
      itineraire: "Itinéraire",
      nouvelOnglet: "(nouvel onglet)",
      itineraireNouvelOnglet: "(itinéraire, nouvel onglet)",
      fermer: "Fermer",
      fenetreCommande: {
        titre: "Commander en ligne",
        annonce: "La commande en ligne, en click & collect ou en livraison, ouvre très bientôt.",
        attenteTelephone: "En attendant, appelez-nous au",
        attenteAdresse: "En attendant, retrouvez-nous sur place :",
      },
      fenetreReservation: {
        titre: "Réserver une table",
        chargement: "Chargement du module de réservation…",
        titreIframe: "Réservation en ligne avec TheFork",
        fournisseur: "Le module de réservation est fourni par TheFork, qui peut déposer des cookies.",
        confidentialite: "Confidentialité",
        ouvrirOnglet: "Ouvrir dans un nouvel onglet",
      },
    },

    // Hero
    hero: {
      surtitre: "Pizzeria artisanale · Béziers",
      accroche: "Pâte pétrie ici, produits du coin, et la terrasse sous les platanes des Allées.", // À VALIDER
      modes: "Sur place · À emporter · En livraison",
    },

    // Notre histoire
    histoire: {
      surtitre: "Notre histoire",
      titre: "Même adresse, nouvelle enseigne.",
      // Le « ⁠ » (liant invisible) empêche la coupure « Paul- / Riquet » en fin de ligne.
      manifeste:
        "Sur les allées Paul-⁠Riquet, on a rallumé le four sous notre propre nom. Même salle, même terrasse sous les platanes, et une carte qu’on écrit désormais nous-mêmes, avec ce que Béziers et ses coteaux posent sur la table.",
      /**
       * Le mur de cadres : nos pizzas encadrées et rétroéclairées, deux photos de
       * la salle, et trois ardoises dont les phrases s'écrivent à la main à l'écran.
       * Phrases courtes (elles s'écrivent lettre à lettre) ; sans crochets : les
       * points à préciser sont en commentaire.
       */
      mur: {
        /** Nom du mur pour les lecteurs d'écran. */
        aria: "Le mur de la salle : nos pizzas encadrées et quelques mots sur la maison",
        /**
         * Cinq ardoises (textes du restaurateur, 25/09/2026).
         * ⚠ « pizzas de terroirs » reprend l'intitulé de l'ancienne fiche Google Basilic & Co
         * (voir liens.avisGoogle) : à reformuler si Julien veut zéro ressemblance.
         */
        ardoises: [
          "La Pizzeria des Allées vous propose une expérience culinaire unique centrée sur la pizza artisanale de qualité.",
          "Chaque pizza est confectionnée avec des ingrédients soigneusement sélectionnés.",
          "Notre savoir-faire garantit une pâte à pizza fine et croustillante et des garnitures généreuses.",
          "Complétant notre offre de pizzas de terroirs, nous vous proposons également une sélection de salades fraîches.", // ⚠ voir la note ci-dessus
          "Nos gratins de ravioles sont composés d’ingrédients frais et de saison, chaque recette est un équilibre parfait entre fraîcheur, saveurs et authenticité.",
        ],
        /** Pizzas exposées sur le mur (identifiants de `pizzas`), dans l'ordre d'accrochage : quatre cadres. */
        pizzas: ["passejada", "cers", "rosace", "caritats"],
      },
    },

    // La carte (fond ciel)
    carte: {
      surtitre: "La carte",
      titre: "Une sélection de la maison",
      intro: "Quelques pizzas que l’on aime faire goûter. La carte complète, les prix et la commande sont sur notre outil de commande en ligne, toujours à jour.",
      bouton: "Voir toute la carte et commander",
      etiquettes: {
        base: { tomate: "Base tomate", crème: "Base crème" } satisfies Record<Pizza["base"], string>,
        vegetarienne: "Végétarienne",
        pimentee: "Pimentée",
        /** Pastille posée sur la pizza (un mot par ligne). */
        duMoment: "Du moment",
      },
      carrousel: {
        aria: "Pizzas de la sélection, à faire défiler",
        position: "Pizza {n} sur {total} : {nom}",
        precedente: "Pizza précédente",
        suivante: "Pizza suivante",
      },
    },

    // Livraison et à emporter
    livraison: {
      surtitre: "Livraison et à emporter",
      titre: "Livraison sur Béziers et alentours",
      intro: "Commandez en ligne : on prépare, un coursier partenaire vous livre chaud. Ou passez la chercher à la pizzeria, elle vous attend.",
      onglets: { aria: "Livraison ou à emporter", livraison: "Livraison", emporter: "À emporter" },
      communes: {
        titre: "Les communes livrées",
        /** Consigne tant qu'aucune commune n'est choisie (annoncée aux lecteurs d'écran). */
        aide: "Choisissez une commune pour la voir sur la carte.",
        aideSansCarte: "Nous livrons dans ces communes.",
        /** Nom des boutons de la liste. */
        voirSurCarte: "Voir {commune} sur la carte",
        /** Phrase affichée et annoncée après le choix d'une commune. */
        annonce: "{commune} est dans notre zone de livraison, à environ {km} km {direction} de la pizzeria.",
        annonceCentre: "{commune} est dans notre zone de livraison, avec la pizzeria en plein centre.",
        /** Directions, du nord dans le sens des aiguilles d'une montre. */
        directions: ["au nord", "au nord-est", "à l’est", "au sud-est", "au sud", "au sud-ouest", "à l’ouest", "au nord-ouest"],
      },
      conditions: {
        minimum: "Minimum de commande",
        frais: "Frais de livraison",
        delai: "Délai estimé",
      },
      boutonLivraison: "Commander en livraison",
      emporter: {
        titre: "À emporter, en trois étapes",
        etapes: ["Commandez en ligne", "Choisissez votre créneau", "Récupérez-la à la pizzeria : elle vous attend"],
        bouton: "Commander à emporter",
        itineraire: "Itinéraire jusqu’à la pizzeria",
      },
      // Carte de nuit (fond OpenFreeMap). Le restaurant y porte son nom (`nom`, `nomLignes`).
      carte: {
        /** `zoneADefinir` remplace `zone` tant que `livraison.zoneDefinie` est faux. */
        legende: { commune: "Commune livrée", zone: "Zone de livraison", zoneADefinir: "Zone de livraison à définir" },
        chargement: "La carte s’allume…",
        echec: "La carte ne peut pas s’afficher sur cet appareil : toutes les communes livrées figurent dans la liste.",
        economie: "Économiseur de données activé : la carte n’est pas chargée.",
        afficher: "Afficher la carte",
        recentrer: "Revoir toutes les communes livrées",
        /** Messages de la carte (MapLibre). « Map.Title » est son nom pour les lecteurs d'écran. */
        locale: {
          "Map.Title": "Carte des communes livrées autour de Béziers",
          "NavigationControl.ZoomIn": "Zoomer",
          "NavigationControl.ZoomOut": "Dézoomer",
          "NavigationControl.ResetBearing": "Remettre le nord en haut",
          "AttributionControl.ToggleAttribution": "Afficher ou masquer les crédits de la carte",
          "AttributionControl.MapFeedback": "Signaler une erreur sur la carte",
          "CooperativeGesturesHandler.WindowsHelpText": "Ctrl + molette pour zoomer sur la carte",
          "CooperativeGesturesHandler.MacHelpText": "⌘ + molette pour zoomer sur la carte",
          "CooperativeGesturesHandler.MobileHelpText": "Deux doigts pour déplacer la carte",
        },
      },
    },

    // La salle et la terrasse
    salle: {
      surtitre: "La salle et la terrasse",
      /** Une ligne par segment (coupures maîtrisées). {salle} et {terrasse} viennent de `couverts` (plus haut). */
      titre: ["{salle} couverts sous la fresque,", "{terrasse} sous les platanes."],
      intro: "Une salle aux murs peints de Béziers et de vignes, une terrasse ouverte sur les Allées Paul-⁠Riquet.",
      lieux: { salle: "La salle", terrasse: "La terrasse" } satisfies Record<Photo["lieu"], string>,
      /**
       * Les photos défilent en continu (promenade) ; on peut les arrêter en les survolant, en leur
       * donnant le focus, ou en les glissant à la main. Pas de bouton pause visible (choix de Julien) :
       * WCAG 2.2.2 reste satisfait par le survol/focus, seule échappatoire pour le clavier et la souris.
       */
      galerie: { aria: "Photos de la salle et de la terrasse, qui défilent" },
      /** Complément lu après la légende : « Le coin des vignes, agrandir la photo ». */
      agrandir: "agrandir la photo",
      visionneuse: { precedente: "Photo précédente", suivante: "Photo suivante", photo: "photo", sur: "sur" },
      /** Témoignages de site.avisGoogle, qui défilent sous la galerie (voir salle/AvisGoogle.tsx). */
      avisGoogle: {
        aria: "Avis de nos clients sur Google, qui défilent",
        /** {n} est remplacé par le nombre d'avis. */
        lien: "Voir les {n} avis sur Google",
        /** Affiché après le prénom, dans chaque témoignage. */
        origine: "· avis Google",
      },
    },

    // Infos pratiques
    infos: {
      surtitre: "Infos pratiques",
      titre: "Venir à la Pizzeria des Allées",
      adresse: {
        titre: "Adresse",
        titreCarte: "Carte Google Maps du {rue}",
        carteAfficher: "Afficher la carte interactive",
        carteMasquer: "Revenir au plan illustré",
        avertissement: "La carte est fournie par Google, qui peut déposer des cookies.",
      },
      /** Libellés du plan illustré des Allées (`pizzeria` : libellé court, la place est comptée). */
      plan: { theatre: "Théâtre", plateau: "Plateau des Poètes", statue: "Riquet", pizzeria: "La Pizzeria" },
      horaires: {
        titre: "Horaires",
        enAttente: "Les horaires de la réouverture seront affichés ici dès qu’ils seront validés.",
        voirExemple: "Voir l’exemple de mise en page (à valider)",
        ouvert: "Ouvert · jusqu’à {heure}",
        ferme: "Fermé",
        /** {quand} = « » (aujourd'hui), « demain » ou le jour. */
        fermeRallume: "Fermé · on rallume {quand} à {heure}",
        demain: "demain",
        aujourdhui: "(aujourd’hui)",
      },
      contact: {
        titre: "Contact",
        telephone: "Téléphone",
        email: "E-mail",
        paiements: "Paiements acceptés",
      },
    },

    // FAQ (juste avant le pied de page)
    faq: {
      surtitre: "FAQ",
      titre: "Vous vous demandez peut-être…",
      /** {communes} et {couverts.salle}/{couverts.terrasse} sont remplacés à l'affichage (voir Faq.tsx). */
      items: [
        {
          question: "Livrez-vous chez moi ?",
          reponse: "Oui, si vous êtes à {communes}. Le détail de la zone est juste au-dessus, dans la section Livraison.",
        },
        {
          question: "Peut-on payer par carte ou en titres-restaurant ?",
          reponse: "Oui, nous acceptons la carte bancaire, les titres-restaurant et les espèces.",
        },
        {
          question: "Comment réserver une table ?",
          reponse: "En un clic sur « Réserver une table » : une fenêtre s’ouvre avec notre outil de réservation en ligne, pour choisir votre date et votre heure.",
        },
        {
          question: "Peut-on commander à emporter ou en livraison ?",
          reponse: "Oui, directement en ligne avec le bouton « Commander » : choisissez à emporter ou en livraison, selon votre commune.",
        },
        {
          question: "Quels sont vos horaires ?",
          reponse: "Ils sont annoncés dans la rubrique Infos pratiques, juste en dessous, et mis à jour dès leur confirmation.",
        },
        {
          question: "Quelle est la capacité de la salle et de la terrasse ?",
          reponse: "{salle} couverts en salle, sous la fresque, et {terrasse} sur la terrasse, sous les platanes.",
        },
      ],
    },

    // Pied de page
    footer: {
      signature: "À bientôt sous les platanes.",
      titreNavigation: "Sur la page",
      titreCoordonnees: "Nous trouver",
      horaires: "Horaires :",
      titreReseaux: "Nous suivre",
      mentionsLegales: "Mentions légales",
      confidentialite: "Confidentialité",
      hautDePage: "Haut de page",
      /** Affiché tant que `photos.provisoires` est vrai. */
      visuelsProvisoires: "Visuels provisoires : photos de la salle retouchées et pizzas générées par IA, en attendant le shooting de la réouverture.",
      credit: "Site réalisé par",
      /** Résumé des jours d'ouverture, composé à partir de `horaires.semaine`. */
      resumeHoraires: {
        toujoursFerme: "fermé",
        tousLesJours: "7 jours sur 7",
        plage: "du {debut} au {fin}",
        fermeUnJour: "fermé le {jour}",
        fermePlusieursJours: "fermé {jours}",
        et: "et",
      },
    },

    // Page 404
    introuvable: {
      titreOnglet: "Page introuvable",
      description: "Cette page n’existe pas ou a changé d’adresse. Retrouvez {nom} depuis l’accueil.",
      surtitre: "Page introuvable",
      /** Titre : début + mot qui s'allume au survol du bouton + fin. */
      titreDebut: "Cette allée est",
      titreMot: "éteinte",
      titreFin: ".",
      texte: "La page que vous cherchez n’existe pas ou a changé d’adresse. Rallumez la lumière : le four, lui, est toujours chaud.",
      bouton: "Revenir à l’accueil",
    },

    // Pages légales (le texte juridique lui-même est dans src/app/mentions-legales et src/app/confidentialite)
    pagesLegales: {
      miseAJour: "Dernière mise à jour :",
      retour: "Revenir à l’accueil",
      mentions: {
        titre: "Mentions légales",
        surtitre: "Informations légales",
        description: "Éditeur, hébergeur et informations légales du site de {nom}, {adresse}.",
        chapo: "Conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l’économie numérique, voici qui édite et qui héberge ce site.",
        avertissement: {
          titre: "Document provisoire",
          texte: "Les informations en pointillés restent à fournir. L’ensemble de cette page est à relire et à valider par l’exploitant avant la mise en ligne.",
        },
      },
      confidentialite: {
        titre: "Politique de confidentialité",
        surtitre: "Vos données",
        description: "Données personnelles et cookies sur le site de {nom} : aucun cookie de suivi, aucun compte, et le détail de chaque service tiers.",
        chapo: "En bref : ce site ne dépose aucun cookie de suivi, ne vous demande de créer aucun compte et ne collecte lui-même aucune donnée vous concernant. Le fond de carte de la section Livraison vient d’OpenFreeMap, sans cookie. Les autres services (réservation, commande, carte Google) ne reçoivent des informations que si vous choisissez de les ouvrir.",
        avertissement: {
          titre: "Projet à valider",
          texte: "Cette politique est un projet rédigé avec le site. Elle doit être relue et validée par l’exploitant avant la mise en ligne.",
        },
      },
    },
  },

  /* ------------------------------------------------------------------------
   * Pizzas mises en avant (exemples à valider avec le pizzaïolo)
   * La carte complète n'est PAS dupliquée ici : elle vit dans Obypay.
   * --------------------------------------------------------------------- */
  // À VALIDER : noms, garnitures et pastilles des 6 pizzas
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
      description: "Tomate, mozzarella, saucisse d’agneau épicée, poivrons grillés, oignons rouges",
      base: "tomate",
      image: "/images/pizzas/lou-camel.webp",
      pimentee: true,
    },
    {
      id: "plateau-des-poetes",
      nom: "Plateau des Poètes",
      description: "Tomate, mozzarella, légumes grillés du marché, roquette, brebis, huile d’olive",
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
        alt: "La salle principale : tables en chêne clair sous une grande fresque de Béziers, avec la cathédrale Saint-Nazaire et le Pont Vieux",
        legende: "La fresque du Pont Vieux",
        lieu: "salle",
        cadrage: "50% 80%",
      },
      {
        src: "/images/salle/salle-vignes.jpg",
        alt: "Le coin des vignes : une fresque de vignoble, un cadre végétal en chêne et des tables dressées",
        legende: "Le coin des vignes",
        lieu: "salle",
        cadrage: "35% 85%",
      },
      {
        src: "/images/salle/salle-cadres-vegetaux.jpg",
        alt: "Deux cadres végétaux en chêne clair au-dessus de tables pour deux, sous des ampoules à filament",
        legende: "Les murs de mousse",
        lieu: "salle",
        cadrage: "56% 82%",
      },
      {
        src: "/images/salle/facade-nuit.jpg",
        alt: "La devanture de la pizzeria le soir, enseigne bleu nuit et or, et les tables de la terrasse sur les Allées",
        legende: "La terrasse, le soir",
        lieu: "terrasse",
        cadrage: "50% 100%",
      },
    ] satisfies Photo[],
    /** Les deux photos de la salle accrochées au mur de « Notre histoire » : chemins de deux photos de la galerie ci-dessus. */
    histoire: {
      grande: "/images/salle/salle-cadres-vegetaux.jpg",
      petite: "/images/salle/salle-vignes.jpg",
    },
    /**
     * Dessin au trait des Allées Paul-Riquet, en fond de la section « La salle » : il se trace
     * à l'écran (`anime`) ; `fixe` est le même dessin, déjà tracé (animations réduites, sans JavaScript).
     * Redessiné par IA d'après une photo des Allées fournie pour la maquette.
     */
    dessinAllees: { anime: "/images/salle/allees-dessin.svg", fixe: "/images/salle/allees-dessin-fixe.svg" }, // À VALIDER : droits de la photo d'origine
    /** Visuels générés par IA ou retouchés : mention « visuels provisoires » affichée en pied de page. */
    provisoires: true,
  },

  /* ------------------------------------------------------------------------
   * Avis Google, relevés sur la fiche que Julien garde (liens.avisGoogle).
   * Relevé le 26/09/2026 : à actualiser de temps en temps (note, nombre
   * d'avis, et pourquoi pas en changer quelques-uns).
   * --------------------------------------------------------------------- */
  avisGoogle: {
    note: 4.6,
    nombreAvis: 2137,
    /** Quatre à six extraits, positifs et courts, avec le prénom et l'initiale tels qu'affichés sur Google. */
    temoignages: [
      { auteur: "Rais R.", note: 5, texte: "Bah ils frôlent la perfection." },
      {
        auteur: "Delphine G.",
        note: 5,
        texte: "Une très belle découverte, des pizzas à la pâte fine et croustillante, un service très sympa. Je recommande vraiment !",
      },
      {
        auteur: "Sandrine",
        note: 5,
        texte: "Les pizzas et salades sont très bonnes et copieuses. L’équipe est très sympa, le service rapide.",
      },
      { auteur: "Martine V.", note: 5, texte: "Personnel adorable, très bon accueil, service rapide, avec le sourire." },
      {
        auteur: "Adrien V.",
        note: 4,
        texte: "Très bonnes pizzas, rien à redire sur la qualité et le goût : le point fort de l’adresse !",
      },
    ] satisfies { auteur: string; note: number; texte: string }[],
  },

  /* ------------------------------------------------------------------------
   * Hero : fresque animée (vidéo en boucle) et ligne d'horizon détourée
   * ⚠ Droits : la fresque est reproduite et animée. Faire confirmer par écrit
   * l'autorisation de son auteur (voir legal.credits.fresque).
   * --------------------------------------------------------------------- */
  hero: {
    videoMp4: "/video/fresque-hero.mp4",
    videoWebm: "/video/fresque-hero.webm",
    poster: "/images/hero/fresque-poster.jpg",
    horizon: "/images/hero/fresque-horizon.webp",
    alt: "La fresque de la salle : la cathédrale Saint-Nazaire sur sa colline, le Pont Vieux et l’Orb, animés comme un matin d’été",
  },

  /* ------------------------------------------------------------------------
   * SEO local
   * --------------------------------------------------------------------- */
  seo: {
    titre: "La Pizzeria des Allées · Pizzeria artisanale à Béziers",
    /** 155 caractères au plus (au-delà, Google coupe), avec « pizzeria » et « Béziers ». */
    description:
      "Pizzeria artisanale à Béziers, 43 Allées Paul Riquet : pâte maison, produits du Biterrois, grande terrasse. Sur place, à emporter ou en livraison.", // À VALIDER
    /** Complément du grand titre, lu par les lecteurs d'écran et les moteurs (invisible à l'écran). */
    complementTitre: ", pizzeria à Béziers",
    motsCles: [
      "pizzeria Béziers",
      "pizza Béziers",
      "pizzeria Allées Paul Riquet",
      "livraison pizza Béziers",
      "pizza à emporter Béziers",
      "restaurant terrasse Béziers",
    ],
    fourchettePrix: "€€", // À VALIDER
    cuisines: ["Pizza", "Cuisine méditerranéenne"],
    /** Image des partages (réseaux sociaux, messageries) : 1200 × 630, dans /public/images/partage/. */
    image: {
      src: "/images/partage/la-pizzeria-des-allees.jpg",
      largeur: 1200,
      hauteur: 630,
      alt: "La Pizzeria des Allées, pizzeria artisanale au 43 Allées Paul Riquet à Béziers : la fresque de la cathédrale Saint-Nazaire et du Pont Vieux, une pizza et le logo bleu nuit et or",
    },
    /** Date de la dernière mise à jour du contenu de l'accueil (plan du site), au format AAAA-MM-JJ. */
    derniereMiseAJour: "2026-09-26",
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
    /** Date des pages légales (« Dernière mise à jour » et plan du site), au format AAAA-MM-JJ. */
    miseAJour: "2026-09-25",
    /** Vérifié le 25/09/2026 sur vercel.com/legal (adresse) et vercel.com/legal/dmca-policy (téléphone). */
    hebergeur: {
      nom: "Vercel Inc.",
      adresse: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
      telephone: "+1 559 288 7060",
      site: "https://vercel.com",
    },
    /** Obligatoire pour la vente en ligne aux particuliers (click & collect, livraison) : article L.612-1 du Code de la consommation. */
    mediateur: {
      nom: "[MÉDIATEUR À DÉSIGNER]",
      site: "[LIEN À VENIR]",
    },
    /** Politiques de confidentialité des services tiers (vérifiées le 25/09/2026). */
    politiques: {
      thefork: "https://www.thefork.fr/legal",
      obypay: "https://obypay.com/declaration-de-confidentialite-ue/",
      google: "https://policies.google.com/privacy?hl=fr",
      openFreeMap: "https://openfreemap.org/privacy/",
      vercel: "https://vercel.com/legal/privacy-notice",
    },
    cnilPlainte: "https://www.cnil.fr/fr/plaintes",
    /** Durées de conservation annoncées dans la politique de confidentialité. */
    conservation: {
      contact: "3 ans à compter de notre dernier échange", // À VALIDER
      // Journaux d'exécution Vercel : 1 h (offre Hobby), 1 jour (Pro), 30 jours (Observability Plus). À ajuster selon l'offre.
      journaux: "1 jour au plus",
    },
    credits: {
      /** ⚠ Autorisation écrite de l'auteur à obtenir (reproduction de la fresque ET version animée du hero). */
      fresque: { libelle: "Fresque de la salle", texte: "[AUTEUR DE LA FRESQUE À CRÉDITER], reproduite avec autorisation [À CONFIRMER]" },
      /** Texte affiché tant que `photos.provisoires` est vrai ; ensuite, `photographe`. */
      visuelsProvisoires:
        "les visuels présentés sont provisoires. Certains ont été générés ou retouchés numériquement à partir de la salle et de sa fresque, en attendant le reportage photo prévu à la réouverture. Ils seront remplacés et leurs auteurs crédités ici.",
      photographe: "[À CONFIRMER]",
      polices: "Besley et Figtree, sous licence SIL Open Font License, hébergées avec le site.",
      pictogrammes: "Lucide, sous licence ISC.",
      carte: "fond OpenFreeMap, © OpenMapTiles, données © contributeurs OpenStreetMap (licence ODbL).",
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
