"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { DialogueCommande } from "@/components/actions/DialogueCommande";
import { DialogueReservation } from "@/components/actions/DialogueReservation";

type Actions = {
  /** Ouvre le widget TheFork dans une fenêtre du site. */
  ouvrirReservation: () => void;
  /** Ouvre la fenêtre d'information quand le lien Obypay n'est pas encore fourni. */
  ouvrirCommandeBientot: () => void;
  /** Vrai tant que les boutons Commander / Réserver du hero sont visibles à l'écran. */
  ctaHeroVisibles: boolean;
  setCtaHeroVisibles: (v: boolean) => void;
  /** Vrai quand une fenêtre (réservation, commande, menu) est ouverte : la barre mobile se retire. */
  fenetreOuverte: boolean;
  setMenuOuvert: (v: boolean) => void;
};

const ActionsContext = createContext<Actions | null>(null);

export function ActionsProvider({ children }: { children: ReactNode }) {
  const [reservation, setReservation] = useState(false);
  const [commande, setCommande] = useState(false);
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [ctaHeroVisibles, setCtaHeroVisibles] = useState(true);

  const ouvrirReservation = useCallback(() => setReservation(true), []);
  const ouvrirCommandeBientot = useCallback(() => setCommande(true), []);

  const value = useMemo<Actions>(
    () => ({
      ouvrirReservation,
      ouvrirCommandeBientot,
      ctaHeroVisibles,
      setCtaHeroVisibles,
      fenetreOuverte: reservation || commande || menuOuvert,
      setMenuOuvert,
    }),
    [ouvrirReservation, ouvrirCommandeBientot, ctaHeroVisibles, reservation, commande, menuOuvert],
  );

  return (
    <ActionsContext.Provider value={value}>
      {children}
      <DialogueReservation ouvert={reservation} onFermer={() => setReservation(false)} />
      <DialogueCommande ouvert={commande} onFermer={() => setCommande(false)} />
    </ActionsContext.Provider>
  );
}

export function useActions(): Actions {
  const ctx = useContext(ActionsContext);
  if (!ctx) throw new Error("useActions doit être utilisé dans <ActionsProvider>");
  return ctx;
}
