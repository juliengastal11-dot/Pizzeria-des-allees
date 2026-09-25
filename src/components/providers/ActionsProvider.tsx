"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { DialogueCommande } from "@/components/actions/DialogueCommande";
import { DialogueReservation } from "@/components/actions/DialogueReservation";

/** Actions stables (jamais recréées) : les boutons les lisent sans se re-rendre au défilement. */
type Actions = {
  /** Ouvre le widget TheFork dans une fenêtre du site. */
  ouvrirReservation: () => void;
  /** Ouvre la fenêtre d'information quand le lien Obypay n'est pas encore fourni. */
  ouvrirCommandeBientot: () => void;
  /** À appeler par le hero : vrai tant que ses boutons Commander / Réserver sont à l'écran. */
  setCtaHeroVisibles: (v: boolean) => void;
  setMenuOuvert: (v: boolean) => void;
};

/** État qui change au défilement : lu seulement par l'en-tête et la barre mobile. */
type EtatActions = {
  /** Vrai tant que les boutons Commander / Réserver du hero sont visibles à l'écran. */
  ctaHeroVisibles: boolean;
  /** Vrai quand une fenêtre (réservation, commande, menu) est ouverte : la barre mobile se retire. */
  fenetreOuverte: boolean;
};

const ActionsContext = createContext<Actions | null>(null);
const EtatActionsContext = createContext<EtatActions | null>(null);

function elementActif(): HTMLElement | null {
  const actif = document.activeElement;
  return actif instanceof HTMLElement && actif !== document.body ? actif : null;
}

export function ActionsProvider({ children }: { children: ReactNode }) {
  const [reservation, setReservation] = useState(false);
  const [commande, setCommande] = useState(false);
  // Les fenêtres ne sont montées qu'à leur première ouverture (ni HTML serveur, ni hydratation au chargement)
  const [montees, setMontees] = useState({ reservation: false, commande: false });
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [ctaHeroVisibles, setCtaHeroVisibles] = useState(true);
  // Bouton qui a ouvert la fenêtre, relevé au clic : la barre mobile, rendue inerte
  // à l'ouverture, perd le focus avant que la fenêtre ne puisse le noter.
  const declencheur = useRef<HTMLElement | null>(null);

  const actions = useMemo<Actions>(
    () => ({
      ouvrirReservation: () => {
        declencheur.current = elementActif();
        setMontees((m) => (m.reservation ? m : { ...m, reservation: true }));
        setReservation(true);
      },
      ouvrirCommandeBientot: () => {
        declencheur.current = elementActif();
        setMontees((m) => (m.commande ? m : { ...m, commande: true }));
        setCommande(true);
      },
      setCtaHeroVisibles,
      setMenuOuvert,
    }),
    [],
  );

  const etat = useMemo<EtatActions>(
    () => ({ ctaHeroVisibles, fenetreOuverte: reservation || commande || menuOuvert }),
    [ctaHeroVisibles, reservation, commande, menuOuvert],
  );

  const fermerReservation = useCallback(() => setReservation(false), []);
  const fermerCommande = useCallback(() => setCommande(false), []);

  return (
    <ActionsContext.Provider value={actions}>
      <EtatActionsContext.Provider value={etat}>
        {children}
        {montees.reservation && <DialogueReservation ouvert={reservation} onFermer={fermerReservation} retour={declencheur} />}
        {montees.commande && <DialogueCommande ouvert={commande} onFermer={fermerCommande} retour={declencheur} />}
      </EtatActionsContext.Provider>
    </ActionsContext.Provider>
  );
}

/** Ouvrir la réservation, la commande ; signaler le hero et le menu. Valeur stable. */
export function useActions(): Actions {
  const ctx = useContext(ActionsContext);
  if (!ctx) throw new Error("useActions doit être utilisé dans <ActionsProvider>");
  return ctx;
}

/** CTA du hero à l'écran, fenêtre ouverte : pour l'en-tête et la barre mobile seulement. */
export function useEtatActions(): EtatActions {
  const ctx = useContext(EtatActionsContext);
  if (!ctx) throw new Error("useEtatActions doit être utilisé dans <ActionsProvider>");
  return ctx;
}
