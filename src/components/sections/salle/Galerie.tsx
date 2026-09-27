"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as PointeurReact } from "react";
import { motion, useAnimationFrame, useInView, useMotionValue, type PanInfo } from "motion/react";
import { Maximize2 } from "lucide-react";
import { site, type Photo } from "@/config/site";
import { MOUVEMENT_REDUIT, useMedia } from "@/components/sections/histoire/useMedia";
import { Visionneuse } from "./Visionneuse";
import { facteurLargeur, styleCadrage } from "./cadrage";

const TEXTES = site.textes.salle;

// Largeurs relatives des arches, inégales comme celles du Pont Vieux ; toutes ont la même hauteur
const LARGEURS = [1, 1.3, 0.85, 1.15];
/** Rapport largeur / hauteur d'une arche de facteur 1. */
const ELANCEMENT = 0.7;
/** Largeur d'une arche de facteur 1 (variable CSS --base) : mobile, puis à partir de lg. */
const BASE_REM = { mobile: 15, bureau: 18 };
/** Vitesse de la promenade, en px/s : les arches passent de droite à gauche. */
const VITESSE = 24;
/** Freinage de l'élan laissé par un glissé : il n'en reste que 2 % après une seconde. */
const FREIN = 0.02;
/**
 * Copies de la rangée mises bout à bout, revu à la mesure : il en faut assez pour
 * que la boucle ne montre jamais de trou (une rangée plus large que la fenêtre
 * n'en demande que deux), pas plus, pour ménager la mémoire graphique des téléphones.
 */
const COPIES_MIN = 2;

/*
 * `sizes` : toutes les arches ont la même hauteur, donc la photo (paysage,
 * zoomée dans l'arche) est affichée à la même largeur quelle que soit l'arche.
 */
const SIZES = [
  `(min-width: 1024px) ${Math.round(BASE_REM.bureau * 16 * facteurLargeur(ELANCEMENT))}px`,
  `${Math.round(BASE_REM.mobile * 16 * facteurLargeur(ELANCEMENT))}px`,
].join(", ");

/** Arche : haut en demi-cercle quel que soit le rapport largeur / hauteur `r`. */
function rayon(r: number) {
  const v = +Math.min(50, 50 * r).toFixed(2);
  return `50% 50% 1.75rem 1.75rem / ${v}% ${v}% 1.75rem 1.75rem`;
}

/** Variables de taille d'une arche, selon son rang dans la rangée. */
function variablesArche(rang: number): CSSProperties {
  const l = LARGEURS[rang % LARGEURS.length];
  const r = ELANCEMENT * l;
  return { width: `calc(var(--base) * ${l})`, "--ratio": String(+r.toFixed(3)), "--rayon": rayon(r) } as CSSProperties;
}

/** Ramène `v` dans [min, max[ en bouclant. */
function enrouler(min: number, max: number, v: number) {
  const etendue = max - min;
  return ((((v - min) % etendue) + etendue) % etendue) + min;
}

type Props = {
  photos: readonly Photo[];
  /** Titre de la fenêtre d'agrandissement. */
  titreFenetre: string;
};

/**
 * Galerie de la salle et de la terrasse : les photos, en arches cerclées de
 * chêne, défilent en continu comme une promenade le long des tableaux. On peut
 * les glisser à la main (souris ou doigt), ou les arrêter en les survolant ou
 * en leur donnant le focus (pas de bouton pause visible : choix de Julien) ;
 * chacune s'agrandit d'un clic. Mouvement réduit : une rangée fixe, à faire
 * défiler soi-même.
 */
export function Galerie({ photos, titreFenetre }: Props) {
  const [ouverte, setOuverte] = useState<number | null>(null);
  const fermer = useCallback(() => setOuverte(null), []);
  const reduire = useMedia(MOUVEMENT_REDUIT);

  return (
    <div data-animation="galerie-defile" className="mt-10 md:mt-14">
      {reduire ? (
        <RangeeFixe photos={photos} onOuvrir={setOuverte} />
      ) : (
        <Promenade photos={photos} onOuvrir={setOuverte} fenetreOuverte={ouverte !== null} />
      )}
      <Visionneuse photos={photos} index={ouverte} onChanger={setOuverte} onFermer={fermer} titre={titreFenetre} />
    </div>
  );
}

type PropsRangee = { photos: readonly Photo[]; onOuvrir: (i: number) => void };

/** Mouvement réduit : la rangée telle quelle, à faire défiler à la main (carrousel), en une ligne sur grand écran. */
function RangeeFixe({ photos, onOuvrir }: PropsRangee) {
  return (
    <ul
      role="list"
      aria-label={TEXTES.galerie.aria}
      className="-mx-5 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto overscroll-x-contain px-5 pb-4 pt-5 [--base:15rem] [scrollbar-width:none] lg:mx-0 lg:snap-none lg:flex-wrap lg:justify-center lg:gap-6 lg:overflow-visible lg:px-0 lg:[--base:18rem] [&::-webkit-scrollbar]:hidden"
    >
      {photos.map((photo, i) => (
        <li key={photo.src} className="shrink-0 snap-center" style={variablesArche(i)}>
          <ArcheGalerie photo={photo} onOuvrir={() => onOuvrir(i)} />
        </li>
      ))}
    </ul>
  );
}

/** La promenade : la rangée, copiée plusieurs fois bout à bout, glisse en boucle. */
function Promenade({ photos, onOuvrir, fenetreOuverte }: PropsRangee & { fenetreOuverte: boolean }) {
  const fenetre = useRef<HTMLDivElement>(null);
  const premiere = useRef<HTMLUListElement>(null);
  const [copies, setCopies] = useState(COPIES_MIN);
  const enVue = useInView(fenetre, { amount: 0.15 });
  const x = useMotionValue(0);

  // Tout ce que lit la boucle d'animation vit dans des références : aucun rendu à chaque image
  const etat = useRef({ position: 0, largeur: 0, elan: 0, survol: false, focus: false, glisse: false, aGlisse: false });
  const pauses = useRef({ fenetre: false, horsVue: true });
  useEffect(() => {
    pauses.current = { fenetre: fenetreOuverte, horsVue: !enVue };
  }, [fenetreOuverte, enVue]);

  const appliquer = useCallback(() => {
    const e = etat.current;
    x.set(e.largeur ? enrouler(-e.largeur, 0, e.position) : e.position);
  }, [x]);

  // Mesure de la rangée : longueur de la boucle, et nombre de copies pour couvrir la fenêtre
  useEffect(() => {
    const rangee = premiere.current;
    const cadre = fenetre.current;
    if (!rangee || !cadre) return;
    const mesurer = () => {
      const largeur = rangee.offsetWidth;
      etat.current.largeur = largeur;
      if (largeur > 0) setCopies(Math.max(COPIES_MIN, Math.ceil(cadre.clientWidth / largeur) + 1));
      appliquer();
    };
    mesurer();
    const observateur = new ResizeObserver(mesurer);
    observateur.observe(rangee);
    observateur.observe(cadre);
    return () => observateur.disconnect();
  }, [appliquer]);

  useAnimationFrame((_, delta) => {
    const e = etat.current;
    const p = pauses.current;
    if (p.horsVue || !e.largeur) return;
    const dt = Math.min(delta, 64) / 1000;
    let vitesse = 0;
    if (!(p.fenetre || e.survol || e.focus || e.glisse)) vitesse -= VITESSE;
    if (e.elan !== 0) {
      vitesse += e.elan;
      e.elan *= FREIN ** dt;
      if (Math.abs(e.elan) < 6) e.elan = 0;
    }
    if (vitesse === 0) return;
    e.position += vitesse * dt;
    appliquer();
  });

  // Glissé à la main : la rangée suit le doigt, puis garde un peu d'élan
  const debutGlisse = () => {
    const e = etat.current;
    e.glisse = true;
    e.aGlisse = true;
    e.elan = 0;
  };
  const glisse = (_: PointerEvent, info: PanInfo) => {
    etat.current.position += info.delta.x;
    appliquer();
  };
  const finGlisse = (_: PointerEvent, info: PanInfo) => {
    const e = etat.current;
    e.glisse = false;
    e.elan = Math.max(-1400, Math.min(1400, info.velocity.x));
    // Le clic qui suit le relâchement n'ouvre pas la photo (après ce tour de boucle)
    window.setTimeout(() => {
      e.aGlisse = false;
    }, 0);
  };

  return (
    <div role="group" aria-label={TEXTES.galerie.aria}>
      <div ref={fenetre} className="-mx-5 overflow-hidden py-5 lg:mx-0">
        <motion.div
          className="flex w-max cursor-grab select-none [touch-action:pan-y] active:cursor-grabbing"
          style={{ x }}
          onPanStart={debutGlisse}
          onPan={glisse}
          onPanEnd={finGlisse}
          onClickCapture={(ev) => {
            if (etat.current.aGlisse) {
              ev.preventDefault();
              ev.stopPropagation();
            }
          }}
          onPointerEnter={(ev: PointeurReact) => {
            if (ev.pointerType === "mouse") etat.current.survol = true;
          }}
          onPointerLeave={() => {
            etat.current.survol = false;
          }}
          onFocus={() => {
            etat.current.focus = true;
          }}
          onBlur={() => {
            etat.current.focus = false;
          }}
        >
          {Array.from({ length: copies }, (_, k) => (
            <ul
              key={k}
              ref={k === 0 ? premiere : undefined}
              role="list"
              aria-hidden={k > 0 || undefined}
              inert={k > 0 || undefined}
              className="flex shrink-0 items-start gap-4 pr-4 [--base:15rem] lg:gap-6 lg:pr-6 lg:[--base:18rem]"
            >
              {photos.map((photo, i) => (
                <li key={photo.src} className="shrink-0" style={variablesArche(i)}>
                  <ArcheGalerie photo={photo} onOuvrir={() => onOuvrir(i)} />
                </li>
              ))}
            </ul>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

/** Une photo en arche cerclée de chêne, qui s'agrandit d'un clic. */
function ArcheGalerie({ photo, onOuvrir }: { photo: Photo; onOuvrir: () => void }) {
  return (
    <figure>
      <button
        type="button"
        onClick={onOuvrir}
        aria-haspopup="dialog"
        className="group block w-full cursor-zoom-in [border-radius:var(--rayon)] focus-visible:outline-offset-[10px]"
      >
        <span className="relative isolate block overflow-hidden bg-grain shadow-[0_0_0_5px_var(--color-minuit),0_0_0_7px_var(--color-chene)] transition-transform duration-500 ease-out [aspect-ratio:var(--ratio)] [border-radius:var(--rayon)] motion-safe:group-hover:-translate-y-1">
          <span className="absolute inset-0 block transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.04] motion-safe:group-focus-visible:scale-[1.04]">
            <Image src={photo.src} alt={photo.alt} fill sizes={SIZES} draggable={false} className="object-cover" style={styleCadrage(photo.cadrage)} />
          </span>
          {/* Lueur chaude en bas de l'arche, comme sous les ampoules */}
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-minuit/55 to-transparent" />
          <span
            aria-hidden
            className="absolute bottom-3.5 left-1/2 grid size-9 -translate-x-1/2 place-items-center rounded-full border border-filet/70 bg-minuit/80 text-calcaire transition-transform duration-300 ease-out motion-safe:group-hover:scale-110"
          >
            <Maximize2 className="size-4" strokeWidth={2} />
          </span>
        </span>
        <span className="sr-only">{`, ${TEXTES.agrandir}`}</span>
      </button>
      <figcaption className="mt-5 text-center font-accent text-[1.125rem] italic leading-snug text-halo">{photo.legende}</figcaption>
    </figure>
  );
}
