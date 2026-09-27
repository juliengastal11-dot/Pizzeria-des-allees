import type { CSSProperties, ReactNode } from "react";
import { ArchesBoutons, type BoiteArche } from "./ArchesBoutons";
import { PontScene } from "./PontScene";
import { PLANS, type ArcheBouton, type PlanPont } from "./trace";
import type { Variante } from "./geometrie";
import styles from "./pont.module.css";

const px = (v: number) => `${v}px`;

/** Marqueurs posés sur chaque sommet d'un chemin : un seul élément dessine tous les points d'une travée. */
const marqueurs = (id: string) => ({ markerStart: `url(#${id})`, markerMid: `url(#${id})`, markerEnd: `url(#${id})` });

/** Un point de lumière centré sur le sommet (le marqueur a sa propre fenêtre, sans débordement). */
function Marqueur({ id, rayon, children }: { id: string; rayon: number; children: ReactNode }) {
  const cote = rayon * 2;
  return (
    <marker id={id} markerUnits="userSpaceOnUse" markerWidth={cote} markerHeight={cote} refX={rayon} refY={rayon} orient="0">
      {children}
    </marker>
  );
}

/**
 * Le Pont Vieux au trait pour un format d'écran : rendu une fois côté serveur,
 * sans aucun composant animé. Les lumières suivent la variable CSS --p
 * (progression du hero) posée par PontScene.
 */
function DessinPont({ plan, variante }: { plan: PlanPont; variante: Variante }) {
  const id = `pont-${variante}`;
  const { coeur, halo } = plan.feu;
  const profondeur = plan.hauteur - plan.eau;

  return (
    <svg
      aria-hidden
      focusable="false"
      width={plan.largeur}
      height={plan.hauteur}
      viewBox={`0 0 ${plan.largeur} ${plan.hauteur}`}
      className={`${styles.dessin} ${styles[variante]}`}
    >
      <defs>
        <radialGradient id={`${id}-lueur`}>
          <stop offset="0" stopColor="#f2d38c" stopOpacity="0.62" />
          <stop offset="0.4" stopColor="#f2d38c" stopOpacity="0.24" />
          <stop offset="1" stopColor="#f2d38c" stopOpacity="0" />
        </radialGradient>
        <Marqueur id={`${id}-halo`} rayon={halo}>
          <circle cx={halo} cy={halo} r={halo} fill={`url(#${id}-lueur)`} />
        </Marqueur>
        <Marqueur id={`${id}-coeur`} rayon={coeur}>
          <circle cx={coeur} cy={coeur} r={coeur} fill="#f2d38c" />
        </Marqueur>
        {/* Sur l'eau, la lumière s'étire à la verticale */}
        <Marqueur id={`${id}-sillage`} rayon={halo * 1.4}>
          <ellipse cx={halo * 1.4} cy={halo * 1.4} rx={halo * 0.55} ry={halo * 1.4} fill={`url(#${id}-lueur)`} />
          <ellipse cx={halo * 1.4} cy={halo * 1.4} rx={coeur * 0.7} ry={coeur * 2.6} fill="#f2d38c" fillOpacity="0.8" />
        </Marqueur>
        {/* Les reflets s'effacent dans la profondeur de l'Orb */}
        <linearGradient id={`${id}-profondeur`} gradientUnits="userSpaceOnUse" x1="0" y1={plan.eau} x2="0" y2={plan.hauteur}>
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`${id}-eau`} maskUnits="userSpaceOnUse" x="0" y={plan.eau} width={plan.largeur} height={profondeur}>
          <rect x="0" y={plan.eau} width={plan.largeur} height={profondeur} fill={`url(#${id}-profondeur)`} />
        </mask>
      </defs>

      {/* Sous l'eau : reflets des arches et des lumières */}
      <g mask={`url(#${id}-eau)`}>
        <path d={plan.corpsReflet} fillRule="evenodd" className={styles.corpsReflet} />
        <path d={plan.reflets} className={`${styles.trait} ${styles.reflet}`} />
        <path d={plan.boutons.commander.reflet} className={`${styles.trait} ${styles.refletBouton}`} />
        <path d={plan.boutons.reserver.reflet} className={`${styles.trait} ${styles.refletBouton}`} />
        {plan.rides.map((ride) => (
          <path
            key={ride.d}
            d={ride.d}
            className={`${styles.trait} ${ride.orb ? styles.rideOrb : styles.ride}`}
            strokeDasharray={ride.tirets}
            strokeDashoffset={ride.decalage}
          />
        ))}
        {plan.travees.map((t, i) => (
          <g key={i} className={`${styles.travee} ${t.delai !== null ? styles.auChargement : ""}`} style={varsTravee(t)}>
            <path d={t.reflets} className={styles.sillages} {...marqueurs(`${id}-sillage`)} />
          </g>
        ))}
      </g>

      {/* Le pont : maçonnerie pleine évidée par les arches, puis le trait */}
      <path d={plan.corps} fillRule="evenodd" className={styles.corps} />
      <path d={plan.parapet} className={`${styles.trait} ${styles.parapet}`} />
      <path d={plan.cordon} className={`${styles.trait} ${styles.cordon}`} />
      <path d={plan.extrados} className={`${styles.trait} ${styles.extrados}`} />
      <path d={plan.oculi} className={`${styles.trait} ${styles.oculus}`} />
      <path d={plan.becs} className={`${styles.trait} ${styles.bec}`} />
      <path d={plan.intrados} className={`${styles.trait} ${styles.intrados}`} />

      {/* Les deux arches-boutons : plus claires, et or-clair au survol ou au focus */}
      {(["commander", "reserver"] as const).map((cta) => (
        <g key={cta}>
          <path d={plan.boutons[cta].extrados} className={`${styles.trait} ${styles.extradosBouton}`} />
          <path d={plan.boutons[cta].intrados} className={`${styles.trait} ${styles.intradosBouton}`} />
          <path
            d={`${plan.boutons[cta].intrados}${plan.boutons[cta].extrados}`}
            className={`${styles.trait} ${styles.surbrillance} ${cta === "commander" ? styles.surbrillanceCommander : styles.surbrillanceReserver}`}
          />
        </g>
      ))}

      <path d={plan.ligneEau} className={`${styles.trait} ${styles.eau}`} />

      {/* Lumières : halo et cœur, travée par travée */}
      {plan.travees.map((t, i) => (
        <g key={i} className={`${styles.travee} ${t.delai !== null ? styles.auChargement : ""}`} style={varsTravee(t)}>
          <path d={t.feux} className={styles.halos} {...marqueurs(`${id}-halo`)} />
          <path d={t.feux} className={styles.coeurs} {...marqueurs(`${id}-coeur`)} />
        </g>
      ))}
    </svg>
  );
}

/** Seules les mesures de l'ouverture partent vers le client. */
const boite = ({ gauche, haut, largeur, hauteur, rayon, centreLibelle }: ArcheBouton): BoiteArche => ({
  gauche,
  haut,
  largeur,
  hauteur,
  rayon,
  centreLibelle,
});

const varsTravee = (t: PlanPont["travees"][number]) =>
  ({ "--d": t.debut, ...(t.delai !== null ? { "--delai": `${t.delai}s` } : {}) }) as CSSProperties;

/**
 * Le Pont Vieux de Béziers dessiné au trait, posé sur l'Orb, avec le reflet de
 * chaque arche. Commander et Réserver sont deux de ses arches : pas de bouton
 * dessiné, l'ouverture de l'arche est la zone cliquable. Les lumières courent
 * jusqu'à Commander à l'arrivée, puis s'allument vers la droite au défilement.
 *
 * Deux dessins (téléphone ; tablette et ordinateur) : celui qui ne sert pas est
 * masqué en CSS, sans rien à animer ni à abonner.
 */
export function PontLumineux({ className }: { className?: string }) {
  const { mobile, large } = PLANS;
  const variables = {
    "--pm-l": px(mobile.largeur),
    "--pm-h": px(mobile.hauteur),
    "--pl-l": px(large.largeur),
    "--pl-h": px(large.hauteur),
  } as CSSProperties;

  return (
    <PontScene className={`${styles.pont} ${className ?? ""}`} style={variables}>
      <div data-animation="pont-lumieres" className={styles.boite}>
        <DessinPont plan={mobile} variante="mobile" />
        <DessinPont plan={large} variante="large" />
        <ArchesBoutons
          commander={{ mobile: boite(mobile.boutons.commander), large: boite(large.boutons.commander) }}
          reserver={{ mobile: boite(mobile.boutons.reserver), large: boite(large.boutons.reserver) }}
        />
      </div>
    </PontScene>
  );
}
