"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ClavierReact,
  type ReactNode,
  type RefObject,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
  type PanInfo,
} from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { site, type VueHero } from "@/config/site";
import { useProgressionHero } from "./HeroScene";
import { CIEL_FRESQUE, PAYSAGE, TITRE } from "./geometrie";
import { MOUVEMENT_REDUIT, useMedia } from "@/components/ui/useMedia";
import { useVideoPermise } from "./media";
import styles from "./hero.module.css";

/** Poster, vidéo et horizon partagent le même cadrage : mêmes tailles, même object-cover. */
const TAILLES = "(min-width: 1024px) 540px, (min-width: 640px) 416px, 92vw";

const VUES: readonly VueHero[] = site.hero.vues;
const TEXTES = site.textes.hero.vues;

/** Un glissé change de vue au-delà de cette distance (px) ou de cette vitesse (px/s), comme la visionneuse. */
const GLISSE = { distance: 60, vitesse: 500 };
const RESSORT = { type: "spring", stiffness: 280, damping: 34, restDelta: 0.001 } as const;

const variablesTitre = {
  "--titre-taille": TITRE.taille,
  "--titre-interligne": TITRE.interligne,
  "--titre-gauche": TITRE.gauche,
  "--titre-haut": TITRE.haut,
  "--titre-retrait": TITRE.retraitLigne2,
  "--titre-depart": TITRE.depart,
  "--titre-duree": TITRE.duree,
  "--titre-delai": TITRE.delai,
  "--titre-decalage": TITRE.decalageLigne2,
  "--titre-courbe": TITRE.courbe,
} as CSSProperties;

/** Ramène `v` dans [min, max[ en bouclant. */
function enrouler(min: number, max: number, v: number) {
  const etendue = max - min;
  return ((((v - min) % etendue) + etendue) % etendue) + min;
}

/**
 * La fenêtre en arche. De bas en haut : la vue (poster, vidéo), le titre, puis
 * la ligne d'horizon détourée de la vue s'il y en a une (cathédrale, remparts,
 * colline) qui passe DEVANT le titre : « La Pizzeria des Allées » se lève derrière
 * Saint-Nazaire.
 *
 * Plusieurs vues (mode présentation, voir `site.hero.vues`) : on passe de l'une à
 * l'autre en glissant la fenêtre, avec les flèches ou au clavier ; le titre reste
 * en place, chaque horizon suit sa vue. Seule la vue affichée joue sa vidéo.
 */
export function HeroFenetre({ titreId }: { titreId: string }) {
  const progression = useProgressionHero();
  // Faux au serveur et à l'hydratation : aucun écart, puis la vraie préférence
  const reduire = useMedia(MOUVEMENT_REDUIT);
  const videoPermise = useVideoPermise();
  const yPaysage = useTransform(progression, [0, 1], ["0%", PAYSAGE.yFin]);
  const echellePaysage = useTransform(progression, [0, 1], [1, PAYSAGE.echelleFin]);
  const yTitre = useTransform(progression, [0, 1], ["0%", TITRE.finDefilement]);
  const video = videoPermise && !reduire;

  const arche = useRef<HTMLDivElement>(null);
  const n = VUES.length;
  const plusieurs = n > 1;
  const { position, courante, aller, gestes } = useDefilementVues(n, reduire, arche);

  const surTouche = (e: ClavierReact) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    aller(e.key === "ArrowRight" ? 1 : -1);
  };

  return (
    <motion.div
      ref={arche}
      role={plusieurs ? "group" : undefined}
      aria-roledescription={plusieurs ? "carrousel" : undefined}
      aria-label={plusieurs ? TEXTES.groupe : undefined}
      onKeyDown={plusieurs ? surTouche : undefined}
      {...(plusieurs ? gestes : {})}
      className={[
        styles.arche,
        "relative isolate size-full",
        plusieurs ? "cursor-grab select-none touch-pan-y active:cursor-grabbing" : "",
      ].join(" ")}
      style={{ background: CIEL_FRESQUE }}
    >
      <div className={`${styles.paysage} absolute inset-0`}>
        {/* Un seul calque porte la parallaxe : vues, titre et horizons ne se décalent jamais */}
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{ y: reduire ? 0 : yPaysage, scale: reduire ? 1 : echellePaysage }}
        >
          {VUES.map((vue, i) => (
            <Calque
              key={vue.id}
              position={position}
              index={i}
              n={n}
              active={i === courante}
              libelle={plusieurs ? `${i + 1} ${TEXTES.sur} ${n} : ${vue.nom}` : undefined}
            >
              <Image
                src={vue.poster}
                alt={vue.alt}
                fill
                preload={i === 0}
                sizes={TAILLES}
                draggable={false}
                className="object-cover"
              />
              {video && <VideoVue vue={vue} active={i === courante} />}
            </Calque>
          ))}
          <motion.div className="absolute inset-0" style={{ y: reduire ? 0 : yTitre }}>
            <h1
              id={titreId}
              className={styles.titre}
              style={variablesTitre}
              data-ton={VUES[courante].titreClair ? "clair" : undefined}
            >
              <span className={styles.ligne}>{site.nomLignes[0]}</span>{" "}
              <span className={`${styles.ligne} ${styles.ligne2}`}>{site.nomLignes[1]}</span>
              <span className="sr-only">{site.seo.complementTitre}</span>
            </h1>
          </motion.div>
          {VUES.map(
            (vue, i) =>
              vue.horizon && (
                <Calque key={vue.id} position={position} index={i} n={n} decor>
                  <Image
                    src={vue.horizon}
                    alt=""
                    fill
                    loading={i === 0 ? "eager" : "lazy"}
                    sizes={TAILLES}
                    draggable={false}
                    className="pointer-events-none object-cover"
                  />
                </Calque>
              ),
          )}
        </motion.div>
      </div>

      {plusieurs && <Commandes courante={courante} n={n} onAller={aller} />}
    </motion.div>
  );
}

/**
 * Position de la fenêtre dans les vues, en largeurs de vue (1 = une vue plus
 * loin), non bornée : les vues bouclent. Le doigt ou la souris la déplacent,
 * un ressort la pose ensuite sur la vue la plus proche.
 */
function useDefilementVues(n: number, reduire: boolean, arche: RefObject<HTMLDivElement | null>) {
  const position = useMotionValue(0);
  const [courante, setCourante] = useState(0);
  const cible = useRef(0);
  const depart = useRef(0);
  const animation = useRef<AnimationPlaybackControls | null>(null);

  const viser = useCallback(
    (valeur: number, vitesse = 0) => {
      cible.current = valeur;
      setCourante(enrouler(0, n, valeur));
      animation.current?.stop();
      if (reduire) {
        animation.current = null;
        position.set(valeur);
      } else {
        animation.current = animate(position, valeur, { ...RESSORT, velocity: vitesse });
      }
    },
    [n, position, reduire],
  );

  const aller = useCallback((delta: number) => viser(cible.current + delta), [viser]);

  const largeur = () => arche.current?.offsetWidth || 1;

  const gestes = {
    onPanStart: () => {
      animation.current?.stop();
      depart.current = position.get();
    },
    onPan: (_: PointerEvent, info: PanInfo) => {
      position.set(depart.current - info.offset.x / largeur());
    },
    onPanEnd: (_: PointerEvent, info: PanInfo) => {
      const base = Math.round(depart.current);
      const { x: distance } = info.offset;
      const { x: vitesse } = info.velocity;
      let suivante = base;
      if (distance < -GLISSE.distance || vitesse < -GLISSE.vitesse) suivante = base + 1;
      else if (distance > GLISSE.distance || vitesse > GLISSE.vitesse) suivante = base - 1;
      viser(suivante, -vitesse / largeur());
    },
  };

  return { position, courante, aller, gestes };
}

type PropsCalque = {
  position: MotionValue<number>;
  index: number;
  n: number;
  children: ReactNode;
  /** Vue affichée : les autres sont cachées aux lecteurs d'écran. */
  active?: boolean;
  /** « 2 sur 3 : … », seulement s'il y a plusieurs vues. */
  libelle?: string;
  /** Calque décoratif (horizon) : ni rôle ni libellé. */
  decor?: boolean;
};

/**
 * Une vue posée à sa place : décalée de (index − position) largeurs, ramenée
 * dans [−n/2, n/2[ pour boucler. Le saut d'un bord à l'autre se fait toujours
 * hors de la fenêtre (au moins une largeur de côté), donc invisible.
 */
function Calque({ position, index, n, children, active, libelle, decor }: PropsCalque) {
  const x = useTransform(position, (p) => `${enrouler(-n / 2, n / 2, index - p) * 100}%`);
  return (
    <motion.div
      className="absolute inset-0"
      style={{ x }}
      role={!decor && libelle ? "group" : undefined}
      aria-roledescription={!decor && libelle ? "vue" : undefined}
      aria-label={decor ? undefined : libelle}
      aria-hidden={decor || !active ? true : undefined}
    >
      {children}
    </motion.div>
  );
}

/** Flèches et nom de la vue, en bas de la fenêtre, sur un voile sombre. */
function Commandes({ courante, n, onAller }: { courante: number; n: number; onAller: (delta: number) => void }) {
  const vue = VUES[courante];
  return (
    <div
      className={`${styles.monte} absolute inset-x-0 bottom-0 z-10 flex items-center gap-2 bg-linear-to-t from-minuit/85 via-minuit/45 to-transparent px-2.5 pb-2.5 pt-14`}
      style={{ "--delai": "1.2s" } as CSSProperties}
    >
      <BoutonVue libelle={TEXTES.precedente} onClick={() => onAller(-1)}>
        <ChevronLeft aria-hidden className="size-5" />
      </BoutonVue>
      <p className="min-w-0 flex-1 text-balance text-center leading-tight" aria-live="polite" aria-atomic="true">
        <span className="block font-display text-[0.95rem] italic text-calcaire">{vue.nom}</span>
        <span className="mt-0.5 block text-xs font-semibold tabular-nums text-pierre">
          <span className="sr-only">{`${TEXTES.vue} `}</span>
          {courante + 1}
          <span aria-hidden>{" / "}</span>
          <span className="sr-only">{` ${TEXTES.sur} `}</span>
          {n}
        </span>
      </p>
      <BoutonVue libelle={TEXTES.suivante} onClick={() => onAller(1)}>
        <ChevronRight aria-hidden className="size-5" />
      </BoutonVue>
    </div>
  );
}

function BoutonVue({ libelle, onClick, children }: { libelle: string; onClick: () => void; children: ReactNode }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="grid size-11 shrink-0 place-items-center rounded-full border border-calcaire/30 bg-minuit/55 text-calcaire backdrop-blur-sm transition-colors hover:bg-minuit/80"
    >
      {children}
      <span className="sr-only">{libelle}</span>
    </motion.button>
  );
}

/**
 * La vidéo en boucle d'une vue, posée sur son poster. Jamais rendue côté serveur,
 * ni en mouvement réduit, ni sur un réseau lent. Rien n'est téléchargé
 * (preload="none", pas d'autoplay) avant que la page ait fini de charger, que le
 * hero soit à l'écran et que la vue soit celle affichée ; en pause sinon (aucun
 * bouton pause visible : choix de Julien — la préférence « mouvement réduit »
 * suffit à l'arrêter).
 */
function VideoVue({ vue, active }: { vue: VueHero; active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const etat = useRef({ visible: false, prete: false, active });
  const [lecture, setLecture] = useState(false);

  const synchroniser = useCallback(() => {
    const video = ref.current;
    if (!video) return;
    const { visible, prete, active: affichee } = etat.current;
    if (visible && prete && affichee) video.play().catch(() => {});
    else if (!video.paused) video.pause();
  }, []);

  useEffect(() => {
    etat.current.active = active;
    synchroniser();
  }, [active, synchroniser]);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    let actif = true;

    // Hors de la fenêtre (vue voisine), la vidéo est rognée par l'arche : l'observateur la voit cachée
    const observateur = new IntersectionObserver(([entree]) => {
      etat.current.visible = !!entree?.isIntersecting;
      synchroniser();
    });
    observateur.observe(video);

    // Après le chargement de la page, au premier moment calme : la vidéo ne concurrence pas le poster
    const autoriser = () => {
      const plusTard = (f: () => void) => {
        if ("requestIdleCallback" in window) window.requestIdleCallback(f, { timeout: 2000 });
        else setTimeout(f, 300);
      };
      plusTard(() => {
        if (!actif) return;
        etat.current.prete = true;
        synchroniser();
      });
    };
    if (document.readyState === "complete") autoriser();
    else window.addEventListener("load", autoriser, { once: true });

    return () => {
      actif = false;
      observateur.disconnect();
      window.removeEventListener("load", autoriser);
    };
  }, [synchroniser]);

  return (
    <video
      ref={ref}
      aria-hidden
      tabIndex={-1}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      disableRemotePlayback
      onPlaying={() => setLecture(true)}
      className={`${styles.video} ${lecture ? styles.videoVisible : ""} pointer-events-none absolute inset-0 size-full object-cover`}
    >
      <source src={vue.videoMp4} type="video/mp4" />
      <source src={vue.videoWebm} type="video/webm" />
    </video>
  );
}
