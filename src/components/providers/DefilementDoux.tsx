"use client";

import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore, type ReactNode } from "react";
import Lenis, { type ScrollCallback } from "lenis";
import { LenisContext } from "lenis/react";
import { cancelFrame, frame } from "motion/react";
import { POINTEUR_FIN, useMedia } from "@/components/ui/useMedia";

/*
 * Instance Lenis courante, partagée par un petit magasin externe : le composant
 * la lit avec useSyncExternalStore (aucun setState dans un effet).
 */
let instance: Lenis | undefined;
const abonnes = new Set<() => void>();
function publier(suivante: Lenis | undefined) {
  instance = suivante;
  abonnes.forEach((notifier) => notifier());
}
function abonner(notifier: () => void) {
  abonnes.add(notifier);
  return () => abonnes.delete(notifier);
}

type Rappel = { callback: ScrollCallback; priority: number };

/**
 * Défilement fluide Lenis, seulement à la souris ou au pavé tactile : au doigt,
 * le défilement natif est déjà fluide, et on évite une boucle d'animation
 * permanente sur les téléphones. Lenis avance au rythme de la boucle de Motion
 * (une seule boucle requestAnimationFrame pour toute la page).
 * Expose le même contexte que <ReactLenis> : useLenis() fonctionne partout,
 * et renvoie undefined au doigt.
 */
export function DefilementDoux({ children }: { children: ReactNode }) {
  const pointeurFin = useMedia(POINTEUR_FIN);
  const lenis = useSyncExternalStore(
    abonner,
    () => instance,
    () => undefined,
  );
  const rappels = useRef<Rappel[]>([]);

  useEffect(() => {
    if (!pointeurFin) return;
    const l = new Lenis({
      lerp: 0.11,
      syncTouch: false,
      // Le décalage de l'en-tête vient de scroll-padding-top (globals.css), que Lenis lit déjà
      anchors: true,
      autoRaf: false,
      // respectReducedMotion (vrai par défaut) coupe le lissage si l'appareil le demande
    });
    const avancer = ({ timestamp }: { timestamp: number }) => l.raf(timestamp);
    frame.update(avancer, true);
    const surDefilement: ScrollCallback = (courante) => {
      for (const { callback } of rappels.current) callback(courante);
    };
    l.on("scroll", surDefilement);
    publier(l);
    return () => {
      cancelFrame(avancer);
      l.destroy();
      publier(undefined);
    };
  }, [pointeurFin]);

  const addCallback = useCallback((callback: ScrollCallback, priority: number) => {
    rappels.current = [...rappels.current, { callback, priority }].sort((a, b) => a.priority - b.priority);
  }, []);
  const removeCallback = useCallback((callback: ScrollCallback) => {
    rappels.current = rappels.current.filter((r) => r.callback !== callback);
  }, []);

  const valeur = useMemo(() => (lenis ? { lenis, addCallback, removeCallback } : null), [lenis, addCallback, removeCallback]);

  return <LenisContext.Provider value={valeur}>{children}</LenisContext.Provider>;
}
