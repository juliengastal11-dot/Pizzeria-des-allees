/*
 * Les animations que le relecteur peut garder ou supprimer. Chacune est posée
 * dans le code par `data-animation="<id>"` sur l'élément qui la porte ; les
 * micro-effets de survol (boutons qui grossissent, flèches) n'y figurent pas.
 */
export type FicheAnimation = { nom: string; court: string; description: string };

export const ANIMATIONS: Record<string, FicheAnimation> = {
  // Haut de page
  "paysage-hero": {
    nom: "La devanture qui se pose",
    court: "Devanture qui se pose",
    description: "À l’arrivée, la photo de la devanture se pose en douceur ; en descendant, elle grossit légèrement.",
  },
  "video-hero": {
    nom: "La devanture qui s’anime",
    court: "Devanture animée",
    description: "En boucle : les convives mangent et trinquent en terrasse, le pizzaiolo enfourne au fond, les bougies et le feu du four vacillent.",
  },
  "pont-lumieres": {
    nom: "Les lumières du Pont Vieux",
    court: "Lumières du pont",
    description: "Les lumières courent jusqu’à l’arche Commander, puis celles de droite s’allument une à une en descendant.",
  },
  "lueur-boutons": {
    nom: "La lumière autour des boutons Commander et Réserver",
    court: "Lumière des boutons",
    description: "Une petite lumière fait le tour des boutons et allume de petites étoiles au passage.",
  },
  "barre-mobile": {
    nom: "La barre du bas sur téléphone",
    court: "Barre du bas",
    description: "Sur téléphone, la barre Commander / Réserver monte du bas quand on descend, et ses boutons s’illuminent peu à peu.",
  },
  "titre-section": {
    nom: "Les titres de section qui se lèvent",
    court: "Titres qui se lèvent",
    description: "Les grands titres sortent ligne par ligne de derrière un cache, comme un rideau qui se lève.",
  },

  // Notre histoire
  ampoules: {
    nom: "Les ampoules du plafond",
    court: "Ampoules",
    description: "Les ampoules s’allument une à une en se balançant, la pièce se réchauffe, puis elles scintillent de temps en temps.",
  },
  manifeste: {
    nom: "Le texte qui s’allume mot à mot",
    court: "Texte mot à mot",
    description: "En descendant, le texte s’allume mot à mot (Béziers, allées, platanes en or), avec un filet doré qui descend à côté.",
  },

  // La carte
  "ciel-carte": {
    nom: "Le ciel de la carte",
    court: "Nuages et martinets",
    description: "Les nuages et les martinets glissent à des vitesses différentes quand on descend.",
  },
  "pizzas-entree": {
    nom: "Les pizzas qui arrivent",
    court: "Pizzas qui arrivent",
    description: "Les cartes des pizzas montent en place l’une après l’autre.",
  },
  "pizza-roule": {
    nom: "La pizza qui roule (téléphone et tablette)",
    court: "Pizza qui roule",
    description: "Sur téléphone et tablette, chaque pizza roule et grossit en passant au centre du carrousel.",
  },
  "pizza-survol": {
    nom: "La pizza qui tourne au survol (ordinateur)",
    court: "Pizza au survol",
    description: "Sur ordinateur, au passage de la souris, la pizza tourne, se soulève et son ombre rétrécit.",
  },
  "badge-du-moment": {
    nom: "Le tampon « Du moment »",
    court: "Tampon « Du moment »",
    description: "La pastille « Du moment » se pose en tournant, comme un coup de tampon.",
  },

  // Livraison
  "onglets-livraison": {
    nom: "Les onglets Livraison / Click and collect",
    court: "Onglets qui glissent",
    description: "La pastille claire glisse d’un onglet à l’autre et le contenu arrive en glissant sur le côté.",
  },
  "carte-nuit": {
    nom: "La carte de nuit des communes",
    court: "Carte de nuit",
    description: "Les communes s’allument en cascade depuis la pizzeria ; quand on en choisit une, la carte glisse jusqu’à elle en pointillés lumineux.",
  },
  ecluses: {
    nom: "Les trois étapes « à emporter »",
    court: "Étapes en écluses",
    description: "Les trois étapes montent l’une après l’autre et se remplissent comme des écluses.",
  },

  // La salle
  "dessin-allees": {
    nom: "Le dessin des Allées qui se trace",
    court: "Dessin des Allées",
    description: "En fond, les Allées Paul-Riquet se dessinent au trait sous nos yeux.",
  },
  "galerie-defile": {
    nom: "Les photos qui défilent",
    court: "Photos qui défilent",
    description: "Les photos en arches défilent en continu ; on peut les pousser à la main et elles s’arrêtent sous la souris.",
  },
  "avis-defilent": {
    nom: "Les avis Google qui défilent",
    court: "Avis qui défilent",
    description: "Les avis défilent en continu dans l’autre sens et s’arrêtent sous la souris.",
  },

  // Infos pratiques, FAQ, pied de page, pages légales
  "entree-cartes": {
    nom: "Les cartes qui remontent en place",
    court: "Cartes qui remontent",
    description: "Les cartes (adresse, horaires, contact, questions de la FAQ) remontent à leur place en s’éclaircissant.",
  },
  "video-infos": {
    nom: "Les Allées au soleil couchant, en fond",
    court: "Vidéo des Allées",
    description: "Derrière « Venir à la Pizzeria des Allées », les Allées au soleil couchant tournent en boucle sous un voile sombre.",
  },
  "pont-pied-de-page": {
    nom: "Le pont du pied de page",
    court: "Pont du pied de page",
    description: "Les réverbères du Pont Vieux s’allument un à un en haut du pied de page.",
  },
  "ornement-pont": {
    nom: "Le dessin des pages légales",
    court: "Dessin qui se trace",
    description: "L’arche, la cathédrale, le pont et l’Orb se dessinent au trait, puis étoiles, lune et réverbères s’allument.",
  },

  // Fenêtres Commander et Réserver
  "ornement-fenetres": {
    nom: "Le dessin de Béziers dans les fenêtres Commander et Réserver",
    court: "Dessin des fenêtres",
    description:
      "À l’ouverture de la fenêtre Commander, et pendant que la réservation se charge, le même dessin que les pages légales se trace : l’arche, la cathédrale, le pont et l’Orb, puis la lune et les réverbères.",
  },
};
