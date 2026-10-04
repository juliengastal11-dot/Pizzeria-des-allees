# La Pizzeria des Allées

Site vitrine d'une page pour la pizzeria du 43 Allées Paul Riquet, à Béziers, construit avec [Astro](https://astro.build) : du HTML statique, le style de chaque section dans son composant et cinq petits scripts, sans framework chargé dans le navigateur.

Le style suit le DESIGN.md d'ElevenLabs (obtenu avec `npx getdesign@latest add elevenlabs`, qui le pose à la racine ; il n'est pas gardé dans ce dépôt) : fond blanc cassé, encre presque noire, titres en serif léger, boutons en pilule, cartes de 16 px et grandes taches de dégradé pastel. La police des titres du DESIGN.md (Waldenburg) étant sous licence, c'est Newsreader Light qui la remplace ; Inter sert pour le texte.

## Lancer le site

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # le site prêt à publier, dans dist/
npm run preview   # sert dist/ pour vérifier la version construite
npm run check     # vérifie les types
```

## Où modifier quoi

- **Les informations** : tout est dans `src/config/site.ts` (horaires, téléphone, e-mail, liens Obypay et TheFork, communes livrées, pizzas, mentions légales). Une valeur vide s'affiche « à confirmer » et n'est pas transmise à Google.
- **Les textes** : dans chaque section, `src/components/*.astro` (Hero, Maison, Carte, Actions pour Réserver/Commander/Venir, Footer).
- **Les images** : `src/assets/images/`, converties en AVIF et WebP à la construction. La photo d'une pizza s'appelle `src/assets/images/pizzas/<id>.webp`, avec l'`id` donné dans `site.pizzas`.
- **Couleurs, rayons, boutons, pastilles** : `src/styles/global.css`, dont les jetons reprennent ceux du DESIGN.md (`--color-*`, `--radius-*`, `--space-*`). Les polices sont téléchargées à la construction et servies par le site lui-même (aucune requête vers Google Fonts chez le visiteur).

## Ce qui bouge

- `src/scripts/animations.ts` : l'entrée du haut de page (les éléments arrivent l'un après l'autre) et les apparitions au défilement. Rien ne bouge quand le visiteur a demandé des animations réduites, et sans JavaScript tout s'affiche directement.
- `src/scripts/interface.ts` : l'en-tête qui devient plein au défilement, la barre d'actions du téléphone, le menu, les mentions légales, le jour courant dans les horaires.
- `src/scripts/carte.ts` : le filtre par base, la pizza choisie, le carrousel du téléphone où les pizzas roulent en défilant.
- `src/scripts/reservation.ts` : le module TheFork ne se charge qu'à la demande, donc aucun cookie tiers avant.
- `src/scripts/devanture.ts` : la devanture en boucle (convives, pizzaiolo) posée sur la photo du haut. Elle se télécharge après la page, démarre après l'entrée animée, jamais en économie de données, sur réseau lent ou en animations réduites, et se met en pause hors de l'écran. Fichiers dans `public/video/` (version 720p pour les téléphones). Son arrière-plan est figé : ne pas poser de filtre ni de zoom animé sur son cadre.

## Présentation au client

Ajouter `?a-valider` à l'adresse (ou passer `annoter: true` dans `site.ts`) affiche les encadrés en pointillés qui signalent ce qui reste à valider.

## Mise en ligne

Chaque push sur `main` redéploie le site sur Vercel. `vercel.json` impose le préréglage Astro, le projet ayant été importé à l'origine en Next.js. Avant la vraie mise en ligne :

- `indexable: true` et le domaine définitif dans `src/config/site.ts` et `astro.config.mjs` ;
- l'équipe Vercel en offre Pro (l'offre Hobby est réservée aux usages non commerciaux) ;
- les fiches TheFork et Google renommées : elles portent encore l'ancien nom.

## Les versions précédentes

Le site Next.js d'origine se retrouve dans le tag git `ancien-site-nextjs` (commit `c69c0df`) et en copie dans le dossier `Ancien site (Next.js, 27-09-2026)` à côté de ce projet. La version sombre « maquette Claude Design » en Astro, avec ses dernières corrections, est dans `Version Claude Design (Astro, 04-10-2026)`. Le dossier `ressources/` garde la fresque animée, sans la publier.
