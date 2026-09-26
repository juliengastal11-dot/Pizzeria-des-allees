"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Fenetre } from "@/components/ui/Fenetre";
import { site, type Photo } from "@/config/site";

type Props = {
  photos: readonly Photo[];
  /** Photo affichée (index dans `photos`), `null` = fermée. */
  index: number | null;
  onChanger: (index: number) => void;
  onFermer: () => void;
  titre: string;
};

const { lieux } = site.textes.salle;
const TEXTES = site.textes.salle.visionneuse;

const glisse: Variants = {
  entree: (sens: number) => ({ x: sens * 56, opacity: 0 }),
  centre: { x: 0, opacity: 1 },
  sortie: (sens: number) => ({ x: sens * -56, opacity: 0 }),
};

/** Grande photo dans une fenêtre : boutons, flèches du clavier et glissé du doigt. */
export function Visionneuse({ photos, index, onChanger, onFermer, titre }: Props) {
  const n = photos.length;
  const [sens, setSens] = useState(1);
  // Garde la dernière photo pendant l'animation de fermeture
  const [derniere, setDerniere] = useState(0);
  if (index !== null && index !== derniere) setDerniere(index);
  // À chaque ouverture, on repart d'un sens neutre (pas celui de la visite précédente)
  const [etaitOuverte, setEtaitOuverte] = useState(false);
  if ((index !== null) !== etaitOuverte) {
    setEtaitOuverte(index !== null);
    if (index !== null) setSens(1);
  }

  const courant = Math.min(index ?? derniere, Math.max(0, n - 1));
  const photo = photos[courant];
  const plusieurs = n > 1;

  const aller = (delta: number) => {
    if (!plusieurs || index === null) return;
    setSens(delta);
    onChanger((index + delta + n) % n);
  };

  useEffect(() => {
    if (index === null || n < 2) return;
    const touche = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const delta = e.key === "ArrowRight" ? 1 : -1;
      setSens(delta);
      onChanger((index + delta + n) % n);
    };
    window.addEventListener("keydown", touche);
    return () => window.removeEventListener("keydown", touche);
  }, [index, n, onChanger]);

  return (
    <Fenetre ouvert={index !== null} onFermer={onFermer} titre={titre} large>
      {photo && (
        <>
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-minuit">
            {/* Nouvelle instance à chaque ouverture : la photo demandée apparaît directement,
                sans que l'ancienne ne glisse dehors ; les glissés restent pour la navigation. */}
            <AnimatePresence key={index === null ? "fermee" : "ouverte"} initial={false} custom={sens}>
              <motion.div
                key={photo.src}
                custom={sens}
                variants={glisse}
                initial="entree"
                animate="centre"
                exit="sortie"
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className={`absolute inset-0 ${plusieurs ? "cursor-grab active:cursor-grabbing" : ""}`}
                drag={plusieurs ? "x" : false}
                dragSnapToOrigin
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60 || info.velocity.x < -500) aller(1);
                  else if (info.offset.x > 60 || info.velocity.x > 500) aller(-1);
                }}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 640px) 40rem, 100vw"
                  draggable={false}
                  className="pointer-events-none select-none object-contain"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3 px-4 py-4 sm:px-6">
            {plusieurs && (
              <BoutonNav libelle={TEXTES.precedente} onClick={() => aller(-1)}>
                <ChevronLeft aria-hidden className="size-5" />
              </BoutonNav>
            )}
            <div className="min-w-0 flex-1 text-center" aria-live="polite" aria-atomic="true">
              <p className="font-accent text-xl italic leading-snug text-halo">{photo.legende}</p>
              <p className="mt-1 font-petit text-sm text-pierre tabular-nums">
                {lieux[photo.lieu]}
                {plusieurs && (
                  <>
                    <span aria-hidden> · </span>
                    <span className="sr-only">{`, ${TEXTES.photo} `}</span>
                    {courant + 1}
                    <span aria-hidden>{" / "}</span>
                    <span className="sr-only">{` ${TEXTES.sur} `}</span>
                    {n}
                  </>
                )}
              </p>
            </div>
            {plusieurs && (
              <BoutonNav libelle={TEXTES.suivante} onClick={() => aller(1)}>
                <ChevronRight aria-hidden className="size-5" />
              </BoutonNav>
            )}
          </div>
        </>
      )}
    </Fenetre>
  );
}

function BoutonNav({ libelle, onClick, children }: { libelle: string; onClick: () => void; children: ReactNode }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="grid size-11 shrink-0 place-items-center rounded-full border border-filet/70 text-calcaire transition-colors hover:bg-grain"
    >
      {children}
      <span className="sr-only">{libelle}</span>
    </motion.button>
  );
}
