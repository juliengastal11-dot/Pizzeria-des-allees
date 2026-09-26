# La Pizzeria des Allées — site vitrine

Site vitrine de la pizzeria du 43 Allées Paul Riquet, Béziers.
Next.js 16 (App Router) · Tailwind CSS 4 · Motion 13 · Lenis · MapLibre GL (carte de livraison) · déploiement Vercel.

Le site ne gère ni commande, ni paiement, ni réservation : il renvoie vers les outils du restaurant
(Obypay pour la commande et la livraison, TheFork pour la réservation).

## Démarrer

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # vérifie que tout compile avant de pousser
```

## Tout se modifie dans un seul fichier : `src/config/site.ts`

Nom, logo, adresse, téléphone, horaires, liens, photos, pizzas mises en avant, **tous les textes du site**,
SEO et informations légales. Le fichier est rangé par blocs commentés :

| Clé | Contenu |
|---|---|
| `nom`, `nomCourt`, `nomLignes`, `logo`, `urlSite` | Identité, domaine |
| `adresse` (dont `region` et `geo`), `telephone`, `email` | Coordonnées ; `adresse.geo` = position du restaurant (Google et carte de livraison) |
| `horaires` | Semaine type, `aConfirmer`, mention affichée tant qu'ils ne sont pas validés |
| `paiements`, `couverts` | Moyens de paiement ; capacité (reprise dans le titre de la Salle) |
| `liens` | Obypay, TheFork, itinéraire, carte (données Google), carte intégrée |
| `reseaux`, `fidelite` | Réseaux sociaux ; bandeau fidélité (masqué) |
| `livraison` | Communes livrées, minimum, frais, délai ; `zoneDefinie` (contour de la zone sur la carte) |
| `navigation` | Libellés du menu, bouton Menu, lien d'évitement |
| `textes.actions` | Boutons Commander / Réserver et leurs fenêtres |
| `textes.hero`, `textes.histoire`, `textes.carte`, `textes.livraison`, `textes.salle`, `textes.infos`, `textes.footer` | Textes de chaque section, jusqu'aux libellés lus par les lecteurs d'écran |
| `textes.introuvable`, `textes.pagesLegales` | Page 404, titres et avertissements des pages légales |
| `pizzas`, `photos` (dont `photos.histoire` et `photos.dessinAllees`), `hero` | Contenus visuels |
| `seo` | Titre, description (155 caractères au plus), image de partage, date de mise à jour |
| `legal` | Société, hébergeur, médiateur, politiques des services tiers, durées de conservation, crédits |

- **Placeholders** : toute valeur encore inconnue s'écrit entre crochets (`"[À CONFIRMER]"`). Le site
  l'affiche en pointillés et désactive le lien correspondant. Pour lister ce qui reste à remplir,
  rechercher `[` dans `site.ts`. Les commentaires `// À VALIDER` et `// ⚠` signalent ce que le restaurant
  doit confirmer.
- **Typographie** : espace insécable ` ` avant `: ; ! ?`, apostrophe `’`. Un `{mot}` dans un texte est
  remplacé par le site (ex. `{commune}`, `{salle}`).
- **Horaires** : renseigner `horaires.semaine`, puis passer `horaires.aConfirmer` à `false` : le badge
  « Ouvert / Fermé » et les horaires schema.org (Google) s'activent tout seuls.
- **Lien de commande** : remplacer `liens.commander` par l'URL Obypay. Tous les boutons « Commander »
  s'ouvrent alors dans un nouvel onglet (au lieu de la fenêtre « bientôt disponible »).
- **Domaine** : renseigner `urlSite` (ex. `https://www.lapizzeriadesallees.fr`). Tant que c'est un
  placeholder (ou sur une prévisualisation Vercel), le site demande aux moteurs de recherche de **ne pas
  l'indexer** (brouillon : `robots.txt` et balise `robots`).
- **Fidélité** : `fidelite.actif = true` et `fidelite.url` quand l'outil est choisi.
- **Zone de livraison** : tant que `livraison.zoneDefinie` vaut `false`, la carte ne trace aucun contour et
  la légende affiche « Zone de livraison à définir » en pointillés. Passer à `true` quand la zone est
  arrêtée : la carte trace alors un contour arrondi autour des communes livrées.
- **Nom de la pizzeria** : on parle toujours de « la Pizzeria des Allées » (ou « la pizzeria » quand la
  place manque), jamais du « 43 ». Le numéro n'apparaît que dans l'adresse.
- **Dates** : `seo.derniereMiseAJour` (accueil) et `legal.miseAJour` (pages légales) alimentent le plan du
  site et la mention « Dernière mise à jour ». Les changer quand le contenu change.

## Carte de livraison

- Fond de carte : tuiles vectorielles **OpenFreeMap** (gratuites, sans clé, sans cookie), style de nuit
  `public/map/style-nuit.json` (couleurs du site, noms de rues à partir du zoom 13).
- **Ajouter une commune** : l'ajouter à `livraison.communes` dans `site.ts`, **puis** ses coordonnées
  (longitude, latitude, côté de l'étiquette) dans `src/components/sections/livraison/geographie.ts`.
  Sans coordonnées, elle reste dans la liste mais n'a pas de point sur la carte.
- La position du restaurant est `adresse.geo` dans `site.ts` ; son étiquette sur la carte reprend `nomLignes`.
- Le code de la carte (MapLibre) est dans `src/components/sections/livraison/moteurCarte.ts` ; il n'est
  téléchargé qu'à l'approche de la section. Au premier `npm run build`, vérifier que la carte s'affiche et
  que la console ne montre pas « Worker failed to load ».

## Remplacer une photo ou une image

Les images de `public/images` et `public/video` sont mises en cache un an par les navigateurs.
**Donner un nouveau nom au fichier** (ex. `salle-fresque-beziers-2027.jpg`) puis mettre à jour le
chemin dans `site.ts`, sinon l'ancienne version peut rester affichée.

- Photos de la salle : JPEG ~1500 px de large dans `public/images/salle/` (next/image produit l'AVIF/WebP).
  `cadrage` règle le point gardé dans les arches (les photos y sont zoomées autour de ce point).
  Les onglets de la galerie sont « La salle » et « La terrasse » (`lieu` de chaque photo).
- Dessin des Allées (fond de la section « La salle ») : deux SVG dans `public/images/salle/`,
  `allees-dessin.svg` (les traits se dessinent en ~4 s, animation interne au fichier) et
  `allees-dessin-fixe.svg` (le même, déjà tracé). Ce sont des traits vectoriels tirés d'un dessin au trait :
  pour en changer, produire les deux fichiers ensemble et garder le même rapport 1536 × 1020.
- Pizzas : PNG ou WebP **détourés en disque** (fond transparent), carrés, 800 px, dans `public/images/pizzas/`.
- Image de partage (réseaux sociaux) : JPEG 1200 × 630 dans `public/images/partage/`, décrite par `seo.image`.
- Hero : la vidéo (`public/video/fresque-hero.mp4|webm`), son poster et la ligne d'horizon détourée
  (`public/images/hero/`) doivent provenir **de la même vidéo, au même cadrage 3:4**, sinon le titre
  ne passera plus derrière la cathédrale au bon endroit. Réglages du titre et du pont :
  `src/components/sections/hero/geometrie.ts`.

## Direction artistique

Voir `docs/direction-artistique.md` : couleurs (avec contrastes), typographies (Besley, Figtree),
formes (arches du Pont Vieux, ovales de Fonseranes, ligne de l'Orb), règles d'animation,
d'accessibilité et de performance. Aucune référence à l'ancienne franchise ne doit réapparaître.

## Vie privée

Aucun cookie de suivi. Les polices sont auto-hébergées. Google Maps (carte des Infos) et le module TheFork
ne se chargent qu'à l'action du visiteur. Le fond de carte OpenFreeMap de la section Livraison se charge à
l'approche de la section, sans cookie (l'adresse IP est transmise au serveur de tuiles : c'est indiqué dans
`/confidentialite`). Si des statistiques sont ajoutées un jour : bandeau de consentement et mise à jour de
`/confidentialite`.

## Avant la mise en ligne

- ⚠ **Renommer la fiche TheFork** (encore « Basilic & Co Béziers ») dans TheFork Manager, puis ouvrir la
  fenêtre « Réserver une table » pour vérifier qu'il ne reste aucune mention de l'ancienne enseigne.
- ⚠ Obtenir l'**autorisation écrite de l'auteur de la fresque** (photo et version animée) et le créditer
  (`legal.credits.fresque`).
- Désigner un **médiateur de la consommation** (`legal.mediateur`), obligatoire pour la vente en ligne.
- Remplir les placeholders (`[` dans `site.ts`), faire valider les `// À VALIDER` et relire les pages
  `/mentions-legales` et `/confidentialite`.
- Renseigner `urlSite` : l'indexation s'active d'elle-même.

## Déploiement

Chaque `git push` sur `main` déclenche un déploiement Vercel (production). Les autres branches
donnent une URL de prévisualisation.
