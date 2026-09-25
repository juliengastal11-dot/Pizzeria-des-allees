# La Pizzeria des Allées — direction artistique et cahier technique

Piste validée le 25/09/2026 : **« Les Quinze Arches », version nuit**.
Fond **Bleu des Allées**, encre **Calcaire au soleil**, section **La carte** sur **Ciel de Béziers**.
Les formes viennent de Béziers : arches inégales du Pont Vieux, ovales des écluses de Fonseranes, ligne de l'Orb.
La lumière vient de la piste nocturne : le Pont Vieux s'illumine point par point au défilement.

## 1. Règles absolues

- **Aucun élément de Basilic & Co** : ni nom, ni logo, ni textes, ni noms de recettes (Reine, Margherita, Chèvre & Miel, noms de régions…), ni couleurs (vert `#395837`, crème, abricot), ni polices (Lust, Effra), ni feuille de basilic, ni le mot « terroir(s) ».
- **Tout ce qui est modifiable vit dans `src/config/site.ts`**. Aucun texte, lien, horaire, numéro ou chemin d'image en dur dans les composants. Les valeurs inconnues sont des placeholders `[…]` : les afficher avec `<Valeur valeur={…} />` (pointillés), désactiver les liens correspondants (`estPlaceholder`).
- **Pas de cookies de suivi**. Google Maps et TheFork ne se chargent qu'à l'action du visiteur.
- **Mobile d'abord** (390 px). Commander et Réserver toujours accessibles sur mobile.
- Français partout, typographie française : espace insécable ` ` avant `: ; ! ?` et dans « ». Heures « 18 h 30 ». Aucune des deux polices n'a l'espace fine.

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

## 3. Typographie

- **Besley** (`font-display`) : titres, 600-700, italique pour les accroches et le mot mis en valeur. Casse normale, jamais de capitales (elles appartiennent au logo).
- **Figtree** (`font-sans`) : texte 400, libellés et boutons 600-650.
- Échelle : H1 hero clamp(2.6rem → 5.5rem) ; H2 clamp(2.1rem → 3.9rem) (voir `SectionTitre`) ; texte 17 px ; petit texte ≥ 14 px ; surtitres `.surtitre` (13 px, capitales, +0,14 em).
- `text-wrap: balance` sur les titres (déjà global). Chiffres tabulaires (`tabular-nums`) pour horaires et prix.

## 4. Formes

- **Arche** (haut en demi-cercle, bas arrondi 28 px) : photos, cartes pizzas, fenêtre du hero. Pour un rapport largeur/hauteur `r`, rayon : `50% 50% 1.75rem 1.75rem / (50·r)% (50·r)% 1.75rem 1.75rem`. Cadre chêne : `box-shadow: 0 0 0 5px <fond>, 0 0 0 7px var(--color-chene)`.
- **Arches inégales** : les rangées imitent les 15 arches du Pont Vieux (largeurs différentes).
- **Ovales de Fonseranes** : pastilles, étapes, badges.
- **Ligne de l'Orb** : séparateurs `OrbVague` entre fonds de couleurs différentes.
- **Point de lumière** : disque `halo` 3-6 px avec `box-shadow: 0 0 10px 2px rgba(242,211,140,.55)`.
- Aucun angle vif (rayon min. 12 px), aucune grille de boîtes plates, pas de `rounded-lg` partout, pas de numérotation 01/02/03 décorative.

## 5. Ordre et fonds des sections

1. `Hero` — nuit (fenêtre en arche sur la fresque animée + Pont Vieux lumineux avec les CTA)
2. `Histoire` (#histoire) — nuit
3. `Carte` (#carte) — ciel (vague nuit→ciel en haut, ciel→nuit en bas), `data-surface="clair"`
4. `Livraison` (#livraison) — nuit
5. `Salle` (#salle) — minuit (plafond d'où pendent les ampoules)
6. `Fidelite` — masquée tant que `site.fidelite.actif` est faux
7. `Infos` (#infos) — nuit, cartes calcaire-clair
8. `Footer` — minuit, bord supérieur au profil du Pont Vieux

## 6. Mouvement (Motion 13 : `import { … } from "motion/react"`)

- `MotionConfig reducedMotion="user"` est posé dans `Providers` : les transformations sont coupées automatiquement si l'appareil demande moins d'animations. Pour les effets liés au défilement (`useScroll`/`useTransform`), tester `useReducedMotion()` et figer l'état final.
- **transform et opacity uniquement** (pas de width/height/top/filter animés, pas de `backdrop-filter`, pas de `filter: blur` au défilement).
- Apparitions `whileInView` avec `viewport={{ once: true }}`. CTA, prix, horaires, adresse : jamais partir d'une opacité nulle.
- Aucune boucle autonome visible plus de 5 s sans lien avec le défilement (WCAG 2.2.2), à l'exception de la vidéo du hero (décorative, `aria-hidden`, coupée en mouvement réduit).
- Ressorts : boutons `stiffness 500 / damping 30` ; entrées `ease [0.22, 1, 0.36, 1]`.
- Lenis est actif (molette) : ne rien animer en `scroll-behavior: smooth` en plus.

## 7. Accessibilité

- Un seul H1 (hero). Sections avec `aria-labelledby` vers leur H2.
- Images : `alt` depuis la config ; décor en `alt=""` / `aria-hidden`.
- Focus visible (global). Zones tactiles ≥ 44 px. Onglets en `role="tablist"` avec flèches clavier.
- Fenêtres : composant `Fenetre` (dialog natif : piège du focus, Échap, retour du focus).

## 8. Performance

- `next/image` partout (`sizes` précis). `preload` **uniquement** sur le poster du hero. Tout le reste en lazy (défaut).
- Vidéo du hero : `muted autoPlay loop playsInline preload="metadata"`, WebM puis MP4, posée sur le poster ; non chargée si mouvement réduit ou `navigator.connection.saveData` ; mise en pause hors écran.
- Pas de nouvelle dépendance sans raison. Icônes : `lucide-react` (vérifier que l'icône existe dans `node_modules/lucide-react`).

## 9. Briques existantes (à réutiliser, ne pas modifier sans raison)

| Fichier | Rôle |
|---|---|
| `src/config/site.ts` | Configuration unique, `estPlaceholder`, `adresseComplete`, `JOURS`, types `Pizza`, `Photo`, `Jour`, `Creneau` |
| `src/lib/horaires.ts` | `formatCreneaux`, `libelleJour`, `statutOuverture` (client), `maintenantABeziers` |
| `src/components/actions/Boutons.tsx` | `<BoutonCommander variante forme anneau sansIcone className>` et `<BoutonReserver …>` — variantes `or`, `contour`, `nuit`, `contour-nuit` ; formes `pilule`, `arche`, `libre` |
| `src/components/providers/ActionsProvider.tsx` | `useActions()` : `ouvrirReservation`, `ouvrirCommandeBientot`, `ctaHeroVisibles`/`setCtaHeroVisibles`, `fenetreOuverte`, `setMenuOuvert` |
| `src/components/ui/Fenetre.tsx` | Fenêtre modale accessible |
| `src/components/ui/Valeur.tsx` | Affiche une valeur de config, en pointillés si placeholder |
| `src/components/ui/Reveal.tsx` | Apparition au défilement |
| `src/components/ui/SectionTitre.tsx` | Surtitre + H2 masqué + chapô (`surface="clair"` sur fond ciel) |
| `src/components/ui/OrbVague.tsx` | Séparateur vague de l'Orb (`haut`, `bas` = couleurs CSS, ex. `var(--color-nuit)`) |
| `src/components/ui/ArcheImage.tsx` | Photo en arche qui « s'ouvre » |

## 10. Conventions de code

- TypeScript strict, composants serveur par défaut, `"use client"` seulement si nécessaire.
- Classes Tailwind 4 avec les tokens (`bg-nuit`, `text-calcaire`, `border-filet/60`…).
- Gouttière mobile 16-20 px (`px-5`), conteneur `mx-auto max-w-6xl`. Sections `py-24 md:py-32`.
- Commentaires rares et en français, comme dans les fichiers existants.
- Vérifier son travail avec `npx tsc --noEmit` et `npx eslint <fichiers>`. **Ne pas lancer `next build` ni `next dev`** (plusieurs agents travaillent en parallèle).
