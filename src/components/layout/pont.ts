/**
 * Le Pont Vieux dessiné par calcul : tablier à peine bombé, arches inégales
 * (des trous dans la silhouette, règle evenodd) et un réverbère sur chaque pile.
 */
export type Pont = {
  largeur: number;
  hauteur: number;
  silhouette: string;
  /** Arête du parapet, soulignée d'un filet laiton. */
  parapet: string;
  reverberes: string;
  /** Position des lampes en % de la boîte (la silhouette est étirée sans garder ses proportions). */
  lampes: { gauche: number; haut: number }[];
  /** Ligne d'eau de l'Orb. */
  eau: number;
};

type Plan = {
  largeur: number;
  hauteur: number;
  /** Largeurs relatives des arches, volontairement inégales. */
  arches: number[];
  pile: number;
  /** Dessus du tablier aux extrémités. */
  tablier: number;
  /** Montée du tablier au centre. */
  bombement: number;
  epaisseur: number;
  poteau: number;
};

const f = (n: number) => String(Math.round(n * 10) / 10);
const pc = (n: number) => Math.round(n * 1000) / 1000;

function dessiner(p: Plan): Pont {
  const { largeur: W, hauteur: H } = p;
  const culee = p.pile * 1.2;
  const total = p.arches.reduce((s, a) => s + a, 0) + (p.arches.length - 1) * p.pile + 2 * culee;
  const k = W / total;
  const dessus = (x: number) => {
    const t = x / W;
    return p.tablier - 4 * p.bombement * t * (1 - t);
  };
  const demiMax = (Math.max(...p.arches) * k) / 2;

  const chemins = [`M0 ${H}V${f(p.tablier)}Q${f(W / 2)} ${f(p.tablier - 2 * p.bombement)} ${W} ${f(p.tablier)}V${H}Z`];
  const piles = [(culee * k) / 2];
  let x = culee * k;
  p.arches.forEach((a, i) => {
    const w = a * k;
    const demi = w / 2;
    // Les petites arches ont la clé plus basse, comme sur le vrai pont
    const cle = dessus(x + demi) + p.epaisseur + (demiMax - demi) * 0.3;
    const montee = Math.min(demi * 0.9, H - cle - 4);
    const naissance = cle + montee;
    chemins.push(`M${f(x)} ${H}V${f(naissance)}A${f(demi)} ${f(montee)} 0 0 1 ${f(x + w)} ${f(naissance)}V${H}Z`);
    x += w;
    if (i < p.arches.length - 1) {
      piles.push(x + (p.pile * k) / 2);
      x += p.pile * k;
    }
  });
  piles.push(W - (culee * k) / 2);

  const reverberes = piles
    .map((px) => {
      const y = dessus(px);
      return `M${f(px - 0.9)} ${f(y + 1)}V${f(y - p.poteau)}H${f(px + 0.9)}V${f(y + 1)}Z`;
    })
    .join("");

  const lampes = piles.map((px) => ({
    gauche: pc((px / W) * 100),
    haut: pc(((dessus(px) - p.poteau - 1.5) / H) * 100),
  }));

  const parapet = `M0 ${f(p.tablier)}Q${f(W / 2)} ${f(p.tablier - 2 * p.bombement)} ${W} ${f(p.tablier)}`;

  return { largeur: W, hauteur: H, silhouette: chemins.join(""), parapet, reverberes, lampes, eau: H - 3 };
}

/** Mobile : 7 arches. */
export const PONT_COMPACT = dessiner({
  largeur: 520,
  hauteur: 72,
  arches: [62, 76, 58, 88, 68, 80, 56],
  pile: 17,
  tablier: 21,
  bombement: 4,
  epaisseur: 9,
  poteau: 7,
});

/** Tablette et ordinateur : les 15 arches. */
export const PONT_LARGE = dessiner({
  largeur: 1440,
  hauteur: 120,
  arches: [60, 74, 66, 88, 70, 96, 80, 104, 82, 94, 68, 86, 72, 62, 54],
  pile: 22,
  tablier: 34,
  bombement: 7,
  epaisseur: 13,
  poteau: 11,
});

/** Frise des 15 arches (contours seuls) posée sur la barre mobile. */
export const FRISE = (() => {
  const largeurs = [15, 18, 16, 21, 17, 23, 19, 25, 20, 22, 16, 21, 17, 15, 13];
  const ecart = 2.5;
  const H = 12;
  const max = Math.max(...largeurs);
  let x = 0;
  let d = "";
  for (const w of largeurs) {
    const demi = w / 2;
    const cle = 1 + (max - w) * 0.22;
    const naissance = Math.min(cle + demi * 0.6, H - 2);
    d += `M${f(x + 0.5)} ${H}V${f(naissance)}A${f(demi - 0.5)} ${f(naissance - cle)} 0 0 1 ${f(x + w - 0.5)} ${f(naissance)}V${H}`;
    x += w + ecart;
  }
  return { d, largeur: Math.round(x - ecart), hauteur: H };
})();
