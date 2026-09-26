"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useAnimationFrame, useInView, useMotionValue } from "motion/react";
import { ArrowUpRight, Star } from "lucide-react";
import { site } from "@/config/site";
import { remplir } from "@/lib/textes";
import { MOUVEMENT_REDUIT, useMedia } from "@/components/sections/histoire/useMedia";

const TEXTES = site.textes.salle.avisGoogle;
const { note: NOTE, nombreAvis: NOMBRE_AVIS, temoignages: TEMOIGNAGES } = site.avisGoogle;

/** Vitesse de la promenade, en px/s : les avis passent de gauche à droite (sens inverse des photos). */
const VITESSE = 20;
const COPIES_MIN = 2;

/** Ramène `v` dans [min, max[ en bouclant (une valeur croissante donne un défilement vers la droite). */
function enrouler(min: number, max: number, v: number) {
  const etendue = max - min;
  return ((((v - min) % etendue) + etendue) % etendue) + min;
}

const noteAffichee = NOTE.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const nombreAffiche = NOMBRE_AVIS.toLocaleString("fr-FR");

function Etoiles({ note, className }: { note: number; className?: string }) {
  return (
    <span aria-hidden className={`inline-flex items-center gap-0.5 text-or ${className ?? ""}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className="size-3.5 shrink-0" strokeWidth={2} fill={i < Math.round(note) ? "currentColor" : "none"} />
      ))}
    </span>
  );
}

/**
 * Avis Google : la note moyenne et son lien vers la fiche, puis les témoignages
 * qui défilent en continu de gauche à droite (sens inverse de la galerie de
 * photos juste au-dessus), à l'arrêt au survol, au focus, ou hors de l'écran.
 * Mouvement réduit : une rangée fixe, à faire défiler soi-même.
 */
export function AvisGoogle({ className }: { className?: string }) {
  const reduire = useMedia(MOUVEMENT_REDUIT);

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-center">
        <span className="inline-flex items-center gap-2 text-[0.9375rem] font-semibold text-calcaire">
          <Etoiles note={NOTE} />
          {noteAffichee}
        </span>
        <a
          href={site.liens.avisGoogle}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex min-h-11 items-center gap-1 font-petit text-[0.9375rem] text-pierre underline decoration-filet decoration-1 underline-offset-4 transition-colors duration-200 hover:text-or-clair hover:decoration-or-clair"
        >
          {remplir(TEXTES.lien, { n: nombreAffiche })}
          <ArrowUpRight aria-hidden className="size-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          <span className="sr-only">{` ${site.textes.actions.nouvelOnglet}`}</span>
        </a>
      </div>

      {reduire ? <RangeeFixeAvis /> : <PromenadeAvis />}
    </div>
  );
}

/** Une carte de témoignage, comme une petite ardoise de laiton. */
function CarteAvis({ t }: { t: (typeof TEMOIGNAGES)[number] }) {
  return (
    <figure className="flex h-full w-72 shrink-0 flex-col rounded-[1.5rem] border border-filet/60 bg-grain px-5 py-4.5">
      <Etoiles note={t.note} className="shrink-0" />
      <blockquote className="mt-2.5 flex-1 font-accent text-[1.0625rem] italic leading-snug text-calcaire">“{t.texte}”</blockquote>
      <figcaption className="mt-3 flex items-center gap-1.5 font-petit text-[0.8125rem] text-pierre">
        <span className="font-semibold text-or-clair">{t.auteur}</span>
        {TEXTES.origine}
      </figcaption>
    </figure>
  );
}

/** Mouvement réduit : la rangée telle quelle, à faire défiler à la main. */
function RangeeFixeAvis() {
  return (
    <ul
      role="list"
      aria-label={TEXTES.aria}
      className="-mx-5 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-5 pb-2 [scrollbar-width:none] lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {TEMOIGNAGES.map((t) => (
        <li key={t.auteur} className="snap-center">
          <CarteAvis t={t} />
        </li>
      ))}
    </ul>
  );
}

/** La promenade : la rangée, copiée plusieurs fois bout à bout, glisse en boucle vers la droite. */
function PromenadeAvis() {
  const fenetre = useRef<HTMLDivElement>(null);
  const premiere = useRef<HTMLUListElement>(null);
  const [copies, setCopies] = useState(COPIES_MIN);
  const enVue = useInView(fenetre, { amount: 0.15 });
  const x = useMotionValue(0);

  const etat = useRef({ position: 0, largeur: 0, survol: false, focus: false });
  const pauses = useRef({ horsVue: true });
  useEffect(() => {
    pauses.current = { horsVue: !enVue };
  }, [enVue]);

  const appliquer = useCallback(() => {
    const e = etat.current;
    x.set(e.largeur ? enrouler(-e.largeur, 0, e.position) : e.position);
  }, [x]);

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
    if (p.horsVue || !e.largeur || e.survol || e.focus) return;
    const dt = Math.min(delta, 64) / 1000;
    // Position croissante : le sens inverse de la galerie de photos, juste au-dessus
    e.position += VITESSE * dt;
    appliquer();
  });

  return (
    <div ref={fenetre} role="group" aria-label={TEXTES.aria} className="-mx-5 mt-6 overflow-hidden lg:mx-0">
      <motion.div
        className="flex w-max"
        style={{ x }}
        onPointerEnter={(ev) => {
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
            className="flex shrink-0 gap-4 pr-4"
          >
            {TEMOIGNAGES.map((t) => (
              <li key={t.auteur} className="shrink-0">
                <CarteAvis t={t} />
              </li>
            ))}
          </ul>
        ))}
      </motion.div>
    </div>
  );
}
