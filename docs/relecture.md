# Mode relecture

Une couche posée sur le site en ligne, pour que le restaurateur relise sans rien
casser : il réécrit les textes, garde ou supprime les animations, commente les
images et n'importe quel bloc, puis copie ses retours en JSON. On colle ce JSON
tel quel dans Claude, qui l'applique.

## Le lien

`https://pizzeria-des-allees.vercel.app/?relecture`

Le mode reste actif pendant la visite, d'une page à l'autre. « Quitter la
relecture » (dans « Retours ») rend le site normal. Les retours sont gardés dans
le navigateur du relecteur : il peut fermer la page et revenir avec le même lien.
Les visiteurs ordinaires ne chargent rien de l'outil.

## Ce qui est « qualifié »

- **Textes** : reconnus par leur valeur dans `src/config/site.ts`. Chaque bloc
  porte `data-relecture-bloc="<chemin>"` pendant la relecture (ex.
  `textes.hero.accroche`, `pizzas[cers].description`, `textes.faq.items[2].reponse`).
  Quand un même texte a plusieurs clés, celle de la section l'emporte
  (`PREFERENCES` dans `src/components/relecture/blocs.ts`).
- **Valeurs à confirmer** (`[À CONFIRMER]`) : trop nombreuses pour être reconnues
  par leur valeur, elles portent leur clé dans le code : `<Valeur cle="legal.siret" … />`.
- **Images** : leur fichier (`/images/…`), et les clés de la config qui le citent.
- **Animations** : `data-animation="<id>"` sur l'élément qui la porte ; la liste,
  avec le nom montré au relecteur, est dans `src/components/relecture/animations.ts`.
  Une nouvelle animation = un attribut + une fiche.

## Le JSON copié

```json
{
  "format": "relecture/pizzeria-des-allees/1",
  "consigne": "…",
  "page": "https://pizzeria-des-allees.vercel.app/",
  "version": "58a2ce2",
  "date": "27 septembre 2026 à 14:32",
  "relecteur": "Prénom",
  "essais": { "couleurs": "Émeraude", "typographie": "Gravure" },
  "textes": [
    { "bloc": "textes.hero.accroche", "section": "Haut de page", "avant": "…", "apres": "…", "remarque": "…" }
  ],
  "animations": [{ "animation": "ampoules", "nom": "Les ampoules du plafond", "decision": "supprimer" }],
  "images": [{ "image": "/images/pizzas/cers.webp", "blocs": ["pizzas[cers].image"], "section": "La carte", "remarque": "…" }],
  "remarques": [{ "section": "La carte", "element": "« … » (bloc)", "selecteur": "#carte > div > p", "remarque": "…" }],
  "remarqueGenerale": "…"
}
```

Pour l'appliquer :

- `textes` : remplacer la valeur de `bloc` dans `site.ts` par `apres`. Un `modele`
  signale un texte à trous (`{n}`, `{commune}`) : garder les repères.
- `animations` : `supprimer` = retirer l'effet (l'élément porte `data-animation="<id>"`) ;
  `garder` = rien à faire.
- `images`, `remarques`, `remarqueGenerale` : des demandes à traiter une à une.
- `essais` : la palette de couleurs et la typographie que le relecteur regardait.
- `version` : le commit qu'il relisait (Vercel) ; si le code a bougé depuis,
  vérifier que `avant` correspond encore.
