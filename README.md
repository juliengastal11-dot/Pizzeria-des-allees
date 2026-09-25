# La Pizzeria des Allées — site vitrine

Site vitrine de la pizzeria du 43 Allées Paul Riquet, Béziers.
Next.js 16 (App Router) · Tailwind CSS 4 · Motion 13 · Lenis · déploiement Vercel.

Le site ne gère ni commande, ni paiement, ni réservation : il renvoie vers les outils du restaurant
(Obypay pour la commande et la livraison, TheFork pour la réservation).

## Démarrer

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # vérifie que tout compile avant de pousser
```

## Tout se modifie dans un seul fichier : `src/config/site.ts`

Nom, logo, adresse, téléphone, horaires, liens Obypay / TheFork / réseaux sociaux, textes de chaque
section, pizzas mises en avant, photos de la galerie, informations légales.

- **Placeholders** : toute valeur encore inconnue s'écrit entre crochets (`"[À CONFIRMER]"`). Le site
  l'affiche en pointillés et désactive le lien correspondant. Pour lister ce qui reste à remplir,
  rechercher `[` dans `site.ts`.
- **Horaires** : renseigner `horaires.semaine`, puis passer `horaires.aConfirmer` à `false` : le badge
  « Ouvert / Fermé » et les horaires schema.org (Google) s'activent tout seuls.
- **Lien de commande** : remplacer `liens.commander` par l'URL Obypay. Tous les boutons « Commander »
  s'ouvrent alors dans un nouvel onglet (au lieu de la fenêtre « bientôt disponible »).
- **Domaine** : renseigner `urlSite` (ex. `https://www.lapizzeriadesallees.fr`). Tant que c'est un
  placeholder, le site demande aux moteurs de recherche de **ne pas l'indexer** (brouillon).
- **Fidélité** : `fidelite.actif = true` et `fidelite.url` quand l'outil est choisi.

## Remplacer une photo ou une image

Les images de `public/images` et `public/video` sont mises en cache un an par les navigateurs.
**Donner un nouveau nom au fichier** (ex. `salle-fresque-beziers-2027.jpg`) puis mettre à jour le
chemin dans `site.ts`, sinon l'ancienne version peut rester affichée.

- Photos de la salle : JPEG ~1500 px de large dans `public/images/salle/` (next/image produit l'AVIF/WebP).
- Pizzas : PNG ou WebP **détourés en disque** (fond transparent), carrés, 800 px, dans `public/images/pizzas/`.
- Hero : la vidéo (`public/video/fresque-hero.mp4|webm`), son poster et la ligne d'horizon détourée
  (`public/images/hero/`) doivent provenir **de la même vidéo, au même cadrage 3:4**, sinon le titre
  ne passera plus derrière la cathédrale au bon endroit. Réglages du titre : `src/components/sections/hero/geometrie.ts`.

## Direction artistique

Voir `docs/direction-artistique.md` : couleurs (avec contrastes), typographies (Besley, Figtree),
formes (arches du Pont Vieux, ovales de Fonseranes, ligne de l'Orb), règles d'animation,
d'accessibilité et de performance. Aucune référence à l'ancienne franchise ne doit réapparaître.

## Vie privée

Aucun cookie de suivi. Les polices sont auto-hébergées. Google Maps et le module TheFork ne se chargent
qu'à l'action du visiteur. Si des statistiques sont ajoutées un jour : bandeau de consentement et mise
à jour de `/confidentialite`.

## Déploiement

Chaque `git push` sur `main` déclenche un déploiement Vercel (production). Les autres branches
donnent une URL de prévisualisation.
