# La Pizzeria des Allées — direction artistique et cahier technique

Piste validée le 25/09/2026 : **« Les Quinze Arches », version nuit**.
Fond **Bleu des Allées**, encre **Calcaire au soleil**, section **La carte** sur **Ciel de Béziers**.
Les formes viennent de Béziers : arches inégales du Pont Vieux, ovales des écluses de Fonseranes, ligne de l'Orb.
La lumière vient de la piste nocturne : des lumières s'allument au défilement (pont du hero, pilules Commander / Réserver, plan des Allées, carte de livraison).

## 1. Règles absolues

- **Aucun élément de Basilic & Co** : ni nom, ni logo, ni textes, ni noms de recettes (Reine, Margherita, Chèvre & Miel, noms de régions…), ni couleurs (vert `#395837`, crème, abricot), ni polices (Lust, Effra), ni feuille de basilic, ni le mot « terroir(s) ». ⚠ La fiche TheFork affiche encore l'ancienne enseigne : elle doit être renommée avant la mise en ligne (voir `site.liens.reserver`).
- **Tout ce qui est modifiable vit dans `src/config/site.ts`** : nom, logo, coordonnées, horaires, liens, photos, pizzas, **tous les textes d'interface** (`site.textes.<section>`, `site.textes.actions`, `site.navigation`, `site.textes.pagesLegales`), SEO (`site.seo`) et données légales (`site.legal`). Aucun texte, lien, horaire, numéro ou chemin d'image en dur dans les composants.
  - Les valeurs inconnues sont des placeholders `[…]` : les afficher avec `<Valeur valeur={…} />` (ou `<TexteAvecValeurs texte={…} />` pour une phrase qui en contient), désactiver les liens correspondants (`estPlaceholder`).
  - Les modèles `{mot}` (« Voir {commune} sur la carte ») se remplissent avec `remplir()` de `src/lib/textes.ts`.
  - Seuls restent dans le code : le texte juridique des pages légales (à faire relire), les noms de jours (`src/lib/horaires.ts`) et les coordonnées des communes de livraison (`src/components/sections/livraison/geographie.ts`).
- **Pas de cookies de suivi**. Google Maps (carte des Infos) et TheFork ne se chargent qu'à l'action du visiteur. Seul le fond de carte OpenFreeMap de la section Livraison se charge de lui-même, à l'approche de la section (sans cookie ; l'IP est transmise au serveur de tuiles, c'est écrit dans `/confidentialite`).
- **Mobile d'abord** (390 px, écran utile réel ≈ 390 × 664 avec les barres de Safari). Commander et Réserver toujours accessibles sur mobile.
- Français partout, typographie française :
  - espace insécable avant `: ; ! ?` et dans « », entre un nombre et son unité ; dans `site.ts`, l'écrire ` ` ;
  - apostrophe typographique `’` ; heures « 18 h 30 » ;
  - aucune des deux polices n'a l'espace fine (U+202F) ni le trait d'union insécable (U+2011) : pour empêcher « Paul- / Riquet », écrire `Paul-⁠Riquet` (liant invisible) ;
  - `typographie()` (`src/lib/textes.ts`) corrige en filet de sécurité les titres et chapôs (`SectionTitre`).

## 2. Couleurs (tokens Tailwind 4, définis dans `src/app/globals.css`)

| Token | Hex | Usage | Contraste |
|---|---|---|---|
| `nuit` | #051A4B | Fond principal (Bleu des Allées) | — |
| `minuit` | #060F2E | Fonds profonds : footer, barre mobile, fenêtres, section salle | — |
| `grain` | #13285A | Surfaces de niveau 2 sur le bleu (pastilles, onglets) — toujours bordées de `filet` | 1,18:1 sur nuit |
| `filet` | #A08049 | Contours 1 px des contrôles sur le bleu | 4,5:1 sur nuit |
| `calcaire` | #F1E0C8 | Texte principal sur le bleu | 12,9:1 sur nuit |
| `calcaire-clair` | #FAEEDC | Cartes claires (pizzas, infos) | — |
| `pierre` | #D7B08E | Texte secondaire sur le bleu | 8,3:1 sur nuit |
| `or` | #E9B950 | Bouton Commander (texte nuit, 9,2:1) | — |
| `or-clair` | #F4DA90 | Accents texte, mot mis en valeur, anneau de focus | 12,2:1 sur nuit |
| `halo` | #F2D38C | Points de lumière | déco |
| `ciel` | #88A8DC | Fond de La carte ; texte **nuit** dessus (6,9:1). **Jamais de calcaire sur ciel (1,9:1).** | — |
| `ciel-pale` | #DAE3F5 | Étiquettes sur fond clair | — |
| `eau` | #4A5F77 | Texte secondaire sur fonds clairs | 5,7:1 sur calcaire-clair |
| `orb` | #5F7FA0 | Tracés de rivières | déco |
| `chene` | #C98A35 | Cadre des arches (décor seulement, jamais de texte) | — |
| `vigne` | #6B7020 | Dessins seulement, jamais d'interface | — |

Mot « éteint » (manifeste non révélé) : `#9099B2` (5,9:1 sur nuit). Jamais d'opacité faible sur du texte lisible.
Pilules translucides de la barre mobile (variante `voile` : `minuit/70`, contour `calcaire/25`) : texte calcaire ≥ 5,5:1 au-dessus de n'importe quelle section.

## 3. Typographie

- **Besley** : titres, 600-700, italique pour les accroches et le mot mis en valeur. Casse normale, jamais de capitales (elles appartiennent au logo).
- **Figtree** : texte 400, libellés et boutons 600-650.
- Chaque texte porte un **rôle** (jetons du `@theme` de `globals.css`), jamais une police en dur : `font-titre` (h1, h2 par défaut, grands affichages : manifeste, menu plein écran, chiffres des étapes), `font-soustitre` (h3, h4 par défaut : titres de cartes, noms et prix des pizzas, adresse), `font-accent` (phrases en italique : accroche du hero, ardoises, noms sous les pelles, légendes des photos, avis Google, signature du pied de page), `font-texte` (corps et boutons), `font-petit` (étiquettes des pizzas, légende de la carte, mentions du pied de page, compteurs) et `.surtitre` (police, taille, graisse, espacement et casse réglables par `--surtitre-*`). Par défaut (« Enseigne »), titre, sous-titre et accent sont en Besley, le reste en Figtree.
- Essai en cours (temporaire) : un bandeau en haut du site (`BandeauEssai.tsx`) propose huit palettes de couleurs (`[data-palette]`) et cinq palettes typographiques indépendantes (`[data-typo]`) : Enseigne, Éditorial (Playfair Display, Raleway), Gravure (Cormorant Garamond, Raleway), Ardoise (Fraunces, Caveat, Figtree), Comptoir (Bricolage Grotesque, Instrument Serif, DM Mono). Polices d'essai jamais préchargées.
- Échelle : H1 hero clamp(2.6rem → 5.5rem) ; H2 clamp(2.1rem → 3.9rem) (voir `SectionTitre`) ; texte 17 px ; petit texte ≥ 14 px ; surtitres `.surtitre` (13 px, capitales, +0,14 em).
- `text-wrap: balance` sur les titres (déjà global). Pour maîtriser une coupure, un titre de `site.ts` peut être un tableau de segments (une ligne chacun, ex. le titre de la Salle). Chiffres tabulaires (`tabular-nums`) pour horaires et prix.

## 4. Formes

- **Arche** (haut en demi-cercle, bas arrondi 28 px) : photos, cartes pizzas. Pour un rapport largeur/hauteur `r`, rayon : `50% 50% 1.75rem 1.75rem / (50·r)% (50·r)% 1.75rem 1.75rem`. Cadre chêne : `box-shadow: 0 0 0 5px <fond>, 0 0 0 7px var(--color-chene)`.
- **Arches inégales** : les rangées imitent les 15 arches du Pont Vieux (largeurs différentes).
- **Ovales de Fonseranes** : pastilles, étapes, badges.
- **Ligne de l'Orb** : séparateurs `OrbVague` entre fonds de couleurs différentes.
- **Point de lumière** : disque `halo` 3-6 px avec `box-shadow: 0 0 10px 2px rgba(242,211,140,.55)`.
- Aucun angle vif (rayon min. 12 px), aucune grille de boîtes plates, pas de `rounded-lg` partout, pas de numérotation 01/02/03 décorative.

## 5. Ordre et fonds des sections

1. `Hero` — nuit. **Plus de pizza** (demande du client). Depuis le 27/09 (choix de Julien) : **la fresque de la salle, animée, en paysage sur toute la largeur** (`hero/HeroPaysage.tsx`), élargie en 16:9 par IA à partir de la vidéo 3:4 d'origine. La bande est moins haute que l'écran (effet paysage : 4:5 au plus sur téléphone, 43,3 % de la largeur au-delà). La scène 16:9 la couvre comme un `object-fit: cover`, calée sur la cathédrale (`SCENE` dans `hero/geometrie.ts`) : le nom, posé dans le ciel au-dessus de Saint-Nazaire, **se lève derrière elle** (ligne d'horizon détourée `fresque-paysage-horizon.webp` par-dessus le titre ; seule la zone que le titre traverse est figée, le reste de la vidéo reste vivant). **Plus de bouton pause** (retiré à la demande de Julien — la préférence « mouvement réduit » reste le seul frein). Dessous, le **Pont Vieux dessiné au trait** (un SVG serveur par format, calculé dans `hero/trace.ts` depuis les réglages de `hero/geometrie.ts`). **Deux arches du pont sont les boutons** Commander (or clair, point de lumière) et Réserver (calcaire) : aucun bouton dessiné, l'ouverture de l'arche est la zone cliquable et se remplit de lumière au survol et au focus (`hero/ArchesBoutons.tsx`, `pont.module.css`). Les lumières du pont s'allument jusqu'à Commander à l'arrivée, puis au défilement. Puis la phrase d'accroche, centrée. Les deux autres vues du mode présentation sont parties : les Allées au soleil couchant en fond des Infos, les Allées en plein été retirées du site.
2. `Histoire` (#histoire) — minuit, sous la même voûte d'ampoules que la salle (`salle/Plafond.tsx`). **Raccourcie le 27/09** (demande de Julien : trop d'informations) : le titre « Même adresse, nouvelle enseigne. » et un manifeste de deux ou trois lignes qui s'allume mot à mot (Béziers, allées, platanes en or clair), rien d'autre. Le mur de cadres (pizzas sur pelles, ardoises qui s'écrivent à la main) a été retiré : La carte présente les pizzas juste après. Le Hero remonte sur cette section (marge négative, `z-[1]`, pour que le Pont Vieux morde sur la suite) : Histoire porte `z-[2]` pour rester devant, sinon le haut de la voûte (les ampoules) resterait caché derrière le Hero.
3. `Carte` (#carte) — ciel (vague nuit→ciel en haut, ciel→nuit en bas), `data-surface="clair"`
4. `Livraison` (#livraison) — nuit. Titre « Livraison sur Béziers et alentours ». **Carte de nuit réelle** (MapLibre + tuiles OpenFreeMap, style `public/map/style-nuit.json`) : chaque commune est un point de lumière, la Pizzeria des Allées la plus vive (étiquette sur deux lignes). Pas de contour de zone tant que `livraison.zoneDefinie` est faux : la légende dit « Zone de livraison à définir » (pointillés). Sous la carte, les communes en pilules centrées, sans points ; la liste « Voir … sur la carte » cadre le trajet depuis la pizzeria. Bouton « Commander en livraison » centré sur la page. Onglet « À emporter » : trois écluses qui se remplissent.
5. `Salle` (#salle) — minuit. En fond, **les Allées Paul-Riquet dessinées à la main** (traits calcaire à ~26 % d'opacité) qui se tracent en ~4 s de la statue vers les platanes quand la section arrive à l'écran (`salle/DessinAllees.tsx`, SVG animé chargé comme une image). Voûte en anse de panier d'où pendent les ampoules : elles s'allument, puis **scintillent doucement au hasard**, une à la fois (jamais éteintes, rien en mouvement réduit). Galerie en arches inégales qui **défilent en continu** (promenade à 24 px/s, `salle/Galerie.tsx`) : on peut glisser la rangée à la main (élan freiné), ou l'arrêter en la survolant ou en lui donnant le focus (**pas de bouton pause visible**, choix de Julien) ; mouvement réduit : rangée fixe à faire défiler soi-même. Sous la galerie, **les avis Google** (`salle/AvisGoogle.tsx`, note et témoignages dans `site.avisGoogle`) défilent en continu dans l'**autre sens** (de gauche à droite), mêmes règles de pause. Vague de l'Orb vers les infos.
6. `Fidelite` — masquée tant que `site.fidelite.actif` est faux
7. `Infos` (#infos) — nuit, cartes calcaire-clair. En fond, **les Allées au soleil couchant** (photo de Julien animée, `site.fondInfos`) tournent en boucle sous un voile nuit (léger en haut, où l'on voit la lune et les platanes, franc en bas), cadrées sur le haut sur grand écran (`infos/FondAllees.tsx`) : la vidéo ne se charge qu'à l'approche de la section et s'arrête hors de l'écran. Plan illustré des Allées la nuit (en réserve), **relevé sur OpenStreetMap et la Base Adresse Nationale** : Théâtre au nord, quatre rangées de platanes, statue de Riquet dans sa clairière, place Jean-Jaurès et ses pelouses côté ouest, Plateau des Poètes au sud, et la pizzeria **côté est** (numéros impairs), entre l'avenue Saint-Saëns et la rue Victor-Hugo, qui s'allume en or.
8. `Faq` (#faq) — nuit. Accordéon natif (`<details>`/`<summary>`, `Faq.tsx`) : six questions (`textes.faq.items`), toujours dans le HTML initial (repliées seulement en CSS), reprises telles quelles dans les données structurées `FAQPage` (`faqJsonLd`, `layout.tsx`) — texte identique des deux côtés.
9. `Footer` — minuit, bord supérieur au profil du Pont Vieux

Sur mobile, la **barre Commander / Réserver** est faite de **deux pilules flottantes translucides** (`BarreMobile`) qui **s'allument avec le défilement** : de 0 en haut de page à 1 en bas (Commander prend l'or, Réserver un halo froid ; seule l'opacité de calques superposés varie). Elle se retire tant que les arches-boutons du hero sont à l'écran, devant un bloc qui réunit déjà les deux boutons (`[data-cta-bloc]`, carte Contact) et pendant qu'une fenêtre est ouverte.

## 6. Mouvement (Motion 13 : `import { … } from "motion/react"`)

- `MotionConfig reducedMotion="user"` est posé dans `Providers` : les transformations sont coupées automatiquement si l'appareil demande moins d'animations.
- **Mouvement réduit sans écart d'hydratation** : ne jamais lire `useReducedMotion()` au rendu pour un style visible côté serveur. Utiliser le hook `useMedia(MOUVEMENT_REDUIT)` de `src/components/ui/useMedia.ts` (`useSyncExternalStore`, faux au serveur) ou les variantes CSS `motion-reduce:` / `@media (prefers-reduced-motion: reduce)`. Pour les effets liés au défilement (`useScroll`/`useTransform`), figer l'état final (tout allumé).
- **transform et opacity uniquement** (pas de width/height/top/filter animés, pas de `backdrop-filter`, pas de `filter: blur` au défilement).
- Apparitions : le serveur rend l'état final (lisible sans JS et avant l'hydratation) ; après le montage, un bloc encore sous la ligne de flottaison est placé dans son état de départ puis révélé (`preparerApparition`, `src/components/ui/apparition.ts`). CTA, prix, horaires, adresse : jamais partir d'une opacité nulle.
- Aucune boucle autonome visible plus de 5 s sans moyen de l'arrêter (WCAG 2.2.2) — sauf la vidéo du hero, celle du fond des Infos et les deux promenades de la salle, à la demande de Julien (aucun bouton pause visible) : les vidéos ne jouent pas en mouvement réduit, et les deux promenades s'arrêtent au survol ou au focus (mais pas au doigt, sur tactile — limite acceptée, mouvement lent et non clignotant).
- Ressorts : boutons `stiffness 500 / damping 30` ; entrées `ease [0.22, 1, 0.36, 1]`.
- Lenis n'est actif qu'avec une souris ou un pavé tactile (`DefilementDoux`, pointeur fin) ; au doigt, défilement natif. Ne rien animer en `scroll-behavior: smooth` en plus.

## 7. Accessibilité

- Un seul H1 (hero), complété pour les lecteurs d'écran et les moteurs par `site.seo.complementTitre` (« , pizzeria à Béziers »). Sections avec `aria-labelledby` vers leur H2.
- Images : `alt` depuis la config ; décor en `alt=""` / `aria-hidden`.
- Focus visible (global) et jamais masqué par la barre mobile (`scroll-padding-bottom` sous md). Zones tactiles ≥ 44 px. Onglets en `role="tablist"` avec flèches clavier.
- Fenêtres : composant `Fenetre` (dialog natif : piège du focus, Échap, retour du focus au bouton d'origine, même devenu inerte).
- Carte de livraison : la liste des communes est l'alternative textuelle (boutons « Voir … sur la carte » + phrase annoncée en `aria-live`) ; la carte a un nom (`Map.Title`) et des boutons de 44 px.

## 8. Performance

- `next/image` partout (`sizes` précis). `preload` **uniquement** sur le poster du hero. Tout le reste en lazy (défaut).
- Vidéo du hero : `muted loop playsInline preload="none"`, **sans autoPlay**. `play()` n'est appelé qu'après l'événement `load` et un `requestIdleCallback`, si le hero est à l'écran et que le réseau le permet (ni `saveData`, ni 2G/3G) ; jamais en mouvement réduit ; en pause hors écran ou à la demande.
- Vidéo du fond des Infos : même principe (`preload="none"`, lecture à l'approche de la section, pause hors de l'écran, poster seul en mouvement réduit ou sur réseau lent).
- Carte de livraison : MapLibre et ses CSS ne se chargent qu'à l'approche de la section (`import()` déclenché à 600 px) ; avec l'économiseur de données, seulement au clic « Afficher la carte ». Le travailleur MapLibre est lancé depuis un blob : une future CSP devra autoriser `worker-src blob:` et `https://tiles.openfreemap.org` (`connect-src`, `img-src`).
- Fenêtres (réservation, commande) et menu plein écran ne sont montés qu'à leur première ouverture.
- Pas de nouvelle dépendance sans raison. Icônes : `lucide-react` (vérifier que l'icône existe dans `node_modules/lucide-react`).

## 9. Briques existantes (à réutiliser, ne pas modifier sans raison)

| Fichier | Rôle |
|---|---|
| `src/config/site.ts` | Configuration unique, `estPlaceholder`, `adresseComplete`, `JOURS`, types `Pizza`, `Photo`, `Jour`, `Creneau` |
| `src/lib/textes.ts` | `remplir` (modèles `{mot}`), `typographie`, `morceaux` (placeholders dans une phrase), `dateLisible` |
| `src/lib/metadonnees.ts` | `partage()` : Open Graph et Twitter complets d'une page (image de partage comprise) |
| `src/lib/horaires.ts` | `formatCreneaux`, `libelleJour`, `statutOuverture` (client), `maintenantABeziers` |
| `src/components/actions/Boutons.tsx` | `<BoutonCommander variante forme anneau sansIcone className>` et `<BoutonReserver …>` — variantes `or`, `contour`, `nuit`, `contour-nuit`, `voile` ; formes `pilule`, `arche`, `libre` |
| `src/components/providers/ActionsProvider.tsx` | `useActions()` (stable) : `ouvrirReservation`, `ouvrirCommandeBientot`, `setCtaHeroVisibles`, `setMenuOuvert` ; `useEtatActions()` : `ctaHeroVisibles`, `fenetreOuverte` |
| `src/components/ui/Fenetre.tsx` | Fenêtre modale accessible |
| `src/components/ui/Valeur.tsx` | `Valeur` (valeur de config, en pointillés si placeholder) et `TexteAvecValeurs` |
| `src/components/ui/useMedia.ts` | `useMedia(requête)` sûr à l'hydratation, `MOUVEMENT_REDUIT` |
| `src/components/ui/Reveal.tsx`, `apparition.ts` | Apparition au défilement, sans état invisible au rendu serveur |
| `src/components/ui/SectionTitre.tsx` | Surtitre + H2 masqué + chapô (`surface="clair"` sur fond ciel) ; titre en chaîne ou en segments |
| `src/components/ui/OrbVague.tsx` | Séparateur vague de l'Orb (`haut`, `bas` = couleurs CSS, ex. `var(--color-nuit)`) |
| `src/components/ui/ArcheImage.tsx` | Photo en arche qui « s'ouvre » |
| `src/components/sections/hero/geometrie.ts` | Réglages du pont (portées, piles, reflets, lumières, allumage) et du titre du hero |
| `src/components/sections/livraison/geographie.ts` | Coordonnées des communes livrées, zone, trajets, distances |

## 10. Conventions de code

- TypeScript strict, composants serveur par défaut, `"use client"` seulement si nécessaire.
- Classes Tailwind 4 avec les tokens (`bg-nuit`, `text-calcaire`, `border-filet/60`…).
- Gouttière mobile 16-20 px (`px-5`), conteneur `mx-auto max-w-6xl`. Sections `py-24 md:py-32`.
- Commentaires rares et en français, comme dans les fichiers existants.
- Vérifier son travail avec `npx tsc --noEmit` et `npx eslint <fichiers>`. **Ne pas lancer `next build` ni `next dev`** (plusieurs agents travaillent en parallèle).
